// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createCheckoutSession } from '../../lib/stripe/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const CheckoutRequestSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CheckoutRequestSchema.parse(body);

    // TODO: Fetch quote from Convex to get pricing
    // const quote = await getQuote(validatedData.quoteId);
    // if (!quote || quote.userId !== userId) {
    //   return NextResponse.json({ error: 'Quote not found or unauthorized' }, { status: 404 });
    // }

    // For now, use mock pricing
    const mockTotalPrice = 15000; // $150.00 in cents
    const mockQuoteDetails = {
        name: 'Shipping Service',
        description: 'Standard shipping service for your items.',
    };

    // Get base URL with fallback for development
    const baseUrl = process.env.BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3001';
    
    const successUrl = `${baseUrl}/booking/confirmation/{CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/quote`;
    
    console.log('Creating checkout session with URLs:', { successUrl, cancelUrl, baseUrl });
    console.log('Environment variables:', {
      BASE_URL: process.env.BASE_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      NODE_ENV: process.env.NODE_ENV
    });

    const session = await createCheckoutSession(
      [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: mockQuoteDetails.name,
              description: mockQuoteDetails.description,
            },
            unit_amount: mockTotalPrice,
          },
          quantity: 1,
        },
      ],
      successUrl,
      cancelUrl,
      {
        client_reference_id: userId,
        metadata: {
          quoteId: validatedData.quoteId,
          userId,
        },
      }
    );

    console.log('Checkout session created:', { sessionId: session.id, url: session.url });

    if (session.url) {
      return NextResponse.json({ checkoutUrl: session.url });
    } else {
      return NextResponse.json({ error: 'Could not create checkout session' }, { status: 500 });
    }

  } catch (error) {
    console.error('Checkout POST error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        BASE_URL: process.env.BASE_URL,
        VERCEL_URL: process.env.VERCEL_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}