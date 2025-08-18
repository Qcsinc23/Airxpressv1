import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const insertProduct = mutation({
  args: {
    source: v.string(),
    sourceId: v.string(),
    title: v.string(),
    subtitle: v.string(),
    description: v.string(),
    photos: v.array(v.string()),
    price: v.number(),
    currency: v.string(),
    weightLb: v.optional(v.number()),
    dimensionsIn: v.optional(
      v.object({ length: v.optional(v.number()), width: v.optional(v.number()), height: v.optional(v.number()) })
    ),
    attributes: v.optional(v.any()),
    availability: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("products", args);
  },
});

export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("products").collect();
  },
});