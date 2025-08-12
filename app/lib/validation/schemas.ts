// app/lib/validation/schemas.ts
import { z } from 'zod';

// Common validation schemas
export const ZipCodeSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format');

export const PhoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits');

export const EmailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email is too long');

// Piece validation
export const PieceSchema = z.object({
  type: z.enum(['barrel', 'box'], { message: 'Piece type is required' }),
  weight: z
    .number()
    .positive('Weight must be greater than 0')
    .max(200, 'Weight cannot exceed 200 lbs per piece'),
  dimensions: z
    .object({
      length: z.number().nonnegative('Length cannot be negative').max(120, 'Length cannot exceed 120 inches'),
      width: z.number().nonnegative('Width cannot be negative').max(120, 'Width cannot exceed 120 inches'),
      height: z.number().nonnegative('Height cannot be negative').max(120, 'Height cannot exceed 120 inches'),
    })
    .optional()
    .refine((dims) => {
      if (!dims) return true;
      // Calculate dimensional weight (L x W x H / 166)
      const dimWeight = (dims.length * dims.width * dims.height) / 166;
      return dimWeight <= 500; // Max dimensional weight
    }, 'Package dimensions are too large'),
});

// Quote request validation
export const QuoteRequestSchema = z.object({
  originZip: ZipCodeSchema,
  destCountry: z
    .string()
    .min(1, 'Destination country is required')
    .refine((country) => 
      ['Guyana', 'Trinidad', 'Jamaica', 'Barbados', 'Puerto Rico'].includes(country),
      'Destination country not supported'
    ),
  destCity: z.string().max(100, 'City name is too long').optional(),
  pieces: z
    .array(PieceSchema)
    .min(1, 'At least one piece is required')
    .max(10, 'Maximum 10 pieces per shipment')
    .refine((pieces) => {
      const totalWeight = pieces.reduce((sum, piece) => sum + piece.weight, 0);
      return totalWeight <= 500;
    }, 'Total weight cannot exceed 500 lbs'),
  serviceLevel: z.enum(['STANDARD', 'EXPRESS', 'NFO'], { 
    message: 'Service level is required' 
  }),
  afterHours: z.boolean().optional().default(false),
  isPersonalEffects: z.boolean().optional().default(false),
});

// Pickup details validation
export const PickupDetailsSchema = z.object({
  scheduledTime: z
    .string()
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const now = new Date();
      return date > now;
    }, 'Pickup time must be in the future'),
  address: z
    .string()
    .min(10, 'Address is too short')
    .max(255, 'Address is too long'),
  contact: z
    .string()
    .min(5, 'Contact information is required')
    .max(255, 'Contact information is too long'),
  specialInstructions: z
    .string()
    .max(500, 'Instructions are too long')
    .optional(),
});

// Booking request validation
export const BookingRequestSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID is required'),
  pickupDetails: PickupDetailsSchema,
  paymentMethodId: z.string().min(1, 'Payment method is required'),
});

// User profile validation
export const UserProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: EmailSchema,
  phone: PhoneSchema.optional(),
  company: z.string().max(100).optional(),
  address: z.object({
    street: z.string().min(5, 'Street address is required').max(255),
    city: z.string().min(2, 'City is required').max(100),
    state: z.string().min(2, 'State is required').max(50),
    zipCode: ZipCodeSchema,
  }).optional(),
});

// Document upload validation
export const DocumentUploadSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  documentType: z.enum([
    'commercial_invoice',
    'packing_list', 
    'customs_declaration',
    'photo_id',
    'authorization_letter',
    'other'
  ]),
  fileName: z.string().min(1, 'File name is required').max(255),
  fileSize: z.number().positive().max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),
  fileType: z.string().refine((type) => 
    ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'].includes(type),
    'File type not supported'
  ),
});

// API response schemas
export const ApiErrorSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
  code: z.string().optional(),
});

export const ApiSuccessSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
});

// Rate validation
export const RateSchema = z.object({
  laneId: z.string(),
  carrier: z.string(),
  serviceLevel: z.enum(['STANDARD', 'EXPRESS', 'NFO']),
  transitTime: z.number().positive(),
  totalPrice: z.number().positive(),
  breakdown: z.object({
    baseRate: z.number().positive(),
    fuelSurcharge: z.number().nonnegative(),
    securityFee: z.number().nonnegative(),
    afterHoursFee: z.number().positive().optional(),
    oversizeFee: z.number().positive().optional(),
  }),
  cutOffTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  departureAirport: z.string().min(3).max(3),
  arrivalAirport: z.string().min(3).max(3),
  validUntil: z.string().datetime(),
});

// Tracking validation
export const TrackingSchema = z.object({
  trackingId: z.string().min(1, 'Tracking ID is required'),
});

// Webhook validation
export const WebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  timestamp: z.string().datetime(),
  data: z.any(),
  source: z.enum(['stripe', 'caribbean-airlines', 'delta', 'internal']),
});

// Export type inference helpers
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
export type PickupDetails = z.infer<typeof PickupDetailsSchema>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type DocumentUpload = z.infer<typeof DocumentUploadSchema>;
export type Rate = z.infer<typeof RateSchema>;
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;