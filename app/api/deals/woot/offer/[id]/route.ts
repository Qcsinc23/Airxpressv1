import { NextRequest, NextResponse } from "next/server";
import { normalizeOffer } from "@/app/lib/deals/woot";

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: offerId } = await params;
    
    // Try to get detailed offer data
    try {
      const offerData = await fetchJson(`${WOOT_BASE}/offers/${offerId}`);
      const normalizedOffer = await normalizeOffer(offerData);
      
      return NextResponse.json({ 
        success: true, 
        data: normalizedOffer
      });
    } catch (offerErr) {
      // If detailed offer fails, try to find it in feeds
      console.log('Detailed offer failed, searching feeds...');
      
      const feeds = ["All", "Electronics", "Computers", "Home", "Sports", "Tools", "Clearance"];
      
      for (const feed of feeds) {
        try {
          const feedData = await fetchJson(`${WOOT_BASE}/feed/${feed}`);
          const items = feedData?.Items || [];
          const foundItem = items.find((item: any) => item.OfferId === offerId);
          
          if (foundItem) {
            // Use normalizeFeedItem for feed items
            const { normalizeFeedItem } = await import("@/app/lib/deals/woot");
            const normalizedProduct = normalizeFeedItem(foundItem);
            
            return NextResponse.json({ 
              success: true, 
              data: normalizedProduct
            });
          }
        } catch (feedErr) {
          continue; // Try next feed
        }
      }
      
      throw new Error('Product not found in any feed');
    }
  } catch (err: any) {
    console.error('Woot offer API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}