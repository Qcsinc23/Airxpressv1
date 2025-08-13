// convex/storage.ts
import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    return { url: await ctx.storage.generateUploadUrl() };
  },
});

export const recordUploadedDocument = mutation({
  args: {
    userId: v.id("users"),
    bookingId: v.optional(v.string()),
    type: v.string(),
    filename: v.string(),
    size: v.number(),
    contentType: v.string(),
    blobId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // TODO: Add auth check here
    const documentId = await ctx.db.insert("documents", {
      ...args,
      status: "uploaded",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return documentId;
  },
});

export const getDownloadUrl = query({
  args: { blobId: v.id("_storage") },
  handler: async (ctx, { blobId }) => {
    const url = await ctx.storage.getUrl(blobId);
    return { url };
  },
});

export const getUserDocuments = query({
  args: { 
    userId: v.id("users"),
    bookingId: v.optional(v.string())
  },
  handler: async (ctx, { userId, bookingId }) => {
    const query = ctx.db
      .query("documents")
      .withIndex("byUser", (q) => q.eq("userId", userId));
    
    const documents = await query.collect();
    
    if (bookingId) {
      return documents.filter(doc => doc.bookingId === bookingId);
    }
    
    return documents;
  },
});

export const deleteDocument = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    // TODO: Add auth check
    const document = await ctx.db.get(documentId);
    if (!document) {
      throw new Error("Document not found");
    }
    
    // Delete from storage
    await ctx.storage.delete(document.blobId);
    
    // Delete from database
    await ctx.db.delete(documentId);
    
    return { success: true };
  },
});