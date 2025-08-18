import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
// NOTE: Import your pricing engine (paths based on repo docs)
// import { pricingEngine } from "../../app/lib/pricing/engine"; // adjust if needed

export const upsertProduct = mutation({
  args: {
    doc: v.object({
      source: v.union(v.literal("internal"), v.literal("woot"), v.literal("slickdeals")),
      sourceId: v.string(),
      title: v.string(),
      brand: v.optional(v.string()),
      description: v.optional(v.string()),
      photos: v.optional(v.array(v.string())),
      price: v.object({ amount: v.number(), currency: v.string() }),
      availability: v.union(v.literal("in_stock"), v.literal("sold_out")),
      sourcePaths: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
      weightLb: v.optional(v.number()),
      dimensionsIn: v.optional(v.object({ length: v.number(), width: v.number(), height: v.number() })),
      shippingMeta: v.optional(v.object({ requiresDims: v.optional(v.boolean()), hazmat: v.optional(v.boolean()) })),
    }),
  },
  handler: async (ctx, { doc }) => {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sourceId", (q) => q.eq("sourceId", doc.sourceId))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...doc, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("products", { ...doc, createdAt: now, updatedAt: now });
  },
});

export const getProducts = query({
  args: { categoryId: v.optional(v.id("categories")), source: v.optional(v.union(v.literal("internal"), v.literal("woot"), v.literal("slickdeals"))) },
  handler: async (ctx, { categoryId, source }) => {
    let list;
    if (categoryId) {
      list = await ctx.db
        .query("products")
        .withIndex("by_primary", (q) => q.eq("primaryCategoryId", categoryId))
        .collect();
    } else {
      list = await ctx.db.query("products").collect();
    }
    return source ? list.filter((p) => p.source === source) : list;
  },
});

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
    const normalizedId = ctx.db.normalizeId("products", productId);
    let product = normalizedId ? await ctx.db.get(normalizedId) : null;
    
    // If not found and productData provided, use the external product data
    if (!product && !productData) {
      throw new Error("Product not found and no product data provided");
    }

    const productInfo = product || {
      price: productData!.price,
      currency: productData!.currency,
      title: productData!.title,
    };

    // Handle price format (can be number or object)
    const priceValue = typeof productInfo.price === 'number' 
      ? productInfo.price 
      : productInfo.price.amount;
    const priceCurrency = typeof productInfo.price === 'number'
      ? (productInfo.currency || "USD")
      : productInfo.price.currency;

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
          currency: priceCurrency,
        },
        updatedAt: Date.now(),
      });
      cart = await ctx.db.get(cartId);
    }

    if (!cart) {
      throw new Error("Failed to create or load cart");
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
        unitPrice: priceValue, 
        currency: priceCurrency,
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