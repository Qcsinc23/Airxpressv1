// convex/schemas/agents.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const agentsSchema = {
  agents: defineTable({
    userId: v.id("users"),
    status: v.string(), // "active" | "inactive" | "busy"
    coverage: v.object({
      states: v.array(v.string()), // ["NJ", "NY", "CT"]
      zipcodes: v.array(v.string()), // ["07001", "07002"]
      maxRadius: v.number(), // miles from home base
      homeBase: v.object({
        address: v.string(),
        lat: v.number(),
        lng: v.number(),
      }),
    }),
    capacity: v.object({
      maxActiveBookings: v.number(),
      currentActiveBookings: v.number(),
      specializations: v.array(v.string()), // ["hazmat", "fragile", "oversized"]
    }),
    contact: v.object({
      phone: v.string(),
      whatsapp: v.optional(v.string()),
      email: v.string(),
    }),
    schedule: v.object({
      timezone: v.string(), // "America/New_York"
      workingHours: v.object({
        monday: v.optional(v.object({ start: v.string(), end: v.string() })),
        tuesday: v.optional(v.object({ start: v.string(), end: v.string() })),
        wednesday: v.optional(v.object({ start: v.string(), end: v.string() })),
        thursday: v.optional(v.object({ start: v.string(), end: v.string() })),
        friday: v.optional(v.object({ start: v.string(), end: v.string() })),
        saturday: v.optional(v.object({ start: v.string(), end: v.string() })),
        sunday: v.optional(v.object({ start: v.string(), end: v.string() })),
      }),
      unavailableDates: v.array(v.string()), // ISO date strings
    }),
    performance: v.object({
      completedBookings: v.number(),
      averageRating: v.number(),
      onTimePercentage: v.number(),
      lastActiveAt: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_status", ["status"])
  .index("by_coverage_state", ["coverage.states"])
  .index("by_performance", ["performance.averageRating", "performance.onTimePercentage"]),

  agentAssignments: defineTable({
    bookingId: v.id("bookings"),
    agentId: v.id("agents"),
    assignedBy: v.id("users"), // admin/ops user who assigned
    assignedAt: v.number(),
    status: v.string(), // "assigned" | "accepted" | "rejected" | "completed"
    notes: v.optional(v.string()),
    autoAssigned: v.boolean(), // true if assigned by algorithm, false if manual
    priority: v.string(), // "low" | "normal" | "high" | "urgent"
    estimatedDuration: v.optional(v.number()), // minutes
    actualDuration: v.optional(v.number()), // minutes when completed
    updatedAt: v.number(),
  })
  .index("by_booking", ["bookingId"])
  .index("by_agent", ["agentId"])
  .index("by_status", ["status"])
  .index("by_assigned_date", ["assignedAt"])
  .index("by_priority", ["priority", "assignedAt"]),

  agentNotifications: defineTable({
    agentId: v.id("agents"),
    type: v.string(), // "booking_assigned" | "booking_updated" | "schedule_reminder" | "performance_alert"
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()), // JSON data related to notification
    read: v.boolean(),
    priority: v.string(), // "low" | "normal" | "high"
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
  .index("by_agent", ["agentId"])
  .index("by_type", ["type"])
  .index("by_read", ["read"])
  .index("by_priority", ["priority", "createdAt"])
  .index("by_expiry", ["expiresAt"]),
};