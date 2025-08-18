import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

const CheckoutInput = z.object({
  method: z.enum(["stripe", "mmg", "cod"]),
  localPickup: z.boolean().optional().default(false),
  branchId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { method, localPickup, branchId } = CheckoutInput.parse(body);

  // TODO: load cart & totals from Convex
  // const cart = ...

  switch (method) {
    case "stripe": {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          // Option A: separate shipping line item; Option B: single combined amount
          // { price_data: { currency: cart.totals.currency, product_data: { name: "Merchandise" }, unit_amount: cart.merchandise_in_cents }, quantity: 1 },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      });
      return NextResponse.json({ success: true, redirectUrl: session.url });
    }
    case "mmg": {
      // Redirect to MMG Hosted Checkout (GYD). Fill with your merchant params.
      const mmgUrl = `${process.env.MMG_CHECKOUT_URL}?merchant=${process.env.MMG_MERCHANT_ID}`;
      return NextResponse.json({ success: true, redirectUrl: mmgUrl });
    }
    case "cod": {
      // Create order with status cod_pending
      // Persist order details and return confirmation page link
      return NextResponse.json({ success: true, cod: true, redirectUrl: `/checkout/cod-confirmation` });
    }
  }
}