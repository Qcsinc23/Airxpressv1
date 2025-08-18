import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    source: v.string(), // "internal" | "woot" | "slickdeals"
    sourceId: v.string(), // OfferId or external key ("internal" may use SKU)
    title: v.string(),
    subtitle: v.string(),
    description: v.string(),
    photos: v.array(v.string()),
    price: v.number(), // sell price (minor units optional if needed)
    currency: v.string(), // e.g., "USD", "GYD"
    weightLb: v.optional(v.number()),
    dimensionsIn: v.optional(v.object({
      length: v.optional(v.number()),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    })),
    attributes: v.optional(v.any()),
    shippingMeta: v.optional(v.object({
      requiresDims: v.optional(v.boolean()),
      hazmat: v.optional(v.boolean()),
    })),
    availability: v.string(), // "in_stock" | "sold_out"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_source", ["source"]) 
    .index("by_sourceId", ["sourceId"]) 
    .index("search_title", ["title"]),

  carts: defineTable({
    userId: v.string(),
    items: v.array(v.object({
      productId: v.string(),
      qty: v.number(),
      unitPrice: v.number(),
      currency: v.string(),
      title: v.optional(v.string()),
      photos: v.optional(v.array(v.string())),
      source: v.optional(v.string()),
    })),
    totals: v.object({
      merchandise: v.number(),
      shipping: v.number(),
      duties: v.number(),
      localAdjustments: v.number(),
      grandTotal: v.number(),
      currency: v.string(),
    }),
    pricingSnapshot: v.optional(v.any()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  orders: defineTable({
    cartId: v.string(),
    userId: v.string(),
    status: v.string(), // "awaiting_payment" | "paid" | "cod_pending" | "fulfilled" | "cancelled"
    payment: v.object({
      method: v.string(), // "stripe" | "mmg" | "cod"
      providerRef: v.optional(v.string()),
      amount: v.number(),
      currency: v.string(),
      status: v.string(),
    }),
    shippingQuote: v.any(),
    fulfillment: v.object({
      localPickup: v.optional(v.boolean()),
      branchId: v.optional(v.string()),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_status", ["status"]),
});