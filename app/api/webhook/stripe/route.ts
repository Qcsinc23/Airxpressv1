// app/api/webhook/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Stripe webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);

        const { quoteId, userId } = session.metadata!;

        // Fetch the quote to get pickup details
        const quote = await convex.query(api.functions.quotes.getQuote, { id: quoteId as Id<'quotes'> });

        if (!quote) {
          console.error('Quote not found for quoteId:', quoteId);
          break;
        }

        if (!quote.pickupDetails) {
          console.error('Pickup details not found for quoteId:', quoteId);
          break;
        }

        // Create booking in Convex
        await convex.mutation(api.functions.bookings.createBooking, {
          quoteId: quoteId as Id<'quotes'>,
          userId: userId as Id<'users'>,
          pickupDetails: quote.pickupDetails,
          paymentIntentId: session.payment_intent as string,
        });

        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
        
        // TODO: Handle failed payment
        // Mark booking as payment failed, send notification email
        
        break;

      case 'charge.dispute.created':
        const dispute = event.data.object as Stripe.Dispute;
        console.log('Chargeback created:', dispute.id);
        
        // TODO: Handle dispute
        // Notify admin team, update booking status
        
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}