import { action, mutation } from "../_generated/server";
import { v } from "convex/values";

const WOOT_BASE = "https://developer.woot.com";
const DEFAULT_FEEDS = ["All","Electronics","Computers","Home","Gourmet","Shirts","Sports","Tools","Clearance","Featured","Wootoff"];

async function wootGet(path: string) {
  const res = await fetch(`${WOOT_BASE}${path}`, {
    headers: { Accept: "application/json", "x-api-key": process.env.WOOT_API_KEY ?? "" },
  });
  if (!res.ok) throw new Error(`Woot GET ${path} → ${res.status}`);
  return res.json();
}

async function wootPost(path: string, body: unknown) {
  const res = await fetch(`${WOOT_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": process.env.WOOT_API_KEY ?? "",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Woot POST ${path} → ${res.status}`);
  return res.json();
}

// --- lightweight parser for dims/weight in Specs/Features free text
function parseDimsAndWeight(text?: string) {
  if (!text) return {} as any;
  const t = text.replace(/\n/g, " ");
  const dim = t.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)(?:\s*(?:in|inch|inches|"))?/i);
  const wt = t.match(/(\d+(?:\.\d+)?)\s*(lb|lbs|pound|pounds)/i);
  const dimensionsIn = dim ? { length: +dim[1], width: +dim[2], height: +dim[3] } : undefined;
  const weightLb = wt ? +wt[1] : undefined;
  return { dimensionsIn, weightLb };
}

function normalizeOffer(offer: any) {
  const price = offer?.Items?.[0]?.SalePrice?.Amount ?? 0;
  const currency = offer?.Items?.[0]?.SalePrice?.CurrencyCode ?? "USD";
  const description = [offer?.Features, offer?.Specs].filter(Boolean).join("\n\n");
  const parsed = parseDimsAndWeight(offer?.Specs || offer?.Features);
  return {
    source: "woot",
    sourceId: offer?.OfferId,
    title: offer?.Title,
    brand: offer?.Brand ?? undefined,
    description,
    photos: offer?.Photos ?? [],
    price: { amount: price, currency },
    availability: offer?.IsSoldOut ? "sold_out" : "in_stock",
    sourcePaths: offer?.Categories ?? [],
    tags: [],
    ...parsed,
    shippingMeta: { requiresDims: !(parsed.dimensionsIn && parsed.weightLb) },
  };
}

export const ingestFeed = action({
  args: { feed: v.string(), page: v.number() },
  handler: async (ctx, { feed, page }) => {
    const pageJson = await wootGet(`/feed/${encodeURIComponent(feed)}?page=${page}`);
    const items = pageJson?.Items ?? pageJson ?? [];
    const ids = Array.from(new Set(items.map((i: any) => i.OfferId).filter(Boolean)));

    // Hydrate in batches via /getoffers
    const out: any[] = [];
    for (let i = 0; i < ids.length; i += 25) {
      const batch = ids.slice(i, i + 25);
      const detail = await wootPost("/getoffers", batch);
      for (const raw of detail ?? []) out.push(normalizeOffer(raw));
      // small delay to respect avg 1 rps
      await new Promise((r) => setTimeout(r, 350));
    }

    // Upsert + map taxonomy
    for (const o of out) {
      const id = await ctx.runMutation("functions/store:upsertProduct", { doc: o });
      await ctx.runMutation("functions/taxonomy:applyMappings", { productId: id });
    }

    return { feed, page, offers: out.length };
  },
});

export const ingestAllFeeds = action({
  args: { feeds: v.optional(v.array(v.string())) },
  handler: async (ctx, { feeds }) => {
    const FEEDS = feeds && feeds.length ? feeds : DEFAULT_FEEDS;
    let pagesFetched = 0, offersHydrated = 0, apiCalls = 0;
    const runId = `${Date.now()}`;

    for (const f of FEEDS) {
      try {
        const first = await wootGet(`/feed/${encodeURIComponent(f)}?page=1`);
        apiCalls++;
        const totalPages = Number(first?.TotalPages ?? 1) || 1;
        const firstIds = Array.from(new Set((first?.Items ?? []).map((i: any) => i.OfferId).filter(Boolean)));
        
        // hydrate first page
        if (firstIds.length) {
          const detail = await wootPost("/getoffers", firstIds);
          apiCalls++;
          for (const raw of detail ?? []) {
            const o = normalizeOffer(raw);
            const id = await ctx.runMutation("functions/store:upsertProduct", { doc: o });
            await ctx.runMutation("functions/taxonomy:applyMappings", { productId: id });
            offersHydrated++;
          }
        }
        pagesFetched++;

        // remaining pages (limit to avoid timeouts)
        const maxPages = Math.min(totalPages, 5); // Limit to avoid timeout
        for (let p = 2; p <= maxPages; p++) {
          const res = await ctx.runAction("functions/woot:ingestFeed", { feed: f, page: p });
          pagesFetched++;
          offersHydrated += res.offers;
        }
      } catch (error) {
        console.error(`Failed to ingest feed ${f}:`, error);
        // Continue with other feeds even if one fails
      }
    }

    await ctx.db.insert("woot_ingestion_log", {
      runId,
      dateISO: new Date().toISOString().slice(0, 10),
      feeds: feeds ?? DEFAULT_FEEDS,
      pagesFetched,
      offersHydrated,
      apiCalls,
      completed: true,
      createdAt: Date.now(),
    });

    return { runId, pagesFetched, offersHydrated, apiCalls };
  },
});

// Seed function for initial categories and rules
export const seedTaxonomy = action({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Check if categories already exist
    const existingCategories = await ctx.db.query("categories").collect();
    if (existingCategories.length > 0) {
      return { ok: true, message: "Categories already exist" };
    }

    // Create base categories
    const electronics = await ctx.db.insert("categories", { 
      name: "Electronics", 
      slug: "electronics", 
      createdAt: now, 
      updatedAt: now, 
      synonyms: ["gadgets", "tech"], 
      wootPaths: ["ELECTRONICS"] 
    });
    
    const audio = await ctx.db.insert("categories", { 
      name: "Audio", 
      slug: "electronics-audio", 
      parentId: electronics, 
      createdAt: now, 
      updatedAt: now, 
      synonyms: ["audio","speakers","headphones"], 
      wootPaths: ["ELECTRONICS/Audio"] 
    });
    
    const computers = await ctx.db.insert("categories", { 
      name: "Computers", 
      slug: "computers", 
      createdAt: now, 
      updatedAt: now, 
      wootPaths: ["COMPUTERS"] 
    });
    
    const home = await ctx.db.insert("categories", { 
      name: "Home & Kitchen", 
      slug: "home-kitchen", 
      createdAt: now, 
      updatedAt: now, 
      wootPaths: ["HOME"] 
    });
    
    const kitchen = await ctx.db.insert("categories", { 
      name: "Kitchen", 
      slug: "home-kitchen-appliances", 
      parentId: home, 
      createdAt: now, 
      updatedAt: now, 
      synonyms: ["appliances","kitchen"], 
      wootPaths: ["HOME/Kitchen"] 
    });

    const tools = await ctx.db.insert("categories", { 
      name: "Tools & Garden", 
      slug: "tools", 
      createdAt: now, 
      updatedAt: now, 
      wootPaths: ["TOOLS"] 
    });

    const sports = await ctx.db.insert("categories", { 
      name: "Sports & Outdoors", 
      slug: "sports", 
      createdAt: now, 
      updatedAt: now, 
      wootPaths: ["SPORTS"] 
    });

    // Create mapping rules
    await ctx.db.insert("category_rules", { 
      pattern: "(bluetooth|soundbar|dolby|earbuds|speaker|headphone)", 
      targetCategoryId: audio, 
      weight: 40, 
      createdAt: now 
    });
    
    await ctx.db.insert("category_rules", { 
      pattern: "(ssd|nvme|ram|laptop|monitor|computer|pc)", 
      targetCategoryId: computers, 
      weight: 50, 
      createdAt: now 
    });
    
    await ctx.db.insert("category_rules", { 
      pattern: "(air fryer|blender|toaster|microwave|kitchen|cookware)", 
      targetCategoryId: kitchen, 
      weight: 45, 
      createdAt: now 
    });

    await ctx.db.insert("category_rules", { 
      pattern: "(drill|saw|tool|garden|outdoor|wrench)", 
      targetCategoryId: tools, 
      weight: 45, 
      createdAt: now 
    });

    await ctx.db.insert("category_rules", { 
      pattern: "(fitness|sport|exercise|bike|outdoor)", 
      targetCategoryId: sports, 
      weight: 45, 
      createdAt: now 
    });

    return { ok: true, message: "Taxonomy seeded successfully" };
  },
});