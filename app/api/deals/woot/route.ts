import { NextRequest, NextResponse } from "next/server";
import { normalizeOffer, normalizeFeedItem } from "@/app/lib/deals/woot";

const WOOT_BASE = "https://developer.woot.com";

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-api-key": process.env.WOOT_API_KEY || "",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Woot error ${res.status}`);
  return res.json();
}

// Working feeds based on testing
const WORKING_FEEDS = ["All", "Electronics", "Computers", "Home", "Sports", "Tools", "Clearance"];

export async function GET(req: NextRequest) {
  try {
    const requestedFeed = req.nextUrl.searchParams.get("feed");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const category = req.nextUrl.searchParams.get("category");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");

    // Fetch from All feed and filter by content type since individual feeds don't work properly
    const feedData = await fetchJson(`${WOOT_BASE}/feed/All?page=${page}`);
    let items = feedData?.Items || [];

    // Apply feed-specific filtering based on actual content
    if (requestedFeed && requestedFeed !== "All") {
      items = items.filter((item: any) => {
        const categories = item.Categories || [];
        const site = item.Site || "";
        
        switch (requestedFeed) {
          case "Electronics":
            return categories.some((cat: string) => 
              cat.includes("TECH")
            ) || site === "Electronics" ||
            // Include tech-related items from other sites when Electronics site is empty
            (item.Title && (
              item.Title.toLowerCase().includes("tv") ||
              item.Title.toLowerCase().includes("audio") ||
              item.Title.toLowerCase().includes("smart") ||
              item.Title.toLowerCase().includes("bluetooth") ||
              item.Title.toLowerCase().includes("wireless")
            ));
            
          case "Computers":
            return categories.some((cat: string) => 
              cat.includes("PC") || 
              cat.includes("Computer") ||
              cat.includes("Laptop") ||
              cat.includes("TECH")
            ) || site === "Computers" || site === "Clearance" || site === "Electronics" ||
            // Include tech items that could be computer-related
            (item.Title && (
              item.Title.toLowerCase().includes("computer") ||
              item.Title.toLowerCase().includes("laptop") ||
              item.Title.toLowerCase().includes("pc") ||
              item.Title.toLowerCase().includes("monitor") ||
              item.Title.toLowerCase().includes("keyboard") ||
              item.Title.toLowerCase().includes("mouse")
            ));
            
          case "Home":
            return categories.some((cat: string) => 
              cat.includes("HOME") || 
              cat.includes("GROCERY")
            ) || site === "Home & Kitchen";
            
          case "Sports":
            return categories.some((cat: string) => 
              cat.includes("SPORT")
            ) || site === "Sports & Outdoors";
            
          case "Tools":
            return categories.some((cat: string) => 
              cat.includes("TOOLS")
            ) || site === "Tools & Garden";
            
          case "Clearance":
            return categories.some((cat: string) => 
              cat.includes("Sellout")
            ) || site === "Clearance";
            
          default:
            return true;
        }
      });
    }
    
    // Filter by specific category if specified
    if (category) {
      items = items.filter((item: any) => 
        item.Categories?.some((cat: string) => 
          cat.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Apply limit
    const finalProducts = items.slice(0, limit);
    const offers = finalProducts.map((item: any) => normalizeFeedItem(item));
    
    return NextResponse.json({ 
      success: true, 
      data: offers,
      totalCount: offers.length,
      availableCount: items.length,
      feed: requestedFeed || "All",
      page,
      hasMore: items.length > limit
    });
  } catch (err: any) {
    console.error('Woot API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}