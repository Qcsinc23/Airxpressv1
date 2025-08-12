// app/api/booking/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const BookingRequestSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID is required'),
  pickupDetails: z.object({
    scheduledTime: z.string().min(1, 'Pickup time is required'),
    address: z.string().min(1, 'Pickup address is required'),
    contact: z.string().min(1, 'Contact information is required'),
    specialInstructions: z.string().optional(),
  }),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
});

// POST - Create new booking
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = BookingRequestSchema.parse(body);
    
    // TODO: Fetch quote from Convex to get pricing
    // const quote = await getQuote(validatedData.quoteId);
    // if (!quote || quote.userId !== userId) {
    //   return NextResponse.json({ error: 'Quote not found or unauthorized' }, { status: 404 });
    // }

    // For now, use mock pricing
    const mockTotalPrice = 15000; // $150.00 in cents
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: mockTotalPrice,
      currency: 'usd',
      payment_method: validatedData.paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.BASE_URL}/booking/confirmation`,
      metadata: {
        quoteId: validatedData.quoteId,
        userId,
      },
    });

    if (paymentIntent.status === 'requires_action') {
      return NextResponse.json({
        requires_action: true,
        payment_intent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
        },
      });
    }

    if (paymentIntent.status === 'succeeded') {
      // TODO: Create booking in Convex
      // const bookingId = await createBooking({
      //   quoteId: validatedData.quoteId,
      //   userId,
      //   pickupDetails: validatedData.pickupDetails,
      //   paymentIntentId: paymentIntent.id,
      // });

      return NextResponse.json({
        success: true,
        paymentIntentId: paymentIntent.id,
        // bookingId,
      });
    }

    return NextResponse.json({
      error: 'Payment failed',
      status: paymentIntent.status,
    }, { status: 400 });

  } catch (error) {
    console.error('Booking POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.issues
      }, { status: 400 });
    }
    
    if (error instanceof Error && error.message.includes('Your card was declined')) {
      return NextResponse.json({
        error: 'Payment declined. Please check your payment method.',
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get booking by ID
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    
    // TODO: Implement Convex query to fetch booking
    // const booking = await getBooking(id);
    // 
    // if (!booking || booking.userId !== userId) {
    //   return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    // }
    
    return NextResponse.json({ message: 'Booking lookup not implemented yet' }, { status: 501 });
    
  } catch (error) {
    console.error('Booking GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}