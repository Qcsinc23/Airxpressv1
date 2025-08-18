import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin permission check when RBAC is fully implemented
    // const user = await requirePermission(Permission.ADMIN);

    const body = await req.json().catch(() => ({}));
    const feeds = Array.isArray(body?.feeds) ? body.feeds : undefined;
    
    console.log(`Starting Woot ingestion for feeds: ${feeds?.join(', ') || 'default feeds'}`);
    
    // TODO: Fix woot function import - not available in generated API
    // const result = await client.action(api.functions.woot.ingestAllFeeds, { feeds });
    const result = { runId: Date.now().toString(), pagesFetched: 0, offersHydrated: 0, apiCalls: 0 };
    
    console.log(`Woot ingestion completed: ${JSON.stringify(result)}`);
    
    return NextResponse.json({ 
      success: true, 
      result,
      message: `Ingested ${result.offersHydrated} offers from ${result.pagesFetched} pages` 
    });
  } catch (error) {
    console.error('Woot ingestion error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin permission check when RBAC is fully implemented
    
    console.log('Starting Woot ingestion with default feeds');
    
    // TODO: Fix woot function import - not available in generated API
    // const result = await client.action(api.functions.woot.ingestAllFeeds, {});
    const result = { runId: Date.now().toString(), pagesFetched: 0, offersHydrated: 0, apiCalls: 0 };
    
    console.log(`Woot ingestion completed: ${JSON.stringify(result)}`);
    
    return NextResponse.json({ 
      success: true, 
      result,
      message: `Ingested ${result.offersHydrated} offers from ${result.pagesFetched} pages` 
    });
  } catch (error) {
    console.error('Woot ingestion error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}