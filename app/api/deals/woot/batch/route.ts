import { NextRequest, NextResponse } from "next/server";
import { normalizeOffer } from "@/app/lib/deals/woot";

const WOOT_BASE = "https://developer.woot.com";

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-api-key": process.env.WOOT_API_KEY || "",
      ...options?.headers,
    },
    next: { revalidate: 300 },
    ...options,
  });
  if (!res.ok) throw new Error(`Woot error ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  try {
    const feed = req.nextUrl.searchParams.get("feed") || "All";
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const detailed = req.nextUrl.searchParams.get("detailed") === "true";
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "25");

    // First get the feed items
    const feedData = await fetchJson(`${WOOT_BASE}/feed/${feed}?page=${page}`);
    const items: any[] = feedData?.Items || [];
    
    if (!detailed) {
      // Return basic feed data quickly
      return NextResponse.json({ 
        success: true, 
        data: items.slice(0, limit),
        totalCount: items.length,
        page,
        hasMore: items.length === 100 // Each page has 100 items max
      });
    }

    // Use the batch getoffers endpoint for detailed data (max 25 items)
    const offerIds = items.slice(0, Math.min(25, limit)).map(item => item.OfferId);
    
    if (offerIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [],
        totalCount: 0,
        page,
        hasMore: false
      });
    }

    // Batch fetch detailed offers
    const detailedOffers = await fetchJson(`${WOOT_BASE}/getoffers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offerIds),
    });

    const normalizedOffers = await Promise.all(
      detailedOffers.map((offer: any) => normalizeOffer(offer))
    );

    return NextResponse.json({ 
      success: true, 
      data: normalizedOffers,
      totalCount: normalizedOffers.length,
      page,
      hasMore: items.length > 25
    });

  } catch (err: any) {
    console.error('Woot batch API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}