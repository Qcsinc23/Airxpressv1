// convex/sla.ts
import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Create SLA commitment when booking is created
export const createSlaCommitments = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, { bookingId }) => {
    const booking = await ctx.db.get(bookingId);
    if (!booking) return;

    // Get active SLA templates
    const activeTemplates = await ctx.db
      .query("slaTemplates")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    const now = Date.now();
    const commitments = [];

    for (const template of activeTemplates) {
      // Check if template conditions match this booking
      const matches = await checkTemplateConditions(ctx, template, booking);
      if (!matches) continue;

      // Calculate deadline
      let deadlineMs = now;
      switch (template.timeframe.unit) {
        case "hours":
          deadlineMs += template.timeframe.value * 60 * 60 * 1000;
          break;
        case "days":
          deadlineMs += template.timeframe.value * 24 * 60 * 60 * 1000;
          break;
        case "business_days":
          // Simple approximation - multiply by 1.4 to account for weekends
          deadlineMs += template.timeframe.value * 24 * 60 * 60 * 1000 * 1.4;
          break;
      }

      // Create commitment
      const commitmentId = await ctx.db.insert("slaCommitments", {
        bookingId,
        templateId: template._id,
        templateName: template.name,
        type: template.type,
        deadline: deadlineMs,
        status: "active",
        createdAt: now,
      });

      commitments.push(commitmentId);
    }

    return commitments;
  },
});

// Check if booking meets SLA template conditions
async function checkTemplateConditions(ctx: any, template: any, booking: any): Promise<boolean> {
  for (const condition of template.conditions) {
    // Simple condition checking - can be expanded
    switch (condition.field) {
      case "serviceLevel":
        // Would need to get quote details to check service level
        break;
      case "destination":
        const hasDestination = booking.pickupDetails?.address?.includes(condition.value);
        if (condition.operator === "contains" && !hasDestination) return false;
        break;
      default:
        // Default to true for unknown conditions
        break;
    }
  }
  return true;
}

// Mark SLA commitment as met
export const markSlaCommitmentMet = mutation({
  args: {
    commitmentId: v.id("slaCommitments"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { commitmentId, notes }) => {
    const now = Date.now();
    await ctx.db.patch(commitmentId, {
      status: "met",
      metAt: now,
      notes,
    });
    return commitmentId;
  },
});

// Check for SLA breaches (runs periodically)
export const checkSlaBreaches = action({
  args: {},
  handler: async (ctx): Promise<{ processedBreaches: number }> => {
    const now = Date.now();
    
    // Get active commitments that are past deadline
    const overdueCommitments: any[] = await ctx.runQuery(api.sla.getOverdueCommitments, { currentTime: now });
    
    const breaches: any[] = [];
    
    for (const commitment of overdueCommitments) {
      // Check if breach already exists
      const existingBreach = await ctx.runQuery(api.sla.getBreachByCommitment, {
        commitmentId: commitment._id
      });
      
      if (existingBreach) {
        // Update escalation level if needed
        await ctx.runMutation(api.sla.updateBreachEscalation, {
          breachId: existingBreach._id,
          currentTime: now,
        });
        continue;
      }
      
      // Create new breach
      const hoursOverdue = Math.floor((now - commitment.deadline) / (1000 * 60 * 60));
      const severity = getSeverity(hoursOverdue, commitment.type);
      
      const breachId: any = await ctx.runMutation(api.sla.createSlaBreach, {
        commitment,
        breachedAt: now,
        severity,
        hoursOverdue,
      });
      
      breaches.push(breachId);
    }
    
    return { processedBreaches: breaches.length };
  },
});

// Helper queries
export const getOverdueCommitments = query({
  args: { currentTime: v.number() },
  handler: async (ctx, { currentTime }) => {
    return await ctx.db
      .query("slaCommitments")
      .withIndex("by_breach_check", (q) => 
        q.eq("status", "active").lt("deadline", currentTime)
      )
      .collect();
  },
});

export const getBreachByCommitment = query({
  args: { commitmentId: v.id("slaCommitments") },
  handler: async (ctx, { commitmentId }) => {
    return await ctx.db
      .query("slaBreaches")
      .filter((q) => q.eq(q.field("commitmentId"), commitmentId))
      .first();
  },
});

// Create SLA breach
export const createSlaBreach = mutation({
  args: {
    commitment: v.any(),
    breachedAt: v.number(),
    severity: v.string(),
    hoursOverdue: v.number(),
  },
  handler: async (ctx, { commitment, breachedAt, severity, hoursOverdue }) => {
    // Mark commitment as breached
    await ctx.db.patch(commitment._id, {
      status: "breached",
      breachedAt,
    });
    
    // Create breach record
    const breachId = await ctx.db.insert("slaBreaches", {
      commitmentId: commitment._id,
      bookingId: commitment.bookingId,
      templateName: commitment.templateName,
      type: commitment.type,
      deadline: commitment.deadline,
      breachedAt,
      severity,
      hoursOverdue,
      escalationLevel: 0,
      resolved: false,
      notifications: [],
      createdAt: breachedAt,
    });
    
    return breachId;
  },
});

// Update breach escalation
export const updateBreachEscalation = mutation({
  args: {
    breachId: v.id("slaBreaches"),
    currentTime: v.number(),
  },
  handler: async (ctx, { breachId, currentTime }) => {
    const breach = await ctx.db.get(breachId);
    if (!breach || breach.resolved) return;
    
    const hoursOverdue = Math.floor((currentTime - breach.deadline) / (1000 * 60 * 60));
    
    // Simple escalation logic - escalate every 24 hours
    const newEscalationLevel = Math.floor(hoursOverdue / 24);
    
    if (newEscalationLevel > breach.escalationLevel) {
      await ctx.db.patch(breachId, {
        escalationLevel: newEscalationLevel,
        hoursOverdue,
      });
    }
    
    return breachId;
  },
});

// Get SLA dashboard data
export const getSlaMetrics = query({
  args: { 
    period: v.string(), // "daily" | "weekly" | "monthly"
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, { period, startDate, endDate }) => {
    const metrics = await ctx.db
      .query("slaMetrics")
      .withIndex("by_period_date", (q) => q.eq("period", period))
      .filter((q) => q.and(
        q.gte(q.field("date"), startDate),
        q.lte(q.field("date"), endDate)
      ))
      .collect();
    
    return metrics;
  },
});

// Get active breaches for dashboard
export const getActiveBreaches = query({
  args: {},
  handler: async (ctx) => {
    const allBreaches = await ctx.db
      .query("slaBreaches")
      .withIndex("by_resolved", (q) => q.eq("resolved", false))
      .order("desc")
      .collect();
    
    // Take first 50 breaches
    const breaches = allBreaches.slice(0, 50);
    
    // Get booking details for each breach
    const breachesWithBookings = await Promise.all(
      breaches.map(async (breach: any) => {
        const booking = await ctx.db.get(breach.bookingId);
        return { ...breach, booking };
      })
    );
    
    return breachesWithBookings;
  },
});

// Resolve breach
export const resolveBreach = mutation({
  args: {
    breachId: v.id("slaBreaches"),
    resolvedBy: v.id("users"),
    resolution: v.string(),
  },
  handler: async (ctx, { breachId, resolvedBy, resolution }) => {
    const now = Date.now();
    await ctx.db.patch(breachId, {
      resolved: true,
      resolvedAt: now,
      resolvedBy,
      resolution,
    });
    return breachId;
  },
});

// Helper function to determine breach severity
function getSeverity(hoursOverdue: number, type: string): string {
  if (type === "pickup" || type === "delivery") {
    if (hoursOverdue < 4) return "minor";
    if (hoursOverdue < 24) return "major";
    return "critical";
  }
  
  if (type === "documentation") {
    if (hoursOverdue < 24) return "minor";
    if (hoursOverdue < 72) return "major";
    return "critical";
  }
  
  // Default response SLA
  if (hoursOverdue < 2) return "minor";
  if (hoursOverdue < 8) return "major";
  return "critical";
}
