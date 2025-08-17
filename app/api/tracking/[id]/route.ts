// app/api/tracking/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// GET - Public tracking lookup
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: trackingId } = await params;
    
    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID is required' }, { status: 400 });
    }
    
    try {
      // Try to find booking by tracking number in Convex
      const booking = await convex.query(api.functions.bookings.getBookingByTrackingNumber, {
        trackingNumber: trackingId
      });
      
      if (!booking) {
        return NextResponse.json({ error: 'Tracking number not found' }, { status: 404 });
      }
      
      // Get related quote for shipping details
      let quote = null;
      let carrier = 'Unknown Carrier';
      let service = 'STANDARD';
      let origin = { code: 'JFK', name: 'John F. Kennedy International Airport' };
      let destination = { code: 'GEO', name: 'Cheddi Jagan International Airport' };
      
      try {
        quote = await convex.query(api.functions.quotes.getQuote, {
          id: booking.quoteId
        });
        
        if (quote && quote.computedRates && quote.computedRates.length > 0) {
          const rate = quote.computedRates[0];
          carrier = rate.carrier;
          service = rate.serviceLevel;
          origin = { code: rate.departureAirport, name: getAirportName(rate.departureAirport) };
          destination = { code: rate.arrivalAirport, name: getAirportName(rate.arrivalAirport) };
        }
      } catch (quoteError) {
        console.warn('Could not fetch quote for tracking:', quoteError);
      }
      
      // Transform tracking events for public consumption
      const events = booking.trackingEvents.map((event: any) => ({
        timestamp: event.timestamp,
        status: event.status,
        location: event.location || getLocationFromStatus(event.status, origin.code, destination.code),
        description: getStatusDescription(event.status, carrier)
      }));
      
      // Calculate estimated delivery (3-5 days from creation for most destinations)
      const createdDate = new Date(booking.createdAt);
      const estimatedDelivery = new Date(createdDate.getTime() + (4 * 24 * 60 * 60 * 1000)); // 4 days
      
      const trackingData = {
        trackingId,
        status: booking.status,
        carrier,
        service,
        origin,
        destination,
        events,
        estimatedDelivery: estimatedDelivery.toISOString(),
        references: {
          bookingReference: `AX-BK-${booking._id.slice(-8).toUpperCase()}`,
          airWaybill: generateAirwayBill(carrier, booking._id),
        }
      };
      
      return NextResponse.json({
        success: true,
        tracking: trackingData
      });
      
    } catch (convexError) {
      console.error('Convex query error:', convexError);
      return NextResponse.json({ error: 'Tracking number not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Tracking GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function getAirportName(code: string): string {
  const airports: { [key: string]: string } = {
    'JFK': 'John F. Kennedy International Airport',
    'LGA': 'LaGuardia Airport',
    'EWR': 'Newark Liberty International Airport',
    'GEO': 'Cheddi Jagan International Airport',
    'POS': 'Piarco International Airport',
    'KIN': 'Norman Manley International Airport',
    'BGI': 'Grantley Adams International Airport',
    'SJU': 'Luis Muñoz Marín International Airport',
  };
  return airports[code] || `${code} Airport`;
}

function getLocationFromStatus(status: string, originCode: string, destinationCode: string): string {
  const locations: { [key: string]: string } = {
    'BOOKING_CREATED': 'Processing Center',
    'PICKUP_COMPLETED': 'Origin Location',
    'TENDERED_TO_CARRIER': `${originCode} Airport`,
    'DEPARTED_ORIGIN': `${originCode} Airport`,
    'IN_TRANSIT': 'In Transit',
    'ARRIVED': `${destinationCode} Airport`,
    'DELIVERED': 'Final Destination',
  };
  return locations[status] || 'Unknown Location';
}

function getStatusDescription(status: string, carrier: string): string {
  const descriptions: { [key: string]: string } = {
    'BOOKING_CREATED': 'Shipment booking created and confirmed',
    'PICKUP_COMPLETED': 'Package picked up from shipper',
    'TENDERED_TO_CARRIER': `Package tendered to ${carrier}`,
    'DEPARTED_ORIGIN': `Flight departed for destination`,
    'IN_TRANSIT': 'Package is in transit',
    'ARRIVED': 'Package arrived at destination airport',
    'DELIVERED': 'Package delivered successfully',
  };
  return descriptions[status] || 'Status update received';
}

function generateAirwayBill(carrier: string, bookingId: string): string {
  const prefix = carrier === 'Caribbean Airlines' ? 'CAL' :
                carrier === 'Delta Cargo' ? 'DAL' : 'AX';
  return `${prefix}${bookingId.slice(-9).toUpperCase()}`;
}