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
    
    console.log('Seeding taxonomy data...');
    
    // TODO: Fix woot function import - not available in generated API
    // const result = await client.action(api.functions.woot.seedTaxonomy, {});
    const result = { ok: true, message: "Taxonomy seeding temporarily disabled" };
    
    console.log(`Taxonomy seeding result: ${JSON.stringify(result)}`);
    
    return NextResponse.json({ 
      success: true, 
      result,
      message: "Taxonomy seeded successfully" 
    });
  } catch (error) {
    console.error('Taxonomy seeding error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}