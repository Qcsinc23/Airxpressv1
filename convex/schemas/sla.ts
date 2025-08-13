// convex/schemas/sla.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const slaSchema = {
  slaTemplates: defineTable({
    name: v.string(), // "standard-pickup", "jetpak-delivery", "document-completion"
    description: v.string(),
    type: v.string(), // "pickup" | "delivery" | "documentation" | "response"
    timeframe: v.object({
      value: v.number(), // e.g., 24, 2, 7
      unit: v.string(), // "hours" | "days" | "business_days"
    }),
    conditions: v.array(v.object({
      field: v.string(), // "serviceLevel", "destination", "packageType"
      operator: v.string(), // "equals", "contains", "greater_than"
      value: v.any(),
    })),
    escalationRules: v.array(v.object({
      afterMinutes: v.number(), // minutes past deadline
      action: v.string(), // "notify_ops", "notify_admin", "auto_reassign"
      recipients: v.array(v.string()), // user IDs or roles
    })),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_name", ["name"])
  .index("by_type", ["type"])
  .index("by_active", ["active"]),

  slaCommitments: defineTable({
    bookingId: v.id("bookings"),
    templateId: v.id("slaTemplates"),
    templateName: v.string(), // denormalized for easier querying
    type: v.string(), // "pickup" | "delivery" | "documentation" | "response"
    deadline: v.number(), // Unix timestamp
    status: v.string(), // "active" | "met" | "breached" | "cancelled"
    createdAt: v.number(),
    metAt: v.optional(v.number()),
    breachedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
  .index("by_booking", ["bookingId"])
  .index("by_deadline", ["deadline"])
  .index("by_status", ["status"])
  .index("by_template", ["templateId"])
  .index("by_breach_check", ["status", "deadline"]), // for finding breaches

  slaBreaches: defineTable({
    commitmentId: v.id("slaCommitments"),
    bookingId: v.id("bookings"),
    templateName: v.string(),
    type: v.string(),
    deadline: v.number(),
    breachedAt: v.number(),
    severity: v.string(), // "minor" | "major" | "critical"
    hoursOverdue: v.number(),
    escalationLevel: v.number(), // 0=initial, 1=first escalation, etc.
    resolved: v.boolean(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id("users")),
    resolution: v.optional(v.string()),
    notifications: v.array(v.object({
      sentAt: v.number(),
      recipients: v.array(v.string()),
      action: v.string(),
    })),
    createdAt: v.number(),
  })
  .index("by_booking", ["bookingId"])
  .index("by_severity", ["severity"])
  .index("by_resolved", ["resolved"])
  .index("by_escalation", ["escalationLevel"]),

  slaMetrics: defineTable({
    period: v.string(), // "daily", "weekly", "monthly"
    date: v.string(), // YYYY-MM-DD format
    totalCommitments: v.number(),
    metCommitments: v.number(),
    breachedCommitments: v.number(),
    averageResponseTime: v.number(), // minutes
    complianceRate: v.number(), // percentage
    breachesByType: v.object({
      pickup: v.number(),
      delivery: v.number(),
      documentation: v.number(),
      response: v.number(),
    }),
    breachesBySeverity: v.object({
      minor: v.number(),
      major: v.number(),
      critical: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_period_date", ["period", "date"])
  .index("by_compliance", ["complianceRate"]),
};