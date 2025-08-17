// app/api/user/bookings/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Fetch user bookings from Convex
      const bookings = await convex.query(api.functions.bookings.getBookingsByUser, {
        userId: userId as Id<"users">
      });

      // Transform bookings to match expected API format
      const formattedBookings = await Promise.all(
        bookings.map(async (booking: any) => {
          // Try to get the related quote for pricing information
          let quote = null;
          let totalPrice = 0;
          let carrier = 'Unknown Carrier';
          let route = 'Unknown Route';

          try {
            quote = await convex.query(api.functions.quotes.getQuote, {
              id: booking.quoteId
            });
            
            if (quote && quote.computedRates && quote.computedRates.length > 0) {
              totalPrice = quote.computedRates[0].totalPrice;
              carrier = quote.computedRates[0].carrier;
              route = `${quote.computedRates[0].departureAirport} → ${quote.computedRates[0].arrivalAirport}`;
            }
          } catch (quoteError) {
            console.warn('Could not fetch quote for booking:', booking._id, quoteError);
          }

          return {
            id: booking._id,
            trackingNumber: `AX-TRK-${booking._id.slice(-6).toUpperCase()}`,
            status: booking.status,
            carrier,
            route,
            totalPrice,
            createdAt: new Date(booking.createdAt).toISOString(),
            pickupDetails: booking.pickupDetails,
            trackingEvents: booking.trackingEvents,
          };
        })
      );

      return NextResponse.json({
        success: true,
        bookings: formattedBookings,
      });

    } catch (convexError) {
      console.error('Convex query error:', convexError);
      // Return empty array if query fails but user is authenticated
      return NextResponse.json({
        success: true,
        bookings: [],
      });
    }

  } catch (error) {
    console.error('User bookings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
