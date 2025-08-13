// convex/onboarding.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertChecklist = mutation({
  args: {
    userId: v.id("users"),
    bookingId: v.string(),
    key: v.string(),
    label: v.string(),
    done: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Look for existing checklist item
    const existingItem = await ctx.db
      .query("checklistItems")
      .withIndex("byUserBooking", (q) => 
        q.eq("userId", args.userId).eq("bookingId", args.bookingId)
      )
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();

    if (existingItem) {
      // Update existing item
      await ctx.db.patch(existingItem._id, {
        done: args.done,
        updatedAt: Date.now(),
      });
      return existingItem._id;
    } else {
      // Create new item
      const checklistId = await ctx.db.insert("checklistItems", {
        ...args,
        updatedAt: Date.now(),
      });
      return checklistId;
    }
  },
});

export const initializeBookingChecklist = mutation({
  args: {
    userId: v.id("users"),
    bookingId: v.string(),
  },
  handler: async (ctx, { userId, bookingId }) => {
    const defaultChecklist = [
      { key: "upload-id-front", label: "Upload ID (Front)", done: false },
      { key: "upload-id-back", label: "Upload ID (Back)", done: false },
      { key: "complete-invoice", label: "Complete Cargo Xpress NJ Shipping Invoice", done: false },
      { key: "acknowledge-disclaimer", label: "Acknowledge disclaimer", done: false },
      { key: "confirm-consignee", label: "Add/confirm consignee details", done: false },
      { key: "confirm-shipment", label: "Confirm shipment details", done: false },
    ];

    const checklistIds = [];
    for (const item of defaultChecklist) {
      const checklistId = await ctx.runMutation("onboarding:upsertChecklist", {
        userId,
        bookingId,
        key: item.key,
        label: item.label,
        done: item.done,
      });
      checklistIds.push(checklistId);
    }

    return { checklistIds, count: checklistIds.length };
  },
});

export const saveAcknowledgement = mutation({
  args: {
    userId: v.id("users"),
    bookingId: v.string(),
    version: v.string(),
    initials: v.string(),
    signedAt: v.number(),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Save acknowledgement
    const ackId = await ctx.db.insert("acknowledgements", args);
    
    // Mark checklist item as done
    await ctx.runMutation("onboarding:upsertChecklist", {
      userId: args.userId,
      bookingId: args.bookingId,
      key: "acknowledge-disclaimer",
      label: "Acknowledge disclaimer",
      done: true,
    });

    return ackId;
  },
});

export const saveShippingInvoice = mutation({
  args: { invoice: v.any() }, // Using v.any() for flexibility - can be typed more strictly later
  handler: async (ctx, { invoice }) => {
    // Check for existing invoice
    const existingInvoice = await ctx.db
      .query("shippingInvoices")
      .withIndex("byBooking", (q) => q.eq("bookingId", invoice.bookingId))
      .filter((q) => q.eq(q.field("userId"), invoice.userId))
      .first();

    let invoiceId;
    if (existingInvoice) {
      // Update existing invoice
      await ctx.db.patch(existingInvoice._id, {
        ...invoice,
        updatedAt: Date.now(),
      });
      invoiceId = existingInvoice._id;
    } else {
      // Create new invoice
      invoiceId = await ctx.db.insert("shippingInvoices", {
        ...invoice,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Mark checklist item as done
    await ctx.runMutation("onboarding:upsertChecklist", {
      userId: invoice.userId,
      bookingId: invoice.bookingId,
      key: "complete-invoice",
      label: "Complete Cargo Xpress NJ Shipping Invoice",
      done: true,
    });

    return invoiceId;
  },
});

export const getReviewState = query({
  args: {
    userId: v.id("users"),
    bookingId: v.string(),
  },
  handler: async (ctx, { userId, bookingId }) => {
    // Get checklist items
    const checklist = await ctx.db
      .query("checklistItems")
      .withIndex("byUserBooking", (q) => 
        q.eq("userId", userId).eq("bookingId", bookingId)
      )
      .collect();

    // Get documents
    const documents = await ctx.db
      .query("documents")
      .withIndex("byUser", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("bookingId"), bookingId))
      .collect();

    // Get shipping invoice
    const invoice = await ctx.db
      .query("shippingInvoices")
      .withIndex("byBooking", (q) => q.eq("bookingId", bookingId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    // Get acknowledgement
    const acknowledgement = await ctx.db
      .query("acknowledgements")
      .withIndex("byBooking", (q) => q.eq("bookingId", bookingId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    // Calculate progress
    const totalItems = checklist.length;
    const completedItems = checklist.filter(item => item.done).length;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      checklist,
      documents,
      invoice,
      acknowledgement,
      progress: {
        completed: completedItems,
        total: totalItems,
        percentage: progressPercentage,
      },
    };
  },
});

export const getBookingProgress = query({
  args: { bookingId: v.string() },
  handler: async (ctx, { bookingId }) => {
    // Get all checklist items for this booking
    const checklist = await ctx.db
      .query("checklistItems")
      .withIndex("byBooking", (q) => q.eq("bookingId", bookingId))
      .collect();

    // Get all documents for this booking
    const documents = await ctx.db
      .query("documents")
      .withIndex("byBooking", (q) => q.eq("bookingId", bookingId))
      .collect();

    // Get required document types
    const requiredDocTypes = ["id-front", "id-back"];
    const uploadedDocTypes = documents.map(doc => doc.type);
    const missingDocs = requiredDocTypes.filter(type => !uploadedDocTypes.includes(type));

    // Calculate overall progress
    const totalItems = checklist.length;
    const completedItems = checklist.filter(item => item.done).length;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      progressPercentage,
      completedItems,
      totalItems,
      missingDocs,
      hasInvoice: checklist.some(item => item.key === "complete-invoice" && item.done),
      hasAcknowledgement: checklist.some(item => item.key === "acknowledge-disclaimer" && item.done),
    };
  },
});