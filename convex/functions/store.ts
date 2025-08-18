import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
// NOTE: Import your pricing engine (paths based on repo docs)
// import { pricingEngine } from "../../app/lib/pricing/engine"; // adjust if needed

export const addToCart = mutation({
  args: {
    userId: v.string(),
    productId: v.string(),
    qty: v.number(),
    productData: v.optional(v.object({
      title: v.string(),
      price: v.number(),
      currency: v.string(),
      photos: v.array(v.string()),
      source: v.string(),
      availability: v.string(),
    })),
  },
  handler: async (ctx, { userId, productId, qty, productData }) => {
    // Try to find existing product in database first
    let product = await ctx.db.get(ctx.db.normalizeId("products", productId));
    
    // If not found and productData provided, use the external product data
    if (!product && !productData) {
      throw new Error("Product not found and no product data provided");
    }

    const productInfo = product || {
      price: productData!.price,
      currency: productData!.currency,
      title: productData!.title,
    };

    // Load or create cart
    let cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!cart) {
      const cartId = await ctx.db.insert("carts", {
        userId,
        items: [],
        totals: {
          merchandise: 0,
          shipping: 0,
          duties: 0,
          localAdjustments: 0,
          grandTotal: 0,
          currency: productInfo.currency || "USD",
        },
        updatedAt: Date.now(),
      });
      cart = await ctx.db.get(cartId);
    }

    // Merge line
    const items = [...cart.items];
    const existing = items.find((i) => i.productId === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        productId, 
        qty, 
        unitPrice: productInfo.price, 
        currency: productInfo.currency || "USD",
        title: productInfo.title,
        photos: productData?.photos || [],
        source: productData?.source || "internal",
      });
    }

    // Recompute totals using pricing engine (simplified for now)
    const merchandise = items.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
    const shipping = 0; // TODO: integrate with pricing engine
    const duties = 0;
    const localAdjustments = 0;
    const grandTotal = merchandise + shipping + duties + localAdjustments;

    await ctx.db.patch(cart._id, {
      items,
      totals: { merchandise, shipping, duties, localAdjustments, grandTotal, currency: cart.totals.currency },
      pricingSnapshot: {}, // TODO: add pricing breakdown
      updatedAt: Date.now(),
    });

    return { success: true, missingDims: false };
  },
});

export const getCart = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return cart;
  },
});