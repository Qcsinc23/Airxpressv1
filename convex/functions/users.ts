// convex/functions/users.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// Create a new user from Clerk webhook
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(
      v.literal("customer"),
      v.literal("agent"), 
      v.literal("ops"),
      v.literal("admin")
    ),
    preferences: v.optional(v.object({
      notifications: v.object({
        email: v.boolean(),
        sms: v.boolean(),
        push: v.boolean(),
      }),
      language: v.string(),
      timezone: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("byClerkId", q => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      throw new Error(`User with Clerk ID ${args.clerkId} already exists`);
    }

    const user = {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      imageUrl: args.imageUrl || "",
      role: args.role,
      preferences: args.preferences || {
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        language: "en",
        timezone: "America/New_York",
      },
      isActive: true,
      lastLoginAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const userId = await ctx.db.insert("users", user);
    
    // Initialize user onboarding if they're a customer
    // Note: Onboarding initialization will be added when the onboarding schema is available
    if (args.role === "customer") {
      // TODO: Initialize onboarding when schema is available
      console.log('Customer user created - onboarding initialization pending');
    }

    return userId;
  },
});

// Update user from Clerk webhook
export const updateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("customer"),
      v.literal("agent"),
      v.literal("ops"), 
      v.literal("admin")
    )),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", q => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error(`User with Clerk ID ${args.clerkId} not found`);
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.email !== undefined) updates.email = args.email;
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.role !== undefined) updates.role = args.role;

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

// Delete user from Clerk webhook
export const deleteUser = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", q => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error(`User with Clerk ID ${args.clerkId} not found`);
    }

    // Soft delete - mark as inactive rather than actually deleting
    // This preserves data integrity for quotes, bookings, etc.
    await ctx.db.patch(user._id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("byClerkId", q => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Get user by ID
export const getUserById = query({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all users (admin only)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Get users by role
export const getUsersByRole = query({
  args: {
    role: v.union(
      v.literal("customer"),
      v.literal("agent"),
      v.literal("ops"),
      v.literal("admin")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("byRole", q => q.eq("role", args.role)).collect();
  },
});

// Update user role (admin function)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(
      v.literal("customer"),
      v.literal("agent"),
      v.literal("ops"),
      v.literal("admin")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      role: args.newRole,
      updatedAt: Date.now(),
    });

    return args.userId;
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    userId: v.id("users"),
    preferences: v.object({
      notifications: v.object({
        email: v.boolean(),
        sms: v.boolean(),
        push: v.boolean(),
      }),
      language: v.string(),
      timezone: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      preferences: args.preferences,
      updatedAt: Date.now(),
    });

    return args.userId;
  },
});

// Record user login
export const recordUserLogin = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", q => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        lastLoginAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return user?._id;
  },
});