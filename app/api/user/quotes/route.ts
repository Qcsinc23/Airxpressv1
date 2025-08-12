// app/api/user/quotes/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Implement Convex query to fetch user quotes
    // const quotes = await getUserQuotes(userId);
    
    // Mock data for now
    const mockQuotes = [
      {
        id: 'quote-1',
        input: {
          originZip: '07001',
          destCountry: 'Guyana',
          pieces: [{ type: 'box', weight: 10 }],
          serviceLevel: 'EXPRESS',
        },
        computedRates: [
          {
            laneId: 'cal-JFK-GEO',
            carrier: 'Caribbean Airlines',
            totalPrice: 150.00,
          },
        ],
        createdAt: '2024-08-09T10:00:00Z',
        expiry: '2024-08-10T10:00:00Z',
      },
    ];

    return NextResponse.json({
      success: true,
      quotes: mockQuotes,
    });

  } catch (error) {
    console.error('User quotes API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
