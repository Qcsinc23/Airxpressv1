// convex/sla-defaults.ts
import { mutation } from "./_generated/server";

// Initialize default SLA templates
export const initializeDefaultSlaTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const defaultTemplates = [
      {
        name: "standard-pickup",
        description: "Standard pickup within 24 hours of booking",
        type: "pickup",
        timeframe: { value: 24, unit: "hours" },
        conditions: [],
        escalationRules: [
          {
            afterMinutes: 60, // 1 hour past deadline
            action: "notify_ops",
            recipients: ["ops"],
          },
          {
            afterMinutes: 240, // 4 hours past deadline
            action: "notify_admin",
            recipients: ["admin"],
          },
        ],
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "jetpak-delivery",
        description: "JetPak delivery within 2 business days",
        type: "delivery",
        timeframe: { value: 2, unit: "business_days" },
        conditions: [
          { field: "serviceLevel", operator: "equals", value: "JetPak" }
        ],
        escalationRules: [
          {
            afterMinutes: 120, // 2 hours past deadline
            action: "notify_ops",
            recipients: ["ops"],
          },
          {
            afterMinutes: 480, // 8 hours past deadline
            action: "notify_admin",
            recipients: ["admin"],
          },
        ],
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "document-completion",
        description: "Required documents uploaded within 48 hours",
        type: "documentation",
        timeframe: { value: 48, unit: "hours" },
        conditions: [],
        escalationRules: [
          {
            afterMinutes: 240, // 4 hours past deadline
            action: "notify_ops",
            recipients: ["ops"],
          },
          {
            afterMinutes: 720, // 12 hours past deadline
            action: "auto_reassign",
            recipients: ["ops"],
          },
        ],
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "customer-response",
        description: "Response to customer inquiries within 4 hours",
        type: "response",
        timeframe: { value: 4, unit: "hours" },
        conditions: [],
        escalationRules: [
          {
            afterMinutes: 30, // 30 minutes past deadline
            action: "notify_ops",
            recipients: ["ops"],
          },
          {
            afterMinutes: 120, // 2 hours past deadline
            action: "notify_admin",
            recipients: ["admin"],
          },
        ],
        active: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
    
    const createdTemplates = [];
    
    for (const template of defaultTemplates) {
      // Check if template already exists
      const existing = await ctx.db
        .query("slaTemplates")
        .withIndex("by_name", (q) => q.eq("name", template.name))
        .first();
        
      if (!existing) {
        const templateId = await ctx.db.insert("slaTemplates", template);
        createdTemplates.push(templateId);
      }
    }
    
    return { 
      message: `Initialized ${createdTemplates.length} SLA templates`,
      createdTemplates 
    };
  },
});