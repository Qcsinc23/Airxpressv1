// app/lib/email/emailService.ts
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface BookingConfirmationData {
  bookingId: string;
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  carrier: string;
  serviceLevel: string;
  route: string;
  totalPrice: number;
  pickupTime: string;
  pickupAddress: string;
}

interface TrackingUpdateData {
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  statusDescription: string;
  location?: string;
  carrier: string;
  estimatedDelivery?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.transporter = this.createTransporter();
  }

  private createTransporter(): nodemailer.Transporter {
    if (this.isDevelopment) {
      // Use Ethereal Email for development
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass',
        },
      });
    }

    // Production configuration - Generic SMTP
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
    attachments?: any[]
  ): Promise<void> {
    try {
      const mailOptions = {
        from: `${process.env.APP_NAME || 'AirXpress'} <${process.env.EMAIL_FROM || 'noreply@airxpress.com'}>`,
        to,
        subject,
        html,
        text,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to,
        subject,
      });

      if (this.isDevelopment) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

    } catch (error) {
      logger.error('Failed to send email', error, undefined, undefined);
      throw new Error(`Email delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateBookingConfirmationTemplate(data: BookingConfirmationData): EmailTemplate {
    const subject = `Booking Confirmed - ${data.trackingNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .booking-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .tracking-number { font-size: 24px; font-weight: bold; color: #2563eb; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmed!</h1>
              <p>Your shipment has been successfully booked</p>
            </div>
            
            <div class="content">
              <p>Dear ${data.customerName},</p>
              
              <p>Thank you for choosing AirXpress! Your booking has been confirmed and we're preparing to ship your package.</p>
              
              <div class="booking-details">
                <h3>Booking Details</h3>
                <p><strong>Tracking Number:</strong> <span class="tracking-number">${data.trackingNumber}</span></p>
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
                <p><strong>Carrier:</strong> ${data.carrier}</p>
                <p><strong>Service Level:</strong> ${data.serviceLevel}</p>
                <p><strong>Route:</strong> ${data.route}</p>
                <p><strong>Total Cost:</strong> $${data.totalPrice.toFixed(2)}</p>
              </div>
              
              <div class="booking-details">
                <h3>Pickup Information</h3>
                <p><strong>Scheduled Time:</strong> ${new Date(data.pickupTime).toLocaleString()}</p>
                <p><strong>Address:</strong> ${data.pickupAddress}</p>
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.BASE_URL}/tracking/${data.trackingNumber}" class="button">Track Your Shipment</a>
              </div>
              
              <h3>What's Next?</h3>
              <ul>
                <li>Your shipment is scheduled for pickup at the specified time</li>
                <li>Ensure all required documents are uploaded before pickup</li>
                <li>Have your shipment ready and properly packaged</li>
                <li>You'll receive email updates as your shipment progresses</li>
              </ul>
              
              <p>If you have any questions, please contact our support team at ${process.env.SUPPORT_EMAIL || 'support@airxpress.com'} or call ${process.env.DISPATCH_PHONE || '(201) 555-0100'}.</p>
            </div>
            
            <div class="footer">
              <p>&copy; 2024 AirXpress LLC. All rights reserved.</p>
              <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Booking Confirmed - ${data.trackingNumber}
      
      Dear ${data.customerName},
      
      Thank you for choosing AirXpress! Your booking has been confirmed.
      
      Booking Details:
      - Tracking Number: ${data.trackingNumber}
      - Booking ID: ${data.bookingId}
      - Carrier: ${data.carrier}
      - Service Level: ${data.serviceLevel}
      - Route: ${data.route}
      - Total Cost: $${data.totalPrice.toFixed(2)}
      
      Pickup Information:
      - Scheduled Time: ${new Date(data.pickupTime).toLocaleString()}
      - Address: ${data.pickupAddress}
      
      Track your shipment: ${process.env.BASE_URL}/tracking/${data.trackingNumber}
      
      What's Next:
      - Your shipment is scheduled for pickup at the specified time
      - Ensure all required documents are uploaded before pickup
      - Have your shipment ready and properly packaged
      - You'll receive email updates as your shipment progresses
      
      For support, contact: ${process.env.SUPPORT_EMAIL || 'support@airxpress.com'}
      
      © 2024 AirXpress LLC. All rights reserved.
    `;

    return { subject, html, text };
  }

  private generateTrackingUpdateTemplate(data: TrackingUpdateData): EmailTemplate {
    const subject = `Shipment Update - ${data.trackingNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .status-update { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #2563eb; }
            .tracking-number { font-size: 18px; font-weight: bold; color: #2563eb; }
            .status { font-size: 16px; font-weight: bold; color: #059669; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Shipment Status Update</h1>
              <p class="tracking-number">${data.trackingNumber}</p>
            </div>
            
            <div class="content">
              <p>Dear ${data.customerName},</p>
              
              <p>We have an update on your shipment:</p>
              
              <div class="status-update">
                <h3>Latest Status</h3>
                <p class="status">${data.status.replace('_', ' ')}</p>
                <p><strong>Description:</strong> ${data.statusDescription}</p>
                ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
                <p><strong>Carrier:</strong> ${data.carrier}</p>
                ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(data.estimatedDelivery).toLocaleDateString()}</p>` : ''}
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.BASE_URL}/tracking/${data.trackingNumber}" class="button">View Full Tracking Details</a>
              </div>
              
              <p>You can track your shipment anytime by visiting our tracking page or calling our customer service team.</p>
              
              <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL || 'support@airxpress.com'} or call ${process.env.DISPATCH_PHONE || '(201) 555-0100'}.</p>
            </div>
            
            <div class="footer">
              <p>&copy; 2024 AirXpress LLC. All rights reserved.</p>
              <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Shipment Status Update - ${data.trackingNumber}
      
      Dear ${data.customerName},
      
      We have an update on your shipment:
      
      Latest Status: ${data.status.replace('_', ' ')}
      Description: ${data.statusDescription}
      ${data.location ? `Location: ${data.location}` : ''}
      Carrier: ${data.carrier}
      ${data.estimatedDelivery ? `Estimated Delivery: ${new Date(data.estimatedDelivery).toLocaleDateString()}` : ''}
      
      Track your shipment: ${process.env.BASE_URL}/tracking/${data.trackingNumber}
      
      For support, contact: ${process.env.SUPPORT_EMAIL || 'support@airxpress.com'}
      
      © 2024 AirXpress LLC. All rights reserved.
    `;

    return { subject, html, text };
  }

  async sendBookingConfirmation(data: BookingConfirmationData): Promise<void> {
    const template = this.generateBookingConfirmationTemplate(data);
    await this.sendEmail(
      data.customerEmail,
      template.subject,
      template.html,
      template.text
    );
  }

  async sendTrackingUpdate(data: TrackingUpdateData): Promise<void> {
    const template = this.generateTrackingUpdateTemplate(data);
    await this.sendEmail(
      data.customerEmail,
      template.subject,
      template.html,
      template.text
    );
  }

  async sendWelcomeEmail(customerName: string, customerEmail: string): Promise<void> {
    const subject = 'Welcome to AirXpress!';
    
    const html = `
      <h1>Welcome to AirXpress, ${customerName}!</h1>
      <p>Thank you for creating your account. We're excited to help you ship to the Caribbean!</p>
      <p>Start shipping today by <a href="${process.env.BASE_URL}/quote">getting a quote</a>.</p>
      <p>If you need help, contact us at ${process.env.SUPPORT_EMAIL || 'support@airxpress.com'}</p>
    `;
    
    const text = `
      Welcome to AirXpress, ${customerName}!
      
      Thank you for creating your account. We're excited to help you ship to the Caribbean!
      
      Start shipping today: ${process.env.BASE_URL}/quote
      
      Need help? Contact: ${process.env.SUPPORT_EMAIL || 'support@airxpress.com'}
    `;

    await this.sendEmail(customerEmail, subject, html, text);
  }

  async sendPasswordResetEmail(customerEmail: string, resetToken: string): Promise<void> {
    const subject = 'Reset Your AirXpress Password';
    const resetUrl = `${process.env.BASE_URL}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your AirXpress account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>If you didn't request this reset, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;
    
    const text = `
      Password Reset Request
      
      You requested a password reset for your AirXpress account.
      
      Reset your password: ${resetUrl}
      
      If you didn't request this reset, please ignore this email.
      This link will expire in 1 hour.
    `;

    await this.sendEmail(customerEmail, subject, html, text);
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types for use in other files
export type { BookingConfirmationData, TrackingUpdateData };