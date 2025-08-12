// app/api/admin/packaging/route.ts
// Admin API for managing packaging SKUs with cost/sell price calculations

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, Role } from '../../../lib/auth/rbac';
import { PricingEngine } from '../../../lib/pricing/engine';
import type { PackagingSKU } from '../../../lib/pricing/types';
import { z } from 'zod';

const PackagingSKUSchema = z.object({
  code: z.string().min(1, 'SKU code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  costUSD: z.number().positive('Cost must be positive'),
  category: z.enum(['barrel', 'box', 'container', 'protection']),
  specifications: z.object({
    maxWeightKg: z.number().positive(),
    dimensionsCm: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    }),
    material: z.string().min(1, 'Material is required'),
  }),
  isActive: z.boolean().optional().default(true),
});

// Default packaging SKUs with current market costs
const defaultPackagingSKUs: PackagingSKU[] = [
  {
    id: 'sku_plastic_barrel_45l',
    code: 'PLB-45',
    name: 'Plastic Barrel - 45L',
    description: 'Heavy duty plastic barrel for general cargo',
    costUSD: 12.50,
    category: 'barrel',
    specifications: {
      maxWeightKg: 30,
      dimensionsCm: { length: 60, width: 40, height: 40 },
      material: 'High-density polyethylene',
    },
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sku_fiber_barrel_60l',
    code: 'FIB-60',
    name: 'Fiber Barrel - 60L',
    description: 'Eco-friendly fiber barrel for food items',
    costUSD: 15.75,
    category: 'barrel',
    specifications: {
      maxWeightKg: 35,
      dimensionsCm: { length: 65, width: 45, height: 45 },
      material: 'Recycled cardboard fiber',
    },
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sku_econtainer_small',
    code: 'ECON-S',
    name: 'E-Container Small',
    description: 'Reusable container for multiple shipments',
    costUSD: 25.00,
    category: 'container',
    specifications: {
      maxWeightKg: 40,
      dimensionsCm: { length: 70, width: 50, height: 35 },
      material: 'Reinforced polypropylene',
    },
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sku_mini_econ',
    code: 'MINI-ECON',
    name: 'Mini E-Container',
    description: 'Compact container for small items',
    costUSD: 18.00,
    category: 'container',
    specifications: {
      maxWeightKg: 20,
      dimensionsCm: { length: 50, width: 35, height: 25 },
      material: 'Reinforced polypropylene',
    },
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sku_fragile_protection',
    code: 'FRAG-PRO',
    name: 'Fragile Item Protection',
    description: 'Extra padding and protection for delicate items',
    costUSD: 8.50,
    category: 'protection',
    specifications: {
      maxWeightKg: 50,
      dimensionsCm: { length: 100, width: 100, height: 100 }, // Applied to existing packaging
      material: 'Bubble wrap and foam inserts',
    },
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// GET - Fetch packaging SKUs with sell prices
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(Role.ADMIN);
    
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const format = searchParams.get('format'); // 'admin' | 'customer'
    
    // Get current pricing policy to calculate sell prices
    const policy = PricingEngine.getDefaultPolicy();
    const packagingMarkup = policy.components.packaging.markup;
    
    let skus = defaultPackagingSKUs;
    
    if (!includeInactive) {
      skus = skus.filter(sku => sku.isActive);
    }
    
    // Format response based on caller
    if (format === 'customer') {
      // Customer view - only show sell prices, no costs
      const customerSKUs = skus.map(sku => ({
        id: sku.id,
        code: sku.code,
        name: sku.name,
        description: sku.description,
        sellPriceUSD: Math.ceil(sku.costUSD * packagingMarkup), // Apply markup and round up
        category: sku.category,
        specifications: sku.specifications,
        availability: sku.isActive ? 'available' : 'unavailable',
      }));
      
      return NextResponse.json({
        success: true,
        packaging: customerSKUs,
        markup: {
          applied: packagingMarkup,
          note: 'Prices include handling and processing fees',
        },
      });
    }
    
    // Admin view - show both cost and sell prices with markup details
    const adminSKUs = skus.map(sku => {
      const sellPrice = Math.ceil(sku.costUSD * packagingMarkup);
      const margin = sellPrice - sku.costUSD;
      const marginPercentage = (margin / sku.costUSD) * 100;
      
      return {
        ...sku,
        pricing: {
          costUSD: sku.costUSD,
          sellPriceUSD: sellPrice,
          margin,
          marginPercentage,
          markupApplied: packagingMarkup,
        },
      };
    });
    
    return NextResponse.json({
      success: true,
      packaging: adminSKUs,
      policyInfo: {
        packagingMarkup,
        roundRule: policy.components.packaging.roundRule,
        lastUpdated: new Date(policy.updatedAt).toISOString(),
      },
    });
    
  } catch (error) {
    console.error('Packaging GET error:', error);
    
    if (error instanceof Error && error.message.includes('role required')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new packaging SKU
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(Role.ADMIN);
    
    const body = await request.json();
    const validatedData = PackagingSKUSchema.parse(body);
    
    // Generate new SKU
    const newSKU: PackagingSKU = {
      id: `sku_${Date.now()}_${validatedData.code.toLowerCase()}`,
      ...validatedData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Calculate sell price preview
    const policy = PricingEngine.getDefaultPolicy();
    const sellPrice = Math.ceil(newSKU.costUSD * policy.components.packaging.markup);
    const margin = sellPrice - newSKU.costUSD;
    const marginPercentage = (margin / newSKU.costUSD) * 100;
    
    // TODO: Save to database
    // await createPackagingSKU(newSKU, user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Packaging SKU created successfully',
      sku: newSKU,
      pricingPreview: {
        costUSD: newSKU.costUSD,
        sellPriceUSD: sellPrice,
        margin,
        marginPercentage,
        markupApplied: policy.components.packaging.markup,
      },
      auditLog: {
        action: 'sku_created',
        skuId: newSKU.id,
        userId: user.id,
        timestamp: Date.now(),
      },
    });
    
  } catch (error) {
    console.error('Packaging POST error:', error);
    
    if (error instanceof Error && error.message.includes('role required')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update packaging SKU
export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole(Role.ADMIN);
    
    const { searchParams } = new URL(request.url);
    const skuId = searchParams.get('id');
    
    if (!skuId) {
      return NextResponse.json({ error: 'SKU ID is required' }, { status: 400 });
    }
    
    const body = await request.json();
    const validatedData = PackagingSKUSchema.partial().parse(body);
    
    // Find existing SKU (in real app, this would be a database query)
    const existingSKU = defaultPackagingSKUs.find(sku => sku.id === skuId);
    if (!existingSKU) {
      return NextResponse.json({ error: 'SKU not found' }, { status: 404 });
    }
    
    // Update SKU
    const updatedSKU: PackagingSKU = {
      ...existingSKU,
      ...validatedData,
      updatedAt: Date.now(),
    };
    
    // Calculate new pricing
    const policy = PricingEngine.getDefaultPolicy();
    const sellPrice = Math.ceil(updatedSKU.costUSD * policy.components.packaging.markup);
    const margin = sellPrice - updatedSKU.costUSD;
    const marginPercentage = (margin / updatedSKU.costUSD) * 100;
    
    // TODO: Save to database
    // await updatePackagingSKU(updatedSKU, user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Packaging SKU updated successfully',
      sku: updatedSKU,
      pricingUpdate: {
        costUSD: updatedSKU.costUSD,
        sellPriceUSD: sellPrice,
        margin,
        marginPercentage,
        markupApplied: policy.components.packaging.markup,
      },
      auditLog: {
        action: 'sku_updated',
        skuId: updatedSKU.id,
        userId: user.id,
        timestamp: Date.now(),
        changes: validatedData,
      },
    });
    
  } catch (error) {
    console.error('Packaging PUT error:', error);
    
    if (error instanceof Error && error.message.includes('role required')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Deactivate packaging SKU
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireRole(Role.ADMIN);
    
    const { searchParams } = new URL(request.url);
    const skuId = searchParams.get('id');
    
    if (!skuId) {
      return NextResponse.json({ error: 'SKU ID is required' }, { status: 400 });
    }
    
    // TODO: Soft delete by setting isActive to false
    // await deactivatePackagingSKU(skuId, user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Packaging SKU deactivated successfully',
      auditLog: {
        action: 'sku_deactivated',
        skuId,
        userId: user.id,
        timestamp: Date.now(),
      },
    });
    
  } catch (error) {
    console.error('Packaging DELETE error:', error);
    
    if (error instanceof Error && error.message.includes('role required')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}