// convex/bookings.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    // Create the booking
    const bookingId = await ctx.db.insert("bookings", {
      quoteId: args.quoteId,
      userId: args.userId,
      status: "NEW",
      trackingEvents: [{
        timestamp: new Date().toISOString(),
        status: "BOOKING_CREATED",
        notes: "Booking created and payment processed",
      }],
      paymentId: args.paymentIntentId,
      documents: [],
      pickupDetails: args.pickupDetails,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Initialize the onboarding checklist
    await ctx.runMutation("onboarding:initializeBookingChecklist", {
      userId: args.userId,
      bookingId: bookingId,
    });

    return bookingId;
  },
});

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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { bookingId, status, notes }) => {
    const booking = await ctx.db.get(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Add tracking event
    const trackingEvent = {
      timestamp: new Date().toISOString(),
      status,
      notes,
    };

    // Update booking
    await ctx.db.patch(bookingId, {
      status,
      trackingEvents: [...booking.trackingEvents, trackingEvent],
      updatedAt: Date.now(),
    });

    return bookingId;
  },
});

export const getUserBookings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const bookings = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();

    return bookings;
  },
});

export const getBookingWithProgress = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, { bookingId }) => {
    const booking = await ctx.db.get(bookingId);
    if (!booking) {
      return null;
    }

    // Get progress information
    const progress = await ctx.runQuery("onboarding:getBookingProgress", {
      bookingId: bookingId,
    });

    return {
      ...booking,
      progress,
    };
  },
});

export const getOpsBookings = query({
  args: {},
  handler: async (ctx) => {
    // Get all bookings for ops dashboard
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("byStatus")
      .order("desc")
      .collect();

    // Get progress for each booking
    const bookingsWithProgress = await Promise.all(
      bookings.map(async (booking) => {
        const progress = await ctx.runQuery("onboarding:getBookingProgress", {
          bookingId: booking._id,
        });
        return {
          ...booking,
          progress,
        };
      })
    );

    return bookingsWithProgress;
  },
});