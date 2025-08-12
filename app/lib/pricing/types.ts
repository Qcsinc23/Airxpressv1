// app/lib/pricing/types.ts
// Comprehensive pricing policy types for AirXpress

export interface PricingBreakdown {
  baseUSD: number;
  overweightUSD: number;
  packagingUSD: number;
  storageUSD: number;
  surchargeUSD: number;
  totalUSD: number;
  chargeableWeightKg: number;
  tariffId: string;
}

export interface ComponentPricing {
  markup: number; // Default 1.80
  roundRule: 'up' | 'down' | 'nearest'; // Default 'up' to nearest $1
  minFloor: number; // Minimum price floor
  passThrough: boolean; // If true, no markup applied
}

export interface PricingPolicy {
  id: string;
  environment: 'dev' | 'staging' | 'production';
  components: {
    freight: ComponentPricing;
    overweight: ComponentPricing;
    packaging: ComponentPricing;
    storage: ComponentPricing;
    pickup: ComponentPricing;
    delivery: ComponentPricing;
  };
  surchargeRules: {
    paidOutsideUSA: {
      enabled: boolean;
      thresholdUSD: number; // $100
      flatFeeUSD: number; // $10
      percentageRate: number; // 10%
    };
  };
  globalRules: {
    minSellPrice: number; // $35
    defaultRoundRule: 'up' | 'down' | 'nearest';
    roundToNearest: number; // $1
  };
  effectiveDate: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  version: string;
}

export interface TariffBand {
  minWeightKg: number;
  maxWeightKg: number;
  rateUSD: number;
}

export interface Tariff {
  id: string;
  carrier: string;
  product: 'JetPak' | 'GeneralAir';
  origin: string; // Airport code
  destination: string; // Airport code
  region: string;
  bands: TariffBand[];
  overweightRatePerKg: number; // Rate for weight > max band
  caps: {
    maxWeightKg: number;
    maxDimensionsCm: {
      length: number;
      width: number;
      height: number;
    };
  };
  effectiveDate: string;
  expiryDate?: string;
  status: 'draft' | 'active' | 'expired';
  version: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface AccessorialFee {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'flat' | 'percentage' | 'per_kg' | 'per_piece';
  costUSD?: number;
  rateUSD?: number;
  percentage?: number;
  conditions: {
    appliesTo: ('freight' | 'packaging' | 'storage')[];
    minWeight?: number;
    maxWeight?: number;
    requiresFlag?: string[];
  };
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PackagingSKU {
  id: string;
  code: string;
  name: string;
  description: string;
  costUSD: number; // Internal cost
  category: 'barrel' | 'box' | 'container' | 'protection';
  specifications: {
    maxWeightKg: number;
    dimensionsCm: {
      length: number;
      width: number;
      height: number;
    };
    material: string;
  };
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CostCalculationInput {
  pieces: Array<{
    weightKg: number;
    dimensions?: {
      lengthCm: number;
      widthCm: number;
      heightCm: number;
    };
    type: 'barrel' | 'box';
  }>;
  origin: string;
  destination: string;
  serviceLevel: 'STANDARD' | 'EXPRESS' | 'NFO';
  packaging?: string[]; // SKU IDs
  storagedays?: number;
}

export interface CostBreakdown {
  freight: number;
  overweight: number;
  packaging: number;
  storage: number;
  pickup: number;
  delivery: number;
  subtotal: number;
  tariffId: string;
  chargeableWeightKg: number;
  calculations: {
    totalWeightKg: number;
    totalVolumeM3: number;
    isOverweight: boolean;
    overweightKg: number;
    appliedBand: TariffBand;
    packagingSKUs: PackagingSKU[];
  };
}

export interface SellBreakdown extends CostBreakdown {
  surcharge: number;
  total: number;
  margin: number;
  marginPercentage: number;
  appliedMarkups: {
    freight: number;
    overweight: number;
    packaging: number;
    storage: number;
    pickup: number;
    delivery: number;
  };
  policyVersion: string;
}

export interface PricingSnapshot {
  cost: CostBreakdown;
  sell: SellBreakdown;
  policy: Pick<PricingPolicy, 'id' | 'version' | 'effectiveDate'>;
  tariff: Pick<Tariff, 'id' | 'version' | 'effectiveDate'>;
  timestamp: number;
}

// UI Display Types
export interface PriceDisplayBreakdown {
  baseRate: number;
  overweightFee: number;
  packagingFees: Array<{
    name: string;
    price: number;
  }>;
  storageFee: number;
  surcharge: number;
  subtotal: number;
  total: number;
  eligibilityWarnings: string[];
  disclaimers: string[];
}

// Admin Types
export interface PricingPreview {
  sampleWeights: number[]; // [1, 7.5, 28, 34] kg
  results: Array<{
    weightKg: number;
    cost: number;
    sell: number;
    margin: number;
    marginPercent: number;
  }>;
  deltaFromCurrent?: Array<{
    weightKg: number;
    priceDelta: number;
    marginDelta: number;
  }>;
}

export interface MarginAnalytics {
  bookingId: string;
  margin: number;
  marginPercentage: number;
  weightBand: string;
  lane: string;
  accessorials: string[];
  isLowMargin: boolean;
  targetMarginPercentage: number;
}

// Events for analytics
export interface PricingEvent {
  type: 'rate_viewed' | 'rate_adjusted' | 'package_added' | 'freight_collect_applied' | 'quote_converted';
  userId?: string;
  sessionId: string;
  quoteId?: string;
  bookingId?: string;
  data: {
    weightKg?: number;
    lane?: string;
    margin?: number;
    marginBand?: 'low' | 'medium' | 'high';
    accessorials?: string[];
    sellPrice?: number;
    [key: string]: any;
  };
  timestamp: number;
}