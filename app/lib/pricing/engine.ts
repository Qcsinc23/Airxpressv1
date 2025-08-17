// app/lib/pricing/engine.ts
// Core pricing calculation engine with markup application

import { 
  PricingPolicy, 
  CostBreakdown, 
  SellBreakdown, 
  CostCalculationInput,
  ComponentPricing,
  Tariff,
  TariffBand,
  PackagingSKU,
  AccessorialFee
} from './types';

export class PricingEngine {
  private policy: PricingPolicy;
  private tariffs: Map<string, Tariff> = new Map();
  private packagingSKUs: Map<string, PackagingSKU> = new Map();

  constructor(policy: PricingPolicy) {
    this.policy = policy;
    this.loadDefaultPackagingSKUs();
  }

  private loadDefaultPackagingSKUs() {
    // Load default packaging SKUs (same as in packaging API)
    const defaultPackaging = [
      {
        id: 'sku_plastic_barrel_45l',
        name: 'Plastic Barrel - 45L',
        description: 'Heavy duty plastic barrel for general cargo',
        costUSD: 12.50,
        category: 'barrel' as const,
        specifications: {
          maxWeightKg: 30,
          dimensionsCm: { length: 60, width: 40, height: 40 },
          material: 'High-density polyethylene',
        }
      },
      {
        id: 'sku_fiber_barrel_60l',
        name: 'Fiber Barrel - 60L',
        description: 'Eco-friendly fiber barrel for food items',
        costUSD: 15.75,
        category: 'barrel' as const,
        specifications: {
          maxWeightKg: 35,
          dimensionsCm: { length: 65, width: 45, height: 45 },
          material: 'Recycled cardboard fiber',
        }
      },
      {
        id: 'sku_econtainer_small',
        name: 'E-Container Small',
        description: 'Reusable container for multiple shipments',
        costUSD: 25.00,
        category: 'container' as const,
        specifications: {
          maxWeightKg: 40,
          dimensionsCm: { length: 70, width: 50, height: 35 },
          material: 'Reinforced polypropylene',
        }
      },
      {
        id: 'sku_mini_econ',
        name: 'Mini E-Container',
        description: 'Compact container for small items',
        costUSD: 18.00,
        category: 'container' as const,
        specifications: {
          maxWeightKg: 20,
          dimensionsCm: { length: 50, width: 35, height: 25 },
          material: 'Reinforced polypropylene',
        }
      },
      {
        id: 'sku_fragile_protection',
        name: 'Fragile Item Protection',
        description: 'Extra padding and protection for delicate items',
        costUSD: 8.50,
        category: 'protection' as const,
        specifications: {
          maxWeightKg: 50,
          dimensionsCm: { length: 100, width: 100, height: 100 },
          material: 'Bubble wrap and foam inserts',
        }
      }
    ];

    for (const pkg of defaultPackaging) {
      this.packagingSKUs.set(pkg.id, {
        id: pkg.id,
        code: pkg.id,
        name: pkg.name,
        description: pkg.description,
        category: pkg.category,
        costUSD: pkg.costUSD,
        specifications: pkg.specifications,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }

  /**
   * Calculate cost breakdown using tariff rates
   */
  async calculateCost(input: CostCalculationInput): Promise<CostBreakdown> {
    const tariff = await this.findApplicableTariff(input.origin, input.destination);
    if (!tariff) {
      throw new Error(`No tariff found for route ${input.origin} -> ${input.destination}`);
    }

    // Calculate total weight and chargeable weight
    const totalWeightKg = input.pieces.reduce((sum, piece) => sum + piece.weightKg, 0);
    const chargeableWeightKg = this.calculateChargeableWeight(input.pieces);

    // Check eligibility for JetPak vs General Air
    this.validateEligibility(input.pieces, tariff);

    // Find applicable tariff band
    const band = this.findTariffBand(tariff, chargeableWeightKg);

    // Calculate freight cost
    let freightCost = band.rateUSD;

    // Calculate overweight cost
    let overweightCost = 0;
    const overweightKg = Math.max(0, chargeableWeightKg - band.maxWeightKg);
    if (overweightKg > 0) {
      overweightCost = overweightKg * tariff.overweightRatePerKg;
    }

    // Calculate packaging cost
    let packagingCost = 0;
    const packagingSKUs: PackagingSKU[] = [];
    if (input.packaging) {
      for (const skuId of input.packaging) {
        const sku = this.packagingSKUs.get(skuId);
        if (sku) {
          packagingCost += sku.costUSD;
          packagingSKUs.push(sku);
        }
      }
    }

    // Calculate storage cost (if applicable)
    let storageCost = 0;
    if (input.storagedays && input.storagedays > 7) {
      const storageDays = input.storagedays - 7; // First 7 days free
      storageCost = storageDays * 2.50 * input.pieces.length; // $2.50 per piece per day
    }

    const subtotal = freightCost + overweightCost + packagingCost + storageCost;

    return {
      freight: freightCost,
      overweight: overweightCost,
      packaging: packagingCost,
      storage: storageCost,
      pickup: 0, // Not implemented for JetPak
      delivery: 0, // Not implemented for JetPak
      subtotal,
      tariffId: tariff.id,
      chargeableWeightKg,
      calculations: {
        totalWeightKg,
        totalVolumeM3: this.calculateVolume(input.pieces),
        isOverweight: overweightKg > 0,
        overweightKg,
        appliedBand: band,
        packagingSKUs,
      }
    };
  }

  /**
   * Apply markup policy to cost breakdown to get sell prices
   */
  applyMarkup(
    costBreakdown: CostBreakdown, 
    paidOutsideUSA: boolean = false,
    customPolicy?: Partial<PricingPolicy>
  ): SellBreakdown {
    const policy = customPolicy ? { ...this.policy, ...customPolicy } : this.policy;

    // Apply component markups
    const sellFreight = this.applyComponentMarkup(
      costBreakdown.freight, 
      policy.components.freight
    );
    
    const sellOverweight = this.applyComponentMarkup(
      costBreakdown.overweight, 
      policy.components.overweight
    );
    
    const sellPackaging = this.applyComponentMarkup(
      costBreakdown.packaging, 
      policy.components.packaging
    );
    
    const sellStorage = this.applyComponentMarkup(
      costBreakdown.storage, 
      policy.components.storage
    );
    
    const sellPickup = this.applyComponentMarkup(
      costBreakdown.pickup, 
      policy.components.pickup
    );
    
    const sellDelivery = this.applyComponentMarkup(
      costBreakdown.delivery, 
      policy.components.delivery
    );

    // Calculate subtotal after markup
    const markupSubtotal = sellFreight + sellOverweight + sellPackaging + sellStorage + sellPickup + sellDelivery;

    // Apply "Paid outside USA" surcharge
    let surcharge = 0;
    if (paidOutsideUSA) {
      const surchargeRule = policy.surchargeRules.paidOutsideUSA;
      if (markupSubtotal < surchargeRule.thresholdUSD) {
        surcharge = surchargeRule.flatFeeUSD; // $10
      } else {
        surcharge = markupSubtotal * (surchargeRule.percentageRate / 100); // 10%
      }
    }

    const subtotalWithSurcharge = markupSubtotal + surcharge;
    
    // Apply global minimum and rounding
    const finalTotal = Math.max(
      this.applyGlobalRounding(subtotalWithSurcharge, policy.globalRules),
      policy.globalRules.minSellPrice
    );

    // Calculate margin metrics
    const totalCost = costBreakdown.subtotal;
    const margin = finalTotal - totalCost;
    const marginPercentage = totalCost > 0 ? (margin / totalCost) * 100 : 0;

    return {
      ...costBreakdown,
      freight: sellFreight,
      overweight: sellOverweight,
      packaging: sellPackaging,
      storage: sellStorage,
      pickup: sellPickup,
      delivery: sellDelivery,
      subtotal: markupSubtotal,
      surcharge,
      total: finalTotal,
      margin,
      marginPercentage,
      appliedMarkups: {
        freight: policy.components.freight.markup,
        overweight: policy.components.overweight.markup,
        packaging: policy.components.packaging.markup,
        storage: policy.components.storage.markup,
        pickup: policy.components.pickup.markup,
        delivery: policy.components.delivery.markup,
      },
      policyVersion: policy.version,
    };
  }

  private applyComponentMarkup(cost: number, component: ComponentPricing): number {
    if (component.passThrough || cost === 0) {
      return cost;
    }

    let sellPrice = cost * component.markup;
    
    // Apply component-level rounding
    sellPrice = this.applyRounding(sellPrice, component.roundRule, 1);
    
    // Apply floor
    sellPrice = Math.max(sellPrice, component.minFloor);
    
    return sellPrice;
  }

  private applyGlobalRounding(amount: number, rules: PricingPolicy['globalRules']): number {
    return this.applyRounding(amount, rules.defaultRoundRule, rules.roundToNearest);
  }

  private applyRounding(amount: number, rule: 'up' | 'down' | 'nearest', increment: number): number {
    switch (rule) {
      case 'up':
        return Math.ceil(amount / increment) * increment;
      case 'down':
        return Math.floor(amount / increment) * increment;
      case 'nearest':
        return Math.round(amount / increment) * increment;
      default:
        return amount;
    }
  }

  private async findApplicableTariff(origin: string, destination: string): Promise<Tariff | null> {
    // In production, this would query the database
    // For now, return a mock CAL tariff that can handle any weight for pricing calculations
    return {
      id: 'cal-general-air-us-gy-2024',
      carrier: 'Caribbean Airlines',
      product: 'GeneralAir',
      origin: 'JFK',
      destination: 'GEO',
      region: 'Guyana',
      bands: [
        { minWeightKg: 0, maxWeightKg: 1, rateUSD: 27.34 },
        { minWeightKg: 1, maxWeightKg: 5, rateUSD: 54.71 },
        { minWeightKg: 5, maxWeightKg: 10, rateUSD: 72.43 },
        { minWeightKg: 10, maxWeightKg: 20, rateUSD: 85.86 },
        { minWeightKg: 20, maxWeightKg: 30, rateUSD: 120.28 },
      ],
      overweightRatePerKg: 4.74,
      caps: {
        maxWeightKg: 100, // Higher limit for General Air for testing
        maxDimensionsCm: {
          length: 300,
          width: 300,
          height: 300,
        },
      },
      effectiveDate: '2024-01-01',
      status: 'active',
      version: '1.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'system',
    };
  }

  private findTariffBand(tariff: Tariff, weightKg: number): TariffBand {
    // Sort by maxWeight just in case
    const bands = [...tariff.bands].sort((a, b) => a.maxWeightKg - b.maxWeightKg);
    // Pick first band whose max >= weight, else fall back to last band
    return bands.find(b => weightKg <= b.maxWeightKg) ?? bands[bands.length - 1];
  }

  private calculateChargeableWeight(pieces: CostCalculationInput['pieces']): number {
    return pieces.reduce((total, piece) => {
      const actualWeight = piece.weightKg;
      
      if (!piece.dimensions) {
        return total + actualWeight;
      }

      // Calculate dimensional weight (L × W × H ÷ 6000 for air freight)
      const dimensionalWeight = (
        piece.dimensions.lengthCm * 
        piece.dimensions.widthCm * 
        piece.dimensions.heightCm
      ) / 6000;

      // Use the greater of actual or dimensional weight
      return total + Math.max(actualWeight, dimensionalWeight);
    }, 0);
  }

  private calculateVolume(pieces: CostCalculationInput['pieces']): number {
    return pieces.reduce((total, piece) => {
      if (!piece.dimensions) return total;
      
      return total + (
        piece.dimensions.lengthCm * 
        piece.dimensions.widthCm * 
        piece.dimensions.heightCm
      ) / 1000000; // Convert to m³
    }, 0);
  }

  private validateEligibility(pieces: CostCalculationInput['pieces'], tariff: Tariff): void {
    for (const piece of pieces) {
      // Check weight limit against tariff caps
      if (piece.weightKg > tariff.caps.maxWeightKg) {
        throw new Error(`Piece exceeds ${tariff.product} weight limit (${tariff.caps.maxWeightKg}kg). Consider alternative service.`);
      }

      // Check dimension limits against tariff caps
      if (piece.dimensions) {
        const totalDimensions = (
          piece.dimensions.lengthCm + 
          piece.dimensions.widthCm + 
          piece.dimensions.heightCm
        );
        
        const maxTotalDimensions = Object.values(tariff.caps.maxDimensionsCm).reduce((sum, dim) => 
          Math.min(sum, dim), Infinity); // Use the smallest dimension as total limit approximation
        
        if (totalDimensions > maxTotalDimensions) {
          throw new Error(`Piece exceeds ${tariff.product} dimension limits. Consider alternative service.`);
        }
      }
    }
  }

  /**
   * Get default pricing policy
   */
  static getDefaultPolicy(): PricingPolicy {
    const defaultComponent: ComponentPricing = {
      markup: 1.80,
      roundRule: 'up',
      minFloor: 0,
      passThrough: false,
    };

    return {
      id: 'default-policy-v1',
      environment: 'production',
      components: {
        freight: { ...defaultComponent },
        overweight: { ...defaultComponent },
        packaging: { ...defaultComponent },
        storage: { ...defaultComponent },
        pickup: { ...defaultComponent },
        delivery: { ...defaultComponent },
      },
      surchargeRules: {
        paidOutsideUSA: {
          enabled: true,
          thresholdUSD: 100,
          flatFeeUSD: 10,
          percentageRate: 10,
        },
      },
      globalRules: {
        minSellPrice: 35,
        defaultRoundRule: 'up',
        roundToNearest: 1,
      },
      effectiveDate: new Date().toISOString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'system',
      version: '1.0',
    };
  }
}