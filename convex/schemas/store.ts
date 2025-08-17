// convex/schemas/store.ts
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Products table - MVP version with essential fields only
  products: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.number(), // Price in cents (e.g., 1500 = $15.00)
    currency: v.string(), // "USD", "GYD", etc.
    image: v.optional(v.string()), // Product image URL
    images: v.optional(v.array(v.string())), // Additional product images
    category: v.optional(v.string()), // "electronics", "home", "clothing", etc.
    source: v.string(), // "internal", "woot", "slickdeals"
    sourceId: v.optional(v.string()), // External source ID for tracking
    inStock: v.boolean(),
    featured: v.optional(v.boolean()), // For homepage featured products
    weight: v.optional(v.number()), // Weight in pounds for shipping calculation
    dimensions: v.optional(v.object({
      length: v.number(), // in inches
      width: v.number(),
      height: v.number(),
    })),
    tags: v.optional(v.array(v.string())), // For search and filtering
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_source", ["source"])
    .index("by_category", ["category"])
    .index("by_featured", ["featured"])
    .index("in_stock", ["inStock"]),

  // Shopping carts - MVP version with basic functionality
  carts: defineTable({
    userId: v.id("users"), // Link to user who owns the cart
    items: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      addedAt: v.number(), // When item was added to cart
    })),
    // Calculated totals (will be computed on-demand initially)
    subtotal: v.optional(v.number()), // Product total in cents
    shippingCost: v.optional(v.number()), // Shipping cost in cents  
    tax: v.optional(v.number()), // Tax in cents
    total: v.optional(v.number()), // Grand total in cents
    currency: v.string(), // Cart currency
    lastUpdated: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Orders - MVP version with basic order tracking
  orders: defineTable({
    userId: v.id("users"),
    cartSnapshot: v.object({
      items: v.array(v.object({
        productId: v.id("products"),
        productTitle: v.string(), // Snapshot of product title at time of order
        productPrice: v.number(), // Price paid for this item
        quantity: v.number(),
      })),
      subtotal: v.number(),
      shippingCost: v.number(),
      tax: v.number(),
      total: v.number(),
      currency: v.string(),
    }),
    status: v.union(
      v.literal("pending_payment"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    paymentMethod: v.string(), // "stripe", "mmg", "cod"
    paymentIntentId: v.optional(v.string()), // Stripe payment intent ID
    paymentStatus: v.string(), // "pending", "succeeded", "failed", "cancelled"
    shippingAddress: v.optional(v.object({
      name: v.string(),
      addressLine1: v.string(),
      addressLine2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      postalCode: v.string(),
      country: v.string(),
    })),
    orderNumber: v.string(), // Human-readable order number (e.g., "AX-ORD-001")
    notes: v.optional(v.string()), // Internal notes for order processing
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_order_number", ["orderNumber"]),
});