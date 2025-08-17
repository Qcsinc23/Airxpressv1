// convex/schemas/bookings.ts
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bookings: defineTable({
    quoteId: v.id("quotes"),
    userId: v.id("users"),
    status: v.union(
      v.literal("NEW"),
      v.literal("NEEDS_DOCS"),
      v.literal("READY_TO_TENDER"),
      v.literal("TENDERED"),
      v.literal("IN_TRANSIT"),
      v.literal("ARRIVED"),
      v.literal("DELIVERED"),
      v.literal("CANCELLED")
    ),
    trackingEvents: v.array(v.object({
      timestamp: v.string(),
      status: v.string(),
      location: v.optional(v.string()),
      notes: v.optional(v.string()),
    })),
    paymentId: v.optional(v.string()),
    documents: v.array(v.object({
      type: v.union(
        v.literal("COMMERCIAL_INVOICE"),
        v.literal("PACKING_LIST"),
        v.literal("C73_FORM"),
        v.literal("OTHER")
      ),
      url: v.string(),
      uploadedAt: v.string(),
    })),
    pickupDetails: v.object({
      scheduledTime: v.string(),
      address: v.string(),
      contact: v.string(),
      specialInstructions: v.optional(v.string()),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byStatus", ["status"])
    .index("byUser", ["userId"]),
});
