// app/api/user/quotes/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

import { getConvexClient } from '../../../lib/convex/client';
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Fetch user quotes from Convex
      const quotes = await getConvexClient().query(api.functions.quotes.getQuotesByUser, {
        userId: userId as Id<"users">
      });

      // Transform quotes to match expected API format
      const formattedQuotes = quotes.map(quote => ({
        id: quote._id,
        input: quote.input,
        computedRates: quote.computedRates,
        createdAt: new Date(quote.createdAt).toISOString(),
        expiry: quote.expiry,
        isExpired: new Date() > new Date(quote.expiry),
      }));

      return NextResponse.json({
        success: true,
        quotes: formattedQuotes,
      });

    } catch (convexError) {
      console.error('Convex query error:', convexError);
      // Return empty array if query fails but user is authenticated
      return NextResponse.json({
        success: true,
        quotes: [],
      });
    }

  } catch (error) {
    console.error('User quotes API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
