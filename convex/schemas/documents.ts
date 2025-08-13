// convex/schemas/documents.ts
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    userId: v.id("users"),
    bookingId: v.optional(v.string()),
    type: v.string(), // "id-front" | "id-back" | "proof-address" | "invoice-pdf" | ...
    blobId: v.id("_storage"),
    filename: v.string(),
    size: v.number(),
    contentType: v.string(),
    status: v.string(), // "uploaded" | "approved" | "rejected"
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byUser", ["userId", "createdAt"])
    .index("byBooking", ["bookingId", "createdAt"]),
});