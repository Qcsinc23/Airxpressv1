import { NextResponse } from "next/server";

const WOOT_BASE = "https://developer.woot.com";

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-api-key": process.env.WOOT_API_KEY || "",
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  if (!res.ok) throw new Error(`Woot error ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    const feedData = await fetchJson(`${WOOT_BASE}/feed/All?page=1`);
    const items: any[] = feedData?.Items || [];
    
    // Extract all unique categories
    const allCategories = new Set<string>();
    items.forEach(item => {
      if (item.Categories && Array.isArray(item.Categories)) {
        item.Categories.forEach((cat: string) => allCategories.add(cat));
      }
    });

    const categories = Array.from(allCategories).sort();
    
    return NextResponse.json({ 
      success: true, 
      data: categories,
      feeds: ["All", "Electronics", "Home", "Sport", "Sellout", "Tools"]
    });
  } catch (err: any) {
    console.error('Woot categories error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}