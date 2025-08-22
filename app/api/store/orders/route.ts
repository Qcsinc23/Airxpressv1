// app/api/store/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

import { getConvexClient } from '../../../lib/convex/client';
// Order creation schema
const CreateOrderSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  shippingAddress: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    addressLine1: z.string().min(5, 'Address is required').max(255, 'Address is too long'),
    addressLine2: z.string().max(255, 'Address line 2 is too long').optional(),
    city: z.string().min(2, 'City is required').max(100, 'City name is too long'),
    state: z.string().min(2, 'State is required').max(50, 'State name is too long'),
    postalCode: z.string().min(5, 'Postal code is required').max(10, 'Postal code is too long'),
    country: z.string().min(2, 'Country is required').max(50, 'Country name is too long'),
  }).optional(),
});

// GET - Get user's orders
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // TODO: Implement getUserOrders function in store.ts
      // const orders = await getConvexClient().query(api.functions.store.getUserOrders, {
      //   userId: userId as Id<"users">
      // });
      const orders: any[] = [];

      const formattedOrders = orders.length > 0 ? orders.map((order: any) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        items: order.cartSnapshot.items,
        totals: {
          subtotal: order.cartSnapshot.subtotal,
          shippingCost: order.cartSnapshot.shippingCost,
          tax: order.cartSnapshot.tax,
          total: order.cartSnapshot.total,
          currency: order.cartSnapshot.currency,
        },
        shippingAddress: order.shippingAddress,
        createdAt: new Date(order.createdAt).toISOString(),
        updatedAt: new Date(order.updatedAt).toISOString(),
      })) : [];

      return NextResponse.json({
        success: true,
        orders: formattedOrders,
      });

    } catch (convexError) {
      console.error('Convex query error:', convexError);
      return NextResponse.json({
        success: true,
        orders: [], // Return empty array on error
      });
    }

  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create order from cart
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateOrderSchema.parse(body);

    try {
      // TODO: Implement createOrder function in store.ts
      // const orderId = await getConvexClient().mutation(api.functions.store.createOrder, {
      //   userId: userId as Id<"users">,
      //   paymentIntentId: validatedData.paymentIntentId,
      //   shippingAddress: validatedData.shippingAddress,
      // });
      const orderId = `order_${Date.now()}`;

      return NextResponse.json({
        success: true,
        orderId,
        message: 'Order created successfully',
      });

    } catch (convexError) {
      console.error('Failed to create order:', convexError);
      
      if (convexError instanceof Error) {
        if (convexError.message.includes('Cart is empty')) {
          return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }
        if (convexError.message.includes('not found')) {
          return NextResponse.json({ error: 'Cart or product not found' }, { status: 404 });
        }
      }

      return NextResponse.json({ 
        error: 'Failed to create order',
        details: convexError instanceof Error ? convexError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Orders POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}