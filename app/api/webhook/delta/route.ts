// app/api/webhook/delta/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const DeltaWebhookSchema = z.object({
  awbNumber: z.string(), // Air Waybill Number
  statusCode: z.string(),
  statusDescription: z.string(),
  eventDateTime: z.string(),
  locationCode: z.string().optional(),
  locationName: z.string().optional(),
  flightNumber: z.string().optional(),
  authentication: z.object({
    timestamp: z.string(),
    hash: z.string(), // SHA-256 hash for verification
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = DeltaWebhookSchema.parse(body);

    // TODO: Verify authentication hash
    // const expectedHash = createHash('sha256')
    //   .update(`${validatedData.awbNumber}${validatedData.authentication.timestamp}${process.env.DELTA_WEBHOOK_SECRET}`)
    //   .digest('hex');
    // 
    // if (validatedData.authentication.hash !== expectedHash) {
    //   return NextResponse.json({ error: 'Invalid authentication' }, { status: 400 });
    // }

    console.log('Delta Cargo webhook:', validatedData);

    // Map Delta status codes to our internal status
    const statusMap: Record<string, string> = {
      'RCS': 'TENDERED',      // Received
      'DEP': 'IN_TRANSIT',    // Departed
      'ARR': 'ARRIVED',       // Arrived
      'DLV': 'DELIVERED',     // Delivered
      'NFD': 'EXCEPTION',     // Not Found / Exception
      'RTS': 'EXCEPTION',     // Return to Sender
    };

    const internalStatus = statusMap[validatedData.statusCode] || 'IN_TRANSIT';

    // TODO: Update booking status in Convex
    // Find booking by AWB number and update
    // const booking = await findBookingByAWB(validatedData.awbNumber);
    // 
    // if (booking) {
    //   await updateBookingStatus({
    //     bookingId: booking._id,
    //     status: internalStatus,
    //     trackingEvent: {
    //       timestamp: validatedData.eventDateTime,
    //       status: validatedData.statusDescription,
    //       location: validatedData.locationName || validatedData.locationCode,
    //       notes: validatedData.flightNumber ? `Flight: ${validatedData.flightNumber}` : undefined
    //     }
    //   });
    //
    //   // TODO: Send email notification to customer
    //   // await sendTrackingUpdateEmail(booking.userId, booking, validatedData);
    // }

    return NextResponse.json({ 
      success: true, 
      status: internalStatus,
      message: 'Delta tracking update processed',
      awb: validatedData.awbNumber
    });

  } catch (error) {
    console.error('Delta webhook error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid webhook payload', 
        details: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}