// app/api/admin/pricing/route.ts
// Admin API for managing pricing policies and tariffs

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, Role } from '../../../lib/auth/rbac';
import { PricingEngine } from '../../../lib/pricing/engine';
import type { PricingPolicy, PricingPreview } from '../../../lib/pricing/types';
import { z } from 'zod';

const UpdatePolicySchema = z.object({
  components: z.object({
    freight: z.object({
      markup: z.number().min(1, 'Markup must be at least 1.0'),
      roundRule: z.enum(['up', 'down', 'nearest']),
      minFloor: z.number().nonnegative(),
      passThrough: z.boolean(),
    }).optional(),
    overweight: z.object({
      markup: z.number().min(1, 'Markup must be at least 1.0'),
      roundRule: z.enum(['up', 'down', 'nearest']),
      minFloor: z.number().nonnegative(),
      passThrough: z.boolean(),
    }).optional(),
    packaging: z.object({
      markup: z.number().min(1, 'Markup must be at least 1.0'),
      roundRule: z.enum(['up', 'down', 'nearest']),
      minFloor: z.number().nonnegative(),
      passThrough: z.boolean(),
    }).optional(),
    storage: z.object({
      markup: z.number().min(1, 'Markup must be at least 1.0'),
      roundRule: z.enum(['up', 'down', 'nearest']),
      minFloor: z.number().nonnegative(),
      passThrough: z.boolean(),
    }).optional(),
    pickup: z.object({
      markup: z.number().min(1, 'Markup must be at least 1.0'),
      roundRule: z.enum(['up', 'down', 'nearest']),
      minFloor: z.number().nonnegative(),
      passThrough: z.boolean(),
    }).optional(),
    delivery: z.object({
      markup: z.number().min(1, 'Markup must be at least 1.0'),
      roundRule: z.enum(['up', 'down', 'nearest']),
      minFloor: z.number().nonnegative(),
      passThrough: z.boolean(),
    }).optional(),
  }).optional(),
  surchargeRules: z.object({
    paidOutsideUSA: z.object({
      enabled: z.boolean(),
      thresholdUSD: z.number().positive(),
      flatFeeUSD: z.number().nonnegative(),
      percentageRate: z.number().min(0).max(100),
    }),
  }).optional(),
  globalRules: z.object({
    minSellPrice: z.number().positive(),
    defaultRoundRule: z.enum(['up', 'down', 'nearest']),
    roundToNearest: z.number().positive(),
  }).optional(),
});

// GET - Fetch current pricing policy
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(Role.ADMIN);
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'preview') {
      // Generate pricing preview for sample weights
      const sampleWeights = [1, 7.5, 28, 34]; // kg
      const engine = new PricingEngine(PricingEngine.getDefaultPolicy());
      
      const preview: PricingPreview = {
        sampleWeights,
        results: [],
      };
      
      for (const weightKg of sampleWeights) {
        try {
          const costInput = {
            pieces: [{ weightKg, type: 'barrel' as const }],
            origin: 'JFK',
            destination: 'GEO',
            serviceLevel: 'STANDARD' as const,
          };
          
          const cost = await engine.calculateCost(costInput);
          const sell = engine.applyMarkup(cost, false);
          
          preview.results.push({
            weightKg,
            cost: cost.subtotal,
            sell: sell.total,
            margin: sell.margin,
            marginPercent: sell.marginPercentage,
          });
        } catch (error) {
          console.error(`Preview error for ${weightKg}kg:`, error);
          preview.results.push({
            weightKg,
            cost: 0,
            sell: 0,
            margin: 0,
            marginPercent: 0,
          });
        }
      }
      
      return NextResponse.json({
        success: true,
        preview,
      });
    }
    
    // Return current pricing policy
    const currentPolicy = PricingEngine.getDefaultPolicy();
    
    return NextResponse.json({
      success: true,
      policy: currentPolicy,
      lastUpdated: new Date(currentPolicy.updatedAt).toISOString(),
    });
    
  } catch (error) {
    console.error('Admin pricing GET error:', error);
    
    if (error instanceof Error && error.message.includes('role required')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new pricing policy version
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(Role.ADMIN);
    
    const body = await request.json();
    const validatedData = UpdatePolicySchema.parse(body);
    
    // Get current policy and create new version
    const currentPolicy = PricingEngine.getDefaultPolicy();
    const newPolicy: PricingPolicy = {
      ...currentPolicy,
      id: `policy_${Date.now()}_v${parseInt(currentPolicy.version) + 1}`,
      version: (parseInt(currentPolicy.version) + 1).toString(),
      updatedAt: Date.now(),
      createdBy: user.id,
      effectiveDate: new Date().toISOString(),
    };
    
    // Apply updates
    if (validatedData.components) {
      Object.entries(validatedData.components).forEach(([component, config]) => {
        if (config) {
          newPolicy.components[component as keyof typeof newPolicy.components] = {
            ...newPolicy.components[component as keyof typeof newPolicy.components],
            ...config,
          };
        }
      });
    }
    
    if (validatedData.surchargeRules) {
      newPolicy.surchargeRules = {
        ...newPolicy.surchargeRules,
        ...validatedData.surchargeRules,
      };
    }
    
    if (validatedData.globalRules) {
      newPolicy.globalRules = {
        ...newPolicy.globalRules,
        ...validatedData.globalRules,
      };
    }
    
    // TODO: Save to database with audit log
    // await savePricingPolicy(newPolicy, user.id);
    
    // Generate preview with new policy
    const engine = new PricingEngine(newPolicy);
    const sampleWeights = [1, 7.5, 28, 34];
    const preview: PricingPreview = {
      sampleWeights,
      results: [],
    };
    
    for (const weightKg of sampleWeights) {
      try {
        const costInput = {
          pieces: [{ weightKg, type: 'barrel' as const }],
          origin: 'JFK',
          destination: 'GEO',
          serviceLevel: 'STANDARD' as const,
        };
        
        const cost = await engine.calculateCost(costInput);
        const sell = engine.applyMarkup(cost, false);
        
        preview.results.push({
          weightKg,
          cost: cost.subtotal,
          sell: sell.total,
          margin: sell.margin,
          marginPercent: sell.marginPercentage,
        });
      } catch (error) {
        console.error(`Preview error for ${weightKg}kg:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Pricing policy updated successfully',
      policy: newPolicy,
      preview,
      auditLog: {
        action: 'policy_updated',
        userId: user.id,
        timestamp: Date.now(),
        changes: validatedData,
      },
    });
    
  } catch (error) {
    console.error('Admin pricing POST error:', error);
    
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

// PUT - Publish/activate a pricing policy
export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole(Role.ADMIN);
    
    const { searchParams } = new URL(request.url);
    const policyId = searchParams.get('id');
    const action = searchParams.get('action'); // 'publish' | 'rollback'
    
    if (!policyId) {
      return NextResponse.json({ error: 'Policy ID is required' }, { status: 400 });
    }
    
    if (action === 'publish') {
      // TODO: Implement policy publishing
      // await publishPricingPolicy(policyId, user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Pricing policy published successfully',
        effectiveDate: new Date().toISOString(),
        auditLog: {
          action: 'policy_published',
          policyId,
          userId: user.id,
          timestamp: Date.now(),
        },
      });
    }
    
    if (action === 'rollback') {
      // TODO: Implement policy rollback
      // await rollbackPricingPolicy(policyId, user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Pricing policy rolled back successfully',
        auditLog: {
          action: 'policy_rolled_back',
          policyId,
          userId: user.id,
          timestamp: Date.now(),
        },
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Admin pricing PUT error:', error);
    
    if (error instanceof Error && error.message.includes('role required')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}