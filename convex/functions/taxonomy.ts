import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const applyMappings = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const p = await ctx.db.get(productId);
    if (!p) throw new Error("Product not found");

    // If there's an explicit override, honor it
    if (p.primaryCategoryIdOverride) {
      await ctx.db.patch(productId, { primaryCategoryId: p.primaryCategoryIdOverride });
      return { applied: "override" };
    }

    const rules = await ctx.db.query("category_rules").collect();
    const cats = await ctx.db.query("categories").collect();

    const scores = new Map<string, number>();

    const bump = (id: string, s: number) => scores.set(id, (scores.get(id) ?? 0) + s);

    // 1) Exact Woot path hit
    for (const sp of p.sourcePaths ?? []) {
      const hit = cats.find((c) => (c.wootPaths ?? []).includes(sp));
      if (hit) bump(hit._id, 100);
    }

    // 2) Synonyms on leaf tokens
    const tokens = new Set(
      (p.sourcePaths ?? [])
        .flatMap((path) => path.split(/[\/]/).map((s) => s.toLowerCase().trim()))
    );
    for (const c of cats) {
      const syns = (c.synonyms ?? []).map((s) => s.toLowerCase());
      if (syns.some((s) => tokens.has(s))) bump(c._id, 60);
    }

    // 3) Rule-based (pattern on title/description/brand/tags)
    const hay = [p.title, p.brand ?? "", p.description ?? "", ...(p.tags ?? [])].join(" \n ").toLowerCase();
    for (const r of rules) {
      let ok = false;
      try {
        const rx = new RegExp(r.pattern, "i");
        ok = rx.test(hay);
      } catch {
        ok = hay.includes(r.pattern.toLowerCase());
      }
      if (ok) bump(r.targetCategoryId, r.weight);
    }

    // Choose primary
    let best: { id: string; score: number } | null = null;
    for (const [id, score] of scores.entries()) {
      if (!best || score > best.score) best = { id, score };
    }

    const categoryIds = Array.from(scores.keys());
    await ctx.db.patch(productId, {
      categoryIds,
      primaryCategoryId: best ? (best.id as any) : undefined,
      updatedAt: Date.now(),
    });
    return { applied: best ? "scored" : "none", best };
  },
});

export const getCategories = query({
  args: { parentId: v.optional(v.id("categories")) },
  handler: async (ctx, { parentId }) => {
    if (parentId) {
      return await ctx.db
        .query("categories")
        .withIndex("by_parent", (q) => q.eq("parentId", parentId))
        .collect();
    }
    return await ctx.db.query("categories").collect();
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("categories")),
    synonyms: v.optional(v.array(v.string())),
    wootPaths: v.optional(v.array(v.string())),
    rank: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("categories", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createCategoryRule = mutation({
  args: {
    pattern: v.string(),
    brand: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    targetCategoryId: v.id("categories"),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("category_rules", {
      ...args,
      createdAt: Date.now(),
    });
  },
});