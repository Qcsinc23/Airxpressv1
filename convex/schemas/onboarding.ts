// convex/schemas/onboarding.ts
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  acknowledgements: defineTable({
    userId: v.id("users"),
    bookingId: v.string(),
    version: v.string(),
    initials: v.string(),
    signedAt: v.number(),
    ip: v.optional(v.string()),
  }).index("byUser", ["userId", "signedAt"])
    .index("byBooking", ["bookingId"]),

  checklistItems: defineTable({
    userId: v.id("users"),
    bookingId: v.string(),
    key: v.string(),
    label: v.string(),
    done: v.boolean(),
    updatedAt: v.number(),
  }).index("byUserBooking", ["userId", "bookingId"])
    .index("byBooking", ["bookingId"]),

  shippingInvoices: defineTable({
    bookingId: v.string(),
    userId: v.id("users"),
    shipFrom: v.object({
      name: v.string(),
      phone: v.string(),
      address: v.string(),
    }),
    shipTo: v.object({
      name: v.string(),
      phone: v.string(),
      address: v.string(),
      destination: v.string(),
    }),
    mode: v.string(),
    awbNumber: v.optional(v.string()),
    documentNo: v.optional(v.string()),
    paymentTerms: v.array(v.string()),
    freightCollect: v.boolean(),
    serviceType: v.string(),
    insurance: v.object({
      accepted: v.boolean(),
      value: v.optional(v.number()),
      initials: v.optional(v.string()),
    }),
    items: v.array(v.object({
      description: v.string(),
      lengthIn: v.number(),
      widthIn: v.number(),
      heightIn: v.number(),
      pieces: v.number(),
      cubicFt: v.number(),
      weightLb: v.number(),
    })),
    instructions: v.optional(v.string()),
    charges: v.object({
      freight: v.number(),
      pickup: v.number(),
      packing: v.number(),
      others: v.number(),
      subtotal: v.number(),
      deposit: v.number(),
      freightCollectFee: v.number(),
      balanceDue: v.number(),
    }),
    hazardous: v.boolean(),
    signature: v.object({
      initials: v.string(),
      signedAtISO: v.string(),
    }),
    disclaimerVersion: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byBooking", ["bookingId"])
    .index("byUser", ["userId", "createdAt"]),
});