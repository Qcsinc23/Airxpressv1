// convex/bookings.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
    autoAssignAgent: v.optional(v.boolean()),
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
    await ctx.runMutation(api.onboarding.initializeBookingChecklist, {
      userId: args.userId,
      bookingId: bookingId,
    });

    // Create SLA commitments for this booking
    try {
      await ctx.runMutation(api.sla.createSlaCommitments, {
        bookingId: bookingId,
      });
    } catch (error) {
      console.warn("Failed to create SLA commitments:", error);
      // Continue without SLA - this is not a critical failure
    }

    // Auto-assign agent if requested and agents are available
    if (args.autoAssignAgent) {
      try {
        await ctx.runMutation(api.agents.autoAssignBooking, {
          bookingId: bookingId,
          assignedBy: args.userId, // System assignment
          priority: "normal",
        });
        
        // Add tracking event for agent assignment
        const booking = await ctx.db.get(bookingId);
        if (booking) {
          await ctx.db.patch(bookingId, {
            trackingEvents: [
              ...booking.trackingEvents,
              {
                timestamp: new Date().toISOString(),
                status: "AGENT_ASSIGNED",
                notes: "Agent automatically assigned for pickup coordination",
              }
            ],
            updatedAt: Date.now(),
          });
        }
      } catch (error) {
        console.warn("Failed to auto-assign agent:", error);
        // Continue without assignment - this is not a critical failure
      }
    }

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
  handler: async (ctx, { bookingId }): Promise<any> => {
    const booking = await ctx.db.get(bookingId);
    if (!booking) {
      return null;
    }

    // Get progress information
    const progress = await ctx.runQuery(api.onboarding.getBookingProgress, {
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
  handler: async (ctx): Promise<any[]> => {
    // Get all bookings for ops dashboard
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("byStatus")
      .order("desc")
      .collect();

    // Get progress and agent assignment for each booking
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking): Promise<any> => {
        // Get progress
        const progress = await ctx.runQuery(api.onboarding.getBookingProgress, {
          bookingId: booking._id,
        });
        
        // Get agent assignment if any
        const assignment = await ctx.db
          .query("agentAssignments")
          .withIndex("by_booking", (q) => q.eq("bookingId", booking._id))
          .order("desc")
          .first();
        
        let assignedAgent = null;
        if (assignment) {
          assignedAgent = await ctx.db.get(assignment.agentId);
        }
        
        return {
          ...booking,
          progress,
          assignment,
          assignedAgent,
        };
      })
    );

    return bookingsWithDetails;
  },
});

// New query for agent-specific bookings (role-based filtering)
export const getAgentAreaBookings = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, { agentId }) => {
    const agent = await ctx.db.get(agentId);
    if (!agent) {
      return [];
    }

    // Get all unassigned bookings in agent's coverage area
    const allBookings = await ctx.db
      .query("bookings")
      .withIndex("byStatus")
      .filter((q) => q.or(
        q.eq(q.field("status"), "NEW"),
        q.eq(q.field("status"), "NEEDS_DOCS")
      ))
      .collect();

    // Filter bookings based on agent's coverage area
    // For now, this is simplified - in production, you'd use geographic filtering
    const eligibleBookings = allBookings.filter(booking => {
      // Check if booking has no current assignment
      return booking.pickupDetails?.address && 
             agent.coverage.states.some(state => 
               booking.pickupDetails?.address.includes(state)
             );
    });

    // Get only unassigned bookings
    const unassignedBookings = [];
    for (const booking of eligibleBookings) {
      const existingAssignment = await ctx.db
        .query("agentAssignments")
        .withIndex("by_booking", (q) => q.eq("bookingId", booking._id))
        .first();
        
      if (!existingAssignment) {
        unassignedBookings.push(booking);
      }
    }

    return unassignedBookings;
  },
});
