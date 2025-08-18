import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Canonical categories under your control
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("categories")),
    synonyms: v.optional(v.array(v.string())),
    wootPaths: v.optional(v.array(v.string())), // e.g. "HOME/Lighting & Fans"
    rank: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_parent", ["parentId"]),

  // Rules for mapping noisy Woot data to your taxonomy
  category_rules: defineTable({
    pattern: v.string(), // regex or substring
    brand: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    targetCategoryId: v.id("categories"),
    weight: v.number(), // priority
    createdAt: v.number(),
  }).index("by_target", ["targetCategoryId"]),

  // Enhanced products schema with backward compatibility
  products: defineTable({
    source: v.union(v.literal("internal"), v.literal("woot"), v.literal("slickdeals")),
    sourceId: v.string(), // OfferId or external key ("internal" may use SKU)
    title: v.string(),
    brand: v.optional(v.string()),
    subtitle: v.optional(v.string()), // Keep for backward compatibility
    description: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    // Enhanced price structure while maintaining backward compatibility
    price: v.union(
      v.number(), // Legacy: price as number
      v.object({ amount: v.number(), currency: v.string() }) // New: structured price
    ),
    currency: v.optional(v.string()), // Keep for backward compatibility
    availability: v.union(v.literal("in_stock"), v.literal("sold_out")),
    sourcePaths: v.optional(v.array(v.string())), // raw Woot Categories
    tags: v.optional(v.array(v.string())),
    // shipping data for pricing engine
    weightLb: v.optional(v.number()),
    dimensionsIn: v.optional(v.object({ 
      length: v.optional(v.number()), 
      width: v.optional(v.number()), 
      height: v.optional(v.number()) 
    })),
    attributes: v.optional(v.any()), // Keep for backward compatibility
    shippingMeta: v.optional(v.object({ 
      requiresDims: v.optional(v.boolean()), 
      hazmat: v.optional(v.boolean()) 
    })),
    // taxonomy relations
    categoryIds: v.optional(v.array(v.id("categories"))),
    primaryCategoryId: v.optional(v.id("categories")),
    primaryCategoryIdOverride: v.optional(v.id("categories")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_source", ["source"]) 
    .index("by_sourceId", ["sourceId"]) 
    .index("search_title", ["title"])
    .index("by_primary", ["primaryCategoryId"]),

  // Optional cache/raw for troubleshooting and reprocessing
  woot_offers_raw: defineTable({
    offerId: v.string(),
    json: v.any(),
    fetchedAt: v.number(),
  }).index("by_offer", ["offerId"]),

  // Quota + progress tracker for ingestion runs
  woot_ingestion_log: defineTable({
    runId: v.string(),
    dateISO: v.string(),
    feeds: v.array(v.string()),
    pagesFetched: v.number(),
    offersHydrated: v.number(),
    apiCalls: v.number(),
    completed: v.boolean(),
    createdAt: v.number(),
  }).index("by_date", ["dateISO"]).index("by_run", ["runId"]),

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