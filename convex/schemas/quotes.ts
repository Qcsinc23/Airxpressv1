// convex/schemas/quotes.ts
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  quotes: defineTable({
    userId: v.id("users"),
    input: v.object({
      originZip: v.string(),
      destCountry: v.string(),
      destCity: v.optional(v.string()),
      pieces: v.array(v.object({
        type: v.union(v.literal("barrel"), v.literal("box")),
        weight: v.number(),
        dimensions: v.optional(v.object({
          length: v.number(),
          width: v.number(),
          height: v.number(),
        })),
      })),
      serviceLevel: v.union(
        v.literal("STANDARD"),
        v.literal("EXPRESS"),
        v.literal("NFO")
      ),
      afterHours: v.optional(v.boolean()),
      isPersonalEffects: v.optional(v.boolean()),
    }),
    computedRates: v.array(v.object({
      laneId: v.string(),
      carrier: v.string(),
      serviceLevel: v.union(
        v.literal("STANDARD"),
        v.literal("EXPRESS"),
        v.literal("NFO")
      ),
      transitTime: v.number(),
      totalPrice: v.number(),
      breakdown: v.object({
        baseRate: v.number(),
        fuelSurcharge: v.number(),
        securityFee: v.number(),
        afterHoursFee: v.optional(v.number()),
        oversizeFee: v.optional(v.number()),
      }),
      cutOffTime: v.string(),
      departureAirport: v.string(),
      arrivalAirport: v.string(),
      validUntil: v.string(),
    })),
    chosenLaneId: v.optional(v.string()),
    expiry: v.string(),
    createdAt: v.number(),
  }).index("byUser", ["userId"]),
});
