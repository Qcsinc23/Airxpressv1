// convex/schemas/content.ts
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contentTypes: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }),
  
  contents: defineTable({
    typeId: v.id("contentTypes"),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    metadata: v.optional(v.any()),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byTypeSlug", ["typeId", "slug"]),
});
