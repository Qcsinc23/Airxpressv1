// convex/functions/bookings.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Create a new booking
export const createBooking = mutation({
  args: {
    quoteId: v.id("quotes"),
    userId: v.id("users"),
    pickupDetails: v.object({
      scheduledTime: v.string(),
      address: v.string(),
      contact: v.string(),
      specialInstructions: v.optional(v.string()),
    }),
    paymentIntentId: v.optional(v.string()),
    autoAssignAgent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const booking = {
      quoteId: args.quoteId,
      userId: args.userId,
      status: "NEW" as const,
      trackingEvents: [{
        timestamp: new Date().toISOString(),
        status: "BOOKING_CREATED",
      }],
      documents: [],
      pickupDetails: args.pickupDetails,
      paymentId: args.paymentIntentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    const bookingId = await ctx.db.insert("bookings", booking);
    return bookingId;
  },
});

// Update booking status
export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("NEW"),
      v.literal("NEEDS_DOCS"),
      v.literal("READY_TO_TENDER"),
      v.literal("TENDERED"),
      v.literal("IN_TRANSIT"),
      v.literal("ARRIVED"),
      v.literal("DELIVERED"),
      v.literal("CANCELLED")
    ),
    trackingEvent: v.optional(v.object({
      timestamp: v.string(),
      status: v.string(),
      location: v.optional(v.string()),
      notes: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };
    
    if (args.trackingEvent) {
      updates.trackingEvents = [...booking.trackingEvents, args.trackingEvent];
    }
    
    await ctx.db.patch(args.bookingId, updates);
    return await ctx.db.get(args.bookingId);
  },
});

// Get a booking by ID
export const getBooking = query({
  args: {
    id: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get bookings by status
export const getBookingsByStatus = query({
  args: {
    status: v.union(
      v.literal("NEW"),
      v.literal("NEEDS_DOCS"),
      v.literal("READY_TO_TENDER"),
      v.literal("TENDERED"),
      v.literal("IN_TRANSIT"),
      v.literal("ARRIVED"),
      v.literal("DELIVERED"),
      v.literal("CANCELLED")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("bookings").withIndex("byStatus", q => q.eq("status", args.status)).collect();
  },
});

// Get all bookings for ops dashboard
export const getOpsBookings = query({
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").collect();
    
    // Add computed fields for ops dashboard
    return bookings.map(booking => ({
      ...booking,
      progress: {
        progressPercentage: Math.min(100, Math.max(0, 
          booking.status === 'NEW' ? 10 :
          booking.status === 'NEEDS_DOCS' ? 25 :
          booking.status === 'READY_TO_TENDER' ? 50 :
          booking.status === 'TENDERED' ? 70 :
          booking.status === 'IN_TRANSIT' ? 85 :
          booking.status === 'ARRIVED' ? 95 : 100
        )),
        missingDocs: booking.documents && booking.documents.length === 0 ? 
          ['Commercial Invoice', 'Packing List'] : []
      }
    }));
  },
});
