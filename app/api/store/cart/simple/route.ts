import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Simple in-memory cart for testing (replace with proper database later)
const cartStorage = new Map<string, any>();

export async function GET(req: NextRequest) {
  const userId = "guest-user"; // Simplified for testing
  const cart = cartStorage.get(userId) || { items: [], total: 0 };
  return NextResponse.json({ success: true, data: cart });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = z
      .object({ 
        productId: z.string().min(1), 
        qty: z.number().int().positive(),
        productData: z.object({
          title: z.string(),
          price: z.number(),
          currency: z.string(),
          photos: z.array(z.string()),
          source: z.string(),
          availability: z.string(),
        })
      })
      .parse(body);

    const userId = "guest-user";
    const cart = cartStorage.get(userId) || { items: [], total: 0 };
    
    // Check if item already exists
    const existingIndex = cart.items.findIndex((item: any) => item.productId === parsed.productId);
    
    if (existingIndex >= 0) {
      cart.items[existingIndex].qty += parsed.qty;
    } else {
      cart.items.push({
        productId: parsed.productId,
        qty: parsed.qty,
        ...parsed.productData
      });
    }
    
    // Recalculate total
    cart.total = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
    
    cartStorage.set(userId, cart);
    
    return NextResponse.json({ success: true, message: "Added to cart", cart });
  } catch (err: any) {
    console.error('Cart error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = z.object({ 
      productId: z.string().min(1), 
      qty: z.number().int().min(0)
    }).parse(body);

    const userId = "guest-user";
    const cart = cartStorage.get(userId) || { items: [], total: 0 };
    
    const existingIndex = cart.items.findIndex((item: any) => item.productId === parsed.productId);
    
    if (existingIndex >= 0) {
      if (parsed.qty === 0) {
        cart.items.splice(existingIndex, 1);
      } else {
        cart.items[existingIndex].qty = parsed.qty;
      }
    }
    
    // Recalculate total
    cart.total = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
    
    cartStorage.set(userId, cart);
    
    return NextResponse.json({ success: true, message: "Cart updated", cart });
  } catch (err: any) {
    console.error('Cart update error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = z.object({ productId: z.string().min(1) }).parse(body);

    const userId = "guest-user";
    const cart = cartStorage.get(userId) || { items: [], total: 0 };
    
    cart.items = cart.items.filter((item: any) => item.productId !== parsed.productId);
    cart.total = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
    
    cartStorage.set(userId, cart);
    
    return NextResponse.json({ success: true, message: "Item removed", cart });
  } catch (err: any) {
    console.error('Cart delete error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}