// app/api/user/bookings/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Implement Convex query to fetch user bookings
    // const bookings = await getUserBookings(userId);
    
    // Mock data for now
    const mockBookings = [
      {
        id: 'booking-1',
        trackingNumber: 'AX-TRK-001',
        status: 'IN_TRANSIT',
        carrier: 'Caribbean Airlines',
        route: 'JFK → GEO',
        totalPrice: 150.00,
        createdAt: '2024-08-09T10:00:00Z',
      },
      {
        id: 'booking-2', 
        trackingNumber: 'AX-TRK-002',
        status: 'DELIVERED',
        carrier: 'Delta Cargo',
        route: 'JFK → KIN',
        totalPrice: 125.00,
        createdAt: '2024-08-08T14:30:00Z',
      },
    ];

    return NextResponse.json({
      success: true,
      bookings: mockBookings,
    });

  } catch (error) {
    console.error('User bookings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}