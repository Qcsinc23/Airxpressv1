// convex/schemas/flags.ts
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  flags: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    enabled: v.boolean(),
    environment: v.union(
      v.literal("development"),
      v.literal("staging"),
      v.literal("production")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
