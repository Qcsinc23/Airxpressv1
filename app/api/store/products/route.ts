import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const ProductInput = z.object({
  source: z.literal("internal").default("internal"),
  sourceId: z.string().default(""),
  title: z.string().min(1),
  subtitle: z.string().optional().default(""),
  description: z.string().optional().default(""),
  photos: z.array(z.string().url()).default([]),
  price: z.number().nonnegative(),
  currency: z.string().default("USD"),
  weightLb: z.number().positive().optional(),
  dimensionsIn: z
    .object({ length: z.number().positive(), width: z.number().positive(), height: z.number().positive() })
    .optional(),
  attributes: z.record(z.string()).default({}),
  availability: z.enum(["in_stock", "sold_out"]).default("in_stock"),
});

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = ProductInput.parse(body);

  const id = await client.mutation(api.functions.utils.insertProduct, {
    ...parsed,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return NextResponse.json({ success: true, id });
}

export async function GET() {
  try {
    const list = await client.query(api.functions.utils.listProducts, {});
    return NextResponse.json({ success: true, data: list });
  } catch (convexError) {
    console.error('Convex query error:', convexError);
    // Return empty list when Convex is not configured
    return NextResponse.json({ success: true, data: [] });
  }
}