// convex/schemas/users.ts
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(), // Clerk user ID for authentication
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(
      v.literal("customer"),
      v.literal("agent"),
      v.literal("ops"),
      v.literal("admin")
    ),
    preferences: v.object({
      notifications: v.object({
        email: v.boolean(),
        sms: v.boolean(),
        push: v.boolean(),
      }),
      language: v.string(),
      timezone: v.string(),
    }),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byClerkId", ["clerkId"])
    .index("byRole", ["role"])
    .index("byEmail", ["email"]),
});
