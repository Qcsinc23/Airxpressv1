// app/api/store/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Cart item schema for validation
const AddToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer').max(99, 'Maximum quantity is 99'),
});

const UpdateCartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().nonnegative('Quantity must be non-negative').max(99, 'Maximum quantity is 99'),
});

// GET - Get user's cart
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // First check if user exists in Convex database
      const convexUser = await convex.query(api.functions.users.getUserByClerkId, {
        clerkId: userId
      });

      if (!convexUser) {
        // User hasn't been synced to Convex yet - return empty cart
        return NextResponse.json({
          success: true,
          cart: {
            items: [],
            subtotal: 0,
            total: 0,
            currency: 'USD',
            itemCount: 0,
          },
        });
      }

      const cart = await convex.query(api.functions.store.getCart, {
        userId: convexUser._id
      });

      if (!cart) {
        return NextResponse.json({
          success: true,
          cart: {
            items: [],
            subtotal: 0,
            total: 0,
            currency: 'USD',
            itemCount: 0,
          },
        });
      }

      // Calculate totals
      const subtotal = cart.items.reduce((sum: number, item: any) => 
        sum + (item.product?.price || 0) * item.quantity, 0
      );

      const itemCount = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

      return NextResponse.json({
        success: true,
        cart: {
          id: cart._id,
          items: cart.items.map((item: any) => ({
            productId: item.productId,
            product: item.product ? {
              id: item.product._id,
              title: item.product.title,
              description: item.product.description,
              price: item.product.price,
              currency: item.product.currency,
              image: item.product.image,
              inStock: item.product.inStock,
            } : null,
            quantity: item.quantity,
            addedAt: new Date(item.addedAt).toISOString(),
          })),
          subtotal,
          shippingCost: 0, // Will be calculated when shipping integration is added
          tax: 0, // Will be calculated when tax integration is added
          total: subtotal,
          currency: cart.currency,
          itemCount,
          lastUpdated: new Date(cart.lastUpdated).toISOString(),
        },
      });

    } catch (convexError) {
      console.error('Convex query error:', convexError);
      return NextResponse.json({
        success: true,
        cart: {
          items: [],
          subtotal: 0,
          total: 0,
          currency: 'USD',
          itemCount: 0,
        },
      });
    }

  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = AddToCartSchema.parse(body);

    try {
      // First check if user exists in Convex database
      const convexUser = await convex.query(api.functions.users.getUserByClerkId, {
        clerkId: userId
      });

      if (!convexUser) {
        return NextResponse.json({
          error: 'User not found. Please refresh the page and try again.',
          code: 'USER_NOT_SYNCED'
        }, { status: 400 });
      }

      const cartId = await convex.mutation(api.functions.store.addToCart, {
        userId: convexUser._id,
        productId: validatedData.productId as Id<"products">,
        quantity: validatedData.quantity,
      });

      return NextResponse.json({
        success: true,
        cartId,
        message: 'Item added to cart successfully',
      });

    } catch (convexError) {
      console.error('Failed to add to cart:', convexError);
      
      if (convexError instanceof Error) {
        if (convexError.message.includes('not found')) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        if (convexError.message.includes('out of stock')) {
          return NextResponse.json({ error: 'Product is out of stock' }, { status: 400 });
        }
      }

      return NextResponse.json({ 
        error: 'Failed to add item to cart',
        details: convexError instanceof Error ? convexError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Cart POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = UpdateCartItemSchema.parse(body);

    try {
      // First check if user exists in Convex database
      const convexUser = await convex.query(api.functions.users.getUserByClerkId, {
        clerkId: userId
      });

      if (!convexUser) {
        return NextResponse.json({
          error: 'User not found. Please refresh the page and try again.',
          code: 'USER_NOT_SYNCED'
        }, { status: 400 });
      }

      if (validatedData.quantity === 0) {
        // Remove item from cart
        await convex.mutation(api.functions.store.removeFromCart, {
          userId: convexUser._id,
          productId: validatedData.productId as Id<"products">,
        });
      } else {
        // Update quantity
        await convex.mutation(api.functions.store.updateCartItemQuantity, {
          userId: convexUser._id,
          productId: validatedData.productId as Id<"products">,
          quantity: validatedData.quantity,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Cart updated successfully',
      });

    } catch (convexError) {
      console.error('Failed to update cart:', convexError);
      
      if (convexError instanceof Error && convexError.message.includes('not found')) {
        return NextResponse.json({ error: 'Cart or item not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        error: 'Failed to update cart',
        details: convexError instanceof Error ? convexError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Cart PUT error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Clear cart or remove specific item
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    try {
      // First check if user exists in Convex database
      const convexUser = await convex.query(api.functions.users.getUserByClerkId, {
        clerkId: userId
      });

      if (!convexUser) {
        return NextResponse.json({
          error: 'User not found. Please refresh the page and try again.',
          code: 'USER_NOT_SYNCED'
        }, { status: 400 });
      }

      if (productId) {
        // Remove specific item
        await convex.mutation(api.functions.store.removeFromCart, {
          userId: convexUser._id,
          productId: productId as Id<"products">,
        });
      } else {
        // Clear entire cart
        await convex.mutation(api.functions.store.clearCart, {
          userId: convexUser._id,
        });
      }

      return NextResponse.json({
        success: true,
        message: productId ? 'Item removed from cart' : 'Cart cleared successfully',
      });

    } catch (convexError) {
      console.error('Failed to update cart:', convexError);
      return NextResponse.json({ 
        error: 'Failed to update cart',
        details: convexError instanceof Error ? convexError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}