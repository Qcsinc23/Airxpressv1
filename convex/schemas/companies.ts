// convex/schemas/companies.ts
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  companies: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("shipper"),
      v.literal("consignee"),
      v.literal("partnerIAC"),
      v.literal("vendor")
    ),
    address: v.optional(v.string()),
    contact: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byType", ["type"]),
});
