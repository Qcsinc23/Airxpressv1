// app/api/support/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const SupportRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  urgent: z.boolean().default(false),
  bookingId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const validatedData = SupportRequestSchema.parse(body);

    // TODO: Implement email service (Nodemailer, SendGrid, etc.)
    console.log('Support request received:', {
      userId,
      ...validatedData,
      timestamp: new Date().toISOString(),
    });

    // For now, just log the request
    // In production, you would:
    // 1. Send email to support team
    // 2. Create ticket in support system
    // 3. Send confirmation email to customer
    // 4. If urgent, trigger SMS/phone alert

    const emailSubject = validatedData.urgent 
      ? `🚨 URGENT: ${validatedData.subject}`
      : `Support Request: ${validatedData.subject}`;

    const emailBody = `
      New support request received:
      
      From: ${validatedData.name} (${validatedData.email})
      ${validatedData.phone ? `Phone: ${validatedData.phone}` : ''}
      ${validatedData.bookingId ? `Booking ID: ${validatedData.bookingId}` : ''}
      ${userId ? `User ID: ${userId}` : ''}
      
      Subject: ${validatedData.subject}
      Priority: ${validatedData.urgent ? 'URGENT' : 'Normal'}
      
      Message:
      ${validatedData.message}
      
      Submitted: ${new Date().toLocaleString()}
    `;

    // TODO: Replace with actual email service
    console.log('Would send email:', {
      to: 'support@cargoexpressnj.com',
      subject: emailSubject,
      body: emailBody,
    });

    return NextResponse.json({
      success: true,
      message: 'Support request submitted successfully',
      ticketId: `TICKET_${Date.now()}`, // Generate proper ticket ID in production
    });

  } catch (error) {
    console.error('Support API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.issues,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to submit support request',
    }, { status: 500 });
  }
}