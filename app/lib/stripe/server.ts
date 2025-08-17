// app/lib/stripe/server.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createPaymentIntent(amount: number, currency: string = 'usd') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

export async function createCheckoutSession(
  items: { price_data: any; quantity: number }[],
  successUrl: string,
  cancelUrl: string,
  options: { client_reference_id?: string; metadata?: Record<string, string> } = {}
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...options,
    });
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}
