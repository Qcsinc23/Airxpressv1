// app/api/packaging/route.ts
// Customer API for viewing available packaging options with sell prices

import { NextRequest, NextResponse } from 'next/server';

// GET - Public packaging options for customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // Filter by category
    const maxWeight = searchParams.get('maxWeight'); // Filter by weight capacity
    
    // Forward request to admin API with customer format
    const adminUrl = new URL('/api/admin/packaging', request.url);
    adminUrl.searchParams.set('format', 'customer');
    adminUrl.searchParams.set('includeInactive', 'false');
    
    const adminResponse = await fetch(adminUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!adminResponse.ok) {
      // Fallback to default packaging options if admin API fails
      return NextResponse.json({
        success: true,
        packaging: [
          {
            id: 'sku_plastic_barrel_45l',
            code: 'PLB-45',
            name: 'Plastic Barrel - 45L',
            description: 'Heavy duty plastic barrel for general cargo',
            sellPriceUSD: Math.ceil(12.50 * 1.80), // Cost $12.50 * markup 1.80 = $22.50 → $23
            category: 'barrel',
            specifications: {
              maxWeightKg: 30,
              dimensionsCm: { length: 60, width: 40, height: 40 },
              material: 'High-density polyethylene',
            },
            availability: 'available',
          },
          {
            id: 'sku_fiber_barrel_60l',
            code: 'FIB-60',
            name: 'Fiber Barrel - 60L',
            description: 'Eco-friendly fiber barrel for food items',
            sellPriceUSD: Math.ceil(15.75 * 1.80), // Cost $15.75 * markup 1.80 = $28.35 → $29
            category: 'barrel',
            specifications: {
              maxWeightKg: 35,
              dimensionsCm: { length: 65, width: 45, height: 45 },
              material: 'Recycled cardboard fiber',
            },
            availability: 'available',
          },
          {
            id: 'sku_econtainer_small',
            code: 'ECON-S',
            name: 'E-Container Small',
            description: 'Reusable container for multiple shipments',
            sellPriceUSD: Math.ceil(25.00 * 1.80), // Cost $25.00 * markup 1.80 = $45.00 → $45
            category: 'container',
            specifications: {
              maxWeightKg: 40,
              dimensionsCm: { length: 70, width: 50, height: 35 },
              material: 'Reinforced polypropylene',
            },
            availability: 'available',
          },
          {
            id: 'sku_mini_econ',
            code: 'MINI-ECON',
            name: 'Mini E-Container',
            description: 'Compact container for small items',
            sellPriceUSD: Math.ceil(18.00 * 1.80), // Cost $18.00 * markup 1.80 = $32.40 → $33
            category: 'container',
            specifications: {
              maxWeightKg: 20,
              dimensionsCm: { length: 50, width: 35, height: 25 },
              material: 'Reinforced polypropylene',
            },
            availability: 'available',
          },
          {
            id: 'sku_fragile_protection',
            code: 'FRAG-PRO',
            name: 'Fragile Item Protection',
            description: 'Extra padding and protection for delicate items',
            sellPriceUSD: Math.ceil(8.50 * 1.80), // Cost $8.50 * markup 1.80 = $15.30 → $16
            category: 'protection',
            specifications: {
              maxWeightKg: 50,
              dimensionsCm: { length: 100, width: 100, height: 100 },
              material: 'Bubble wrap and foam inserts',
            },
            availability: 'available',
          },
        ],
        markup: {
          applied: 1.80,
          note: 'Prices include handling and processing fees',
        },
        filters: {
          categories: ['barrel', 'container', 'protection'],
          maxWeights: [20, 30, 35, 40, 50],
        },
      });
    }
    
    const adminData = await adminResponse.json();
    let packaging = adminData.packaging || [];
    
    // Apply filters if requested
    if (category) {
      packaging = packaging.filter((pkg: any) => pkg.category === category);
    }
    
    if (maxWeight) {
      const maxWeightNum = parseFloat(maxWeight);
      packaging = packaging.filter((pkg: any) => 
        pkg.specifications.maxWeightKg >= maxWeightNum
      );
    }
    
    // Add recommendations based on common use cases
    const recommendations = [];
    if (!category || category === 'barrel') {
      recommendations.push({
        useCase: 'Food items and personal effects',
        recommendedSKU: 'sku_fiber_barrel_60l',
        reason: 'Eco-friendly and food-safe materials',
      });
    }
    
    if (!category || category === 'container') {
      recommendations.push({
        useCase: 'Electronics and valuable items',
        recommendedSKU: 'sku_econtainer_small',
        reason: 'Secure and reusable protection',
      });
    }
    
    if (!category || category === 'protection') {
      recommendations.push({
        useCase: 'Fragile or delicate items',
        recommendedSKU: 'sku_fragile_protection',
        reason: 'Extra cushioning and protection',
      });
    }
    
    return NextResponse.json({
      success: true,
      packaging,
      recommendations,
      markup: adminData.markup,
      guidelines: {
        selection: 'Choose packaging that exceeds your item\'s weight and dimensions',
        combination: 'Multiple packaging options can be combined for optimal protection',
        customs: 'Some destinations may require specific packaging types',
      },
      disclaimers: [
        'Packaging prices are in addition to shipping rates',
        'Final packaging may vary based on carrier requirements',
        'All packaging meets international shipping standards',
      ],
    });
    
  } catch (error) {
    console.error('Packaging API error:', error);
    return NextResponse.json({ error: 'Failed to fetch packaging options' }, { status: 500 });
  }
}