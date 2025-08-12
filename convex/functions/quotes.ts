// convex/functions/quotes.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create a new quote
export const createQuote = mutation({
  args: {
    input: {
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
    },
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
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const quote = {
      userId: args.userId,
      input: args.input,
      computedRates: args.computedRates,
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      createdAt: Date.now(),
    };
    
    const quoteId = await ctx.db.insert("quotes", quote);
    return quoteId;
  },
});

// Get a quote by ID
export const getQuote = query({
  args: {
    id: v.id("quotes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get quotes by user
export const getQuotesByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("quotes").withIndex("byUser", q => q.eq("userId", args.userId)).collect();
  },
});
