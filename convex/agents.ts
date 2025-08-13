// convex/agents.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create or update agent profile
export const createAgentProfile = mutation({
  args: {
    userId: v.id("users"),
    coverage: v.object({
      states: v.array(v.string()),
      zipcodes: v.array(v.string()),
      maxRadius: v.number(),
      homeBase: v.object({
        address: v.string(),
        lat: v.number(),
        lng: v.number(),
      }),
    }),
    capacity: v.object({
      maxActiveBookings: v.number(),
      specializations: v.array(v.string()),
    }),
    contact: v.object({
      phone: v.string(),
      whatsapp: v.optional(v.string()),
      email: v.string(),
    }),
    schedule: v.object({
      timezone: v.string(),
      workingHours: v.object({
        monday: v.optional(v.object({ start: v.string(), end: v.string() })),
        tuesday: v.optional(v.object({ start: v.string(), end: v.string() })),
        wednesday: v.optional(v.object({ start: v.string(), end: v.string() })),
        thursday: v.optional(v.object({ start: v.string(), end: v.string() })),
        friday: v.optional(v.object({ start: v.string(), end: v.string() })),
        saturday: v.optional(v.object({ start: v.string(), end: v.string() })),
        sunday: v.optional(v.object({ start: v.string(), end: v.string() })),
      }),
      unavailableDates: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if agent profile already exists
    const existingAgent = await ctx.db
      .query("agents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existingAgent) {
      // Update existing agent
      await ctx.db.patch(existingAgent._id, {
        coverage: args.coverage,
        capacity: {
          ...args.capacity,
          currentActiveBookings: existingAgent.capacity.currentActiveBookings,
        },
        contact: args.contact,
        schedule: args.schedule,
        updatedAt: now,
      });
      return existingAgent._id;
    } else {
      // Create new agent
      const agentId = await ctx.db.insert("agents", {
        userId: args.userId,
        status: "active",
        coverage: args.coverage,
        capacity: {
          ...args.capacity,
          currentActiveBookings: 0,
        },
        contact: args.contact,
        schedule: args.schedule,
        performance: {
          completedBookings: 0,
          averageRating: 5.0,
          onTimePercentage: 100,
          lastActiveAt: now,
        },
        createdAt: now,
        updatedAt: now,
      });
      return agentId;
    }
  },
});

// Get agent profile by user ID
export const getAgentProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

// Get all active agents for assignment
export const getAvailableAgents = query({
  args: {
    state: v.optional(v.string()),
    zipcode: v.optional(v.string()),
    specialization: v.optional(v.string()),
  },
  handler: async (ctx, { state, zipcode, specialization }) => {
    let agents = await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Filter by coverage area
    if (state) {
      agents = agents.filter(agent => 
        agent.coverage.states.includes(state)
      );
    }

    if (zipcode) {
      agents = agents.filter(agent => 
        agent.coverage.zipcodes.includes(zipcode)
      );
    }

    // Filter by specialization
    if (specialization) {
      agents = agents.filter(agent =>
        agent.capacity.specializations.includes(specialization)
      );
    }

    // Filter by capacity (not at max bookings)
    agents = agents.filter(agent =>
      agent.capacity.currentActiveBookings < agent.capacity.maxActiveBookings
    );

    return agents;
  },
});

// Auto-assign booking to best available agent
export const autoAssignBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    assignedBy: v.id("users"),
    priority: v.string(),
  },
  handler: async (ctx, { bookingId, assignedBy, priority }) => {
    // Get booking details
    const booking = await ctx.db.get(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Extract location info from pickup details
    const pickupAddress = booking.pickupDetails?.address || "";
    
    // For now, use simple assignment logic - in production this would use
    // more sophisticated algorithms considering distance, workload, etc.
    const availableAgents = await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const eligibleAgents = availableAgents.filter(agent =>
      agent.capacity.currentActiveBookings < agent.capacity.maxActiveBookings
    );

    if (eligibleAgents.length === 0) {
      throw new Error("No available agents for assignment");
    }

    // Simple assignment: pick agent with best performance and lowest workload
    const bestAgent = eligibleAgents.reduce((best, current) => {
      const bestScore = best.performance.averageRating * best.performance.onTimePercentage / 100;
      const currentScore = current.performance.averageRating * current.performance.onTimePercentage / 100;
      
      if (currentScore > bestScore) return current;
      if (currentScore === bestScore && current.capacity.currentActiveBookings < best.capacity.currentActiveBookings) {
        return current;
      }
      return best;
    });

    const now = Date.now();

    // Create assignment
    const assignmentId = await ctx.db.insert("agentAssignments", {
      bookingId,
      agentId: bestAgent._id,
      assignedBy,
      assignedAt: now,
      status: "assigned",
      autoAssigned: true,
      priority,
      updatedAt: now,
    });

    // Update agent's current booking count
    await ctx.db.patch(bestAgent._id, {
      capacity: {
        ...bestAgent.capacity,
        currentActiveBookings: bestAgent.capacity.currentActiveBookings + 1,
      },
      updatedAt: now,
    });

    // Create notification for agent
    await ctx.db.insert("agentNotifications", {
      agentId: bestAgent._id,
      type: "booking_assigned",
      title: "New Booking Assignment",
      message: `You have been assigned booking ${bookingId}`,
      data: { bookingId, assignmentId, priority },
      read: false,
      priority: priority === "urgent" ? "high" : "normal",
      createdAt: now,
    });

    return assignmentId;
  },
});

// Get agent's assigned bookings
export const getAgentBookings = query({
  args: { agentId: v.id("agents"), status: v.optional(v.string()) },
  handler: async (ctx, { agentId, status }) => {
    let query = ctx.db
      .query("agentAssignments")
      .withIndex("by_agent", (q) => q.eq("agentId", agentId));

    const assignments = await query.collect();
    
    const filteredAssignments = status 
      ? assignments.filter(a => a.status === status)
      : assignments;

    // Get booking details for each assignment
    const bookingsWithAssignments = await Promise.all(
      filteredAssignments.map(async (assignment) => {
        const booking = await ctx.db.get(assignment.bookingId);
        return {
          assignment,
          booking,
        };
      })
    );

    return bookingsWithAssignments.filter(item => item.booking !== null);
  },
});

// Update assignment status (for agent mobile app)
export const updateAssignmentStatus = mutation({
  args: {
    assignmentId: v.id("agentAssignments"),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { assignmentId, status, notes }) => {
    const assignment = await ctx.db.get(assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const now = Date.now();

    await ctx.db.patch(assignmentId, {
      status,
      notes,
      updatedAt: now,
    });

    // If completing assignment, update agent capacity and performance
    if (status === "completed") {
      const agent = await ctx.db.get(assignment.agentId);
      if (agent) {
        await ctx.db.patch(assignment.agentId, {
          capacity: {
            ...agent.capacity,
            currentActiveBookings: Math.max(0, agent.capacity.currentActiveBookings - 1),
          },
          performance: {
            ...agent.performance,
            completedBookings: agent.performance.completedBookings + 1,
            lastActiveAt: now,
          },
          updatedAt: now,
        });
      }
    }

    return assignmentId;
  },
});

// Get agent notifications
export const getAgentNotifications = query({
  args: { agentId: v.id("agents"), unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, { agentId, unreadOnly }) => {
    let query = ctx.db
      .query("agentNotifications")
      .withIndex("by_agent", (q) => q.eq("agentId", agentId));

    const notifications = await query.collect();
    
    const filtered = unreadOnly 
      ? notifications.filter(n => !n.read)
      : notifications;

    // Remove expired notifications
    const now = Date.now();
    return filtered.filter(n => !n.expiresAt || n.expiresAt > now);
  },
});

// Mark notification as read
export const markNotificationRead = mutation({
  args: { notificationId: v.id("agentNotifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { read: true });
    return notificationId;
  },
});