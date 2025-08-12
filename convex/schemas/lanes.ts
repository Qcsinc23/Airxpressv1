// convex/schemas/lanes.ts
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  lanes: defineTable({
    origin: v.string(),
    destination: v.string(),
    serviceLevel: v.union(
      v.literal("STANDARD"),
      v.literal("EXPRESS"),
      v.literal("NFO")
    ),
    cutOffTime: v.string(),
    baseRatePerKg: v.number(),
    minRate: v.number(),
    surcharges: v.optional(v.array(v.object({
      name: v.string(),
      amount: v.number(),
      type: v.union(v.literal("fixed"), v.literal("percentage")),
    }))),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byOD", ["origin", "destination"]),
});
