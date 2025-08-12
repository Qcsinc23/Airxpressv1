// convex/functions/lanes.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

// Get active lanes
export const getActiveLanes = query({
  handler: async (ctx) => {
    return await ctx.db.query("lanes").filter(l => l.isActive).collect();
  },
});

// Get lanes by origin and destination
export const getLanesByOD = query({
  args: {
    origin: v.string(),
    destination: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("lanes")
      .withIndex("byOD", q => q.eq("origin", args.origin).eq("destination", args.destination))
      .filter(l => l.isActive)
      .collect();
  },
});
