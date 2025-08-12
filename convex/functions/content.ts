// convex/functions/content.ts
import { query } from "../_generated/server";
import { v } from "convex/values";

// Get content by type and slug
export const getContentByTypeAndSlug = query({
  args: {
    typeSlug: v.string(),
    contentSlug: v.string(),
  },
  handler: async (ctx, args) => {
    // First get the content type
    const contentType = await ctx.db.query("contentTypes")
      .filter((q) => q.eq("slug", args.typeSlug))
      .first();
    
    if (!contentType) {
      return null;
    }
    
    // Then get the content
    return await ctx.db.query("contents")
      .withIndex("byTypeSlug", q => q.eq("typeId", contentType._id).eq("slug", args.contentSlug))
      .first();
  },
});

// Get all published content of a type
export const getContentByType = query({
  args: {
    typeSlug: v.string(),
  },
  handler: async (ctx, args) => {
    // First get the content type
    const contentType = await ctx.db.query("contentTypes")
      .filter((q) => q.eq("slug", args.typeSlug))
      .first();
    
    if (!contentType) {
      return [];
    }
    
    // Then get all content of that type
    return await ctx.db.query("contents")
      .withIndex("byTypeSlug", q => q.eq("typeId", contentType._id))
      .collect();
  },
});
