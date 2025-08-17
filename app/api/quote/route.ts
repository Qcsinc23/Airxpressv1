// app/api/quote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PricingEngine } from '../../lib/pricing/engine';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const QuoteRequestSchema = z.object({
  originZip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  destCountry: z.string().min(1, 'Destination country is required'),
  destCity: z.string().optional(),
  pieces: z.array(z.object({
    type: z.enum(['barrel', 'box']),
    weight: z.number().positive('Weight must be positive'), // Expected in kg (converted by form)
    dimensions: z.object({
      length: z.number().nonnegative(), // Expected in cm (converted by form)
      width: z.number().nonnegative(),
      height: z.number().nonnegative(),
    }).optional(),
  })),
  serviceLevel: z.enum(['STANDARD', 'EXPRESS', 'NFO']),
  packaging: z.array(z.string()).optional(), // Packaging SKU IDs
  storagedays: z.number().nonnegative().optional(),
  paidOutsideUSA: z.boolean().optional().default(false),
  afterHours: z.boolean().optional().default(false),
  isPersonalEffects: z.boolean().optional().default(false),
});

// GET - Public quote lookup by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }
    
    // TODO: Implement Convex query to fetch quote
    return NextResponse.json({ message: 'Quote lookup not implemented yet' }, { status: 501 });
  } catch (error) {
    console.error('Quote GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new quote with advanced pricing
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Allow public quote generation - authentication not required for quotes

    const body = await request.json();
    const validatedData = QuoteRequestSchema.parse(body);
    
    // Initialize pricing engine with default policy
    const pricingEngine = new PricingEngine(PricingEngine.getDefaultPolicy());
    
    // Pieces are already converted to kg/cm in the form - no need to convert again
    const piecesForPricing = validatedData.pieces.map(piece => ({
      weightKg: piece.weight, // Already in kg from form conversion
      dimensions: piece.dimensions ? {
        lengthCm: piece.dimensions.length, // Already in cm from form conversion
        widthCm: piece.dimensions.width,
        heightCm: piece.dimensions.height,
      } : undefined,
      type: piece.type as 'barrel' | 'box',
    }));

    // Map ZIP code to airport - simplified mapping for demo
    const originAirport = 'JFK'; // Default to JFK for now
    const destAirport = getDestinationAirport(validatedData.destCountry);
    
    const pricingInput = {
      pieces: piecesForPricing,
      origin: originAirport,
      destination: destAirport,
      serviceLevel: validatedData.serviceLevel,
      packaging: validatedData.packaging,
      storagedays: validatedData.storagedays,
    };

    try {
      // Calculate cost breakdown
      const costBreakdown = await pricingEngine.calculateCost(pricingInput);
      
      // Apply markup to get sell prices
      const sellBreakdown = pricingEngine.applyMarkup(
        costBreakdown, 
        validatedData.paidOutsideUSA
      );

      // Create rate response with both cost and sell information
      const rate = {
        laneId: `${originAirport}-${destAirport}`,
        carrier: 'Caribbean Airlines',
        serviceLevel: validatedData.serviceLevel,
        transitTime: getTransitTime(validatedData.destCountry),
        totalPrice: sellBreakdown.total,
        breakdown: {
          baseRate: sellBreakdown.freight,
          overweightFee: sellBreakdown.overweight,
          packagingFee: sellBreakdown.packaging,
          storageFee: sellBreakdown.storage,
          surcharge: sellBreakdown.surcharge,
        },
        packagingDetails: costBreakdown.calculations?.packagingSKUs || [],
        margin: sellBreakdown.margin,
        marginPercentage: sellBreakdown.marginPercentage,
        cutOffTime: '15:00',
        departureAirport: originAirport,
        arrivalAirport: destAirport,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        eligibilityWarnings: getEligibilityWarnings(piecesForPricing),
        disclaimers: [
          'Airport-to-airport General Air service',
          'Pickup and delivery not included',
          'Subject to TSA and customs inspection',
          'Rates subject to change without notice',
        ],
        pricingSnapshot: {
          cost: costBreakdown,
          sell: sellBreakdown,
          timestamp: Date.now(),
        },
      };
      
      // TODO: Save quote to Convex database with pricing snapshots
      const quoteId = `quote_${Date.now()}_${userId?.slice(0, 8) || 'anon'}`;
      
      return NextResponse.json({
        success: true,
        quoteId,
        input: validatedData,
        rates: [rate],
        pricingTransparency: {
          showCost: false, // Never show cost to customers
          showMargin: false,
          showBreakdown: true,
        },
      });

    } catch (pricingError) {
      console.error('Pricing calculation error:', pricingError);
      
      // Handle eligibility errors gracefully
      if (pricingError instanceof Error && pricingError.message.includes('exceeds')) {
        return NextResponse.json({
          error: 'Eligibility Issue',
          message: pricingError.message,
          suggestion: 'Please reduce package weight or dimensions, or contact us for alternative shipping options.',
        }, { status: 400 });
      }
      
      throw pricingError;
    }

  } catch (error) {
    console.error('Quote POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function getDestinationAirport(country: string): string {
  const airportMap: { [key: string]: string } = {
    'Guyana': 'GEO',
    'Trinidad': 'POS', 
    'Jamaica': 'KIN',
    'Barbados': 'BGI',
    'Puerto Rico': 'SJU',
  };
  return airportMap[country] || 'GEO';
}

function getTransitTime(country: string): number {
  const transitMap: { [key: string]: number } = {
    'Guyana': 3,
    'Trinidad': 2,
    'Jamaica': 2,
    'Barbados': 3,
    'Puerto Rico': 1,
  };
  return transitMap[country] || 3;
}

function getEligibilityWarnings(pieces: Array<{ weightKg: number, dimensions?: any }>): string[] {
  const warnings: string[] = [];
  
  // Use General Air limits (same as defined in engine.ts)
  const WEIGHT_LIMIT_KG = 100; // General Air weight limit
  const MAX_DIMENSION_CM = 300; // General Air max dimension per side
  
  for (const piece of pieces) {
    if (piece.weightKg > WEIGHT_LIMIT_KG) {
      warnings.push(`One or more pieces exceed General Air weight limit (${Math.round(WEIGHT_LIMIT_KG * 2.20462)} lbs)`);
      break;
    }
  }
  
  for (const piece of pieces) {
    if (piece.dimensions) {
      const { lengthCm, widthCm, heightCm } = piece.dimensions;
      const maxSingleDimension = Math.max(lengthCm, widthCm, heightCm);
      
      if (maxSingleDimension > MAX_DIMENSION_CM) {
        warnings.push(`One or more pieces exceed General Air dimension limits (${Math.round(MAX_DIMENSION_CM / 2.54)} inches per side)`);
        break;
      }
    }
  }
  
  return warnings;
}
