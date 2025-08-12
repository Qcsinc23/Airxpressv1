// app/api/webhook/caribbean-airlines/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CarribbeanAirlinesWebhookSchema = z.object({
  trackingNumber: z.string(),
  status: z.string(),
  timestamp: z.string(),
  location: z.string().optional(),
  flightNumber: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  signature: z.string(), // HMAC signature for verification
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CarribbeanAirlinesWebhookSchema.parse(body);

    // TODO: Verify HMAC signature
    // const expectedSignature = createHmac('sha256', process.env.CAL_WEBHOOK_SECRET!)
    //   .update(JSON.stringify(body))
    //   .digest('hex');
    // 
    // if (validatedData.signature !== expectedSignature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    // }

    console.log('Caribbean Airlines webhook:', validatedData);

    // Map Caribbean Airlines status to our internal status
    const statusMap: Record<string, string> = {
      'RECEIVED': 'TENDERED',
      'LOADED': 'IN_TRANSIT',
      'DEPARTED': 'IN_TRANSIT',
      'ARRIVED': 'ARRIVED',
      'DELIVERED': 'DELIVERED',
      'RETURNED': 'EXCEPTION',
    };

    const internalStatus = statusMap[validatedData.status] || 'IN_TRANSIT';

    // TODO: Update booking status in Convex
    // Find booking by tracking number and update
    // const booking = await findBookingByTrackingNumber(validatedData.trackingNumber);
    // 
    // if (booking) {
    //   await updateBookingStatus({
    //     bookingId: booking._id,
    //     status: internalStatus,
    //     trackingEvent: {
    //       timestamp: validatedData.timestamp,
    //       status: validatedData.status,
    //       location: validatedData.location,
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
      message: 'Tracking update processed' 
    });

  } catch (error) {
    console.error('Caribbean Airlines webhook error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid webhook payload', 
        details: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}