// convex/functions/store.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// Product Management Functions

// Create a new product
export const createProduct = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(), // Price in cents
    currency: v.string(),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    source: v.string(),
    sourceId: v.optional(v.string()),
    inStock: v.boolean(),
    featured: v.optional(v.boolean()),
    weight: v.optional(v.number()),
    dimensions: v.optional(v.object({
      length: v.number(),
      width: v.number(),
      height: v.number(),
    })),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const product = {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    const productId = await ctx.db.insert("products", product);
    return productId;
  },
});

// Get all products with optional filtering
export const getProducts = query({
  args: {
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    inStockOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let products;

    // Apply filters with proper index usage
    if (args.category) {
      products = await ctx.db.query("products")
        .withIndex("by_category", q => q.eq("category", args.category))
        .collect();
    } else if (args.featured !== undefined) {
      products = await ctx.db.query("products")
        .withIndex("by_featured", q => q.eq("featured", args.featured))
        .collect();
    } else if (args.inStockOnly) {
      products = await ctx.db.query("products")
        .withIndex("in_stock", q => q.eq("inStock", true))
        .collect();
    } else {
      products = await ctx.db.query("products").collect();
    }

    // Apply additional filters that don't have indices
    if (args.inStockOnly && !args.category && args.featured === undefined) {
      products = products.filter(p => p.inStock);
    }

    // Apply limit
    if (args.limit) {
      products = products.slice(0, args.limit);
    }

    return products;
  },
});

// Get a single product by ID
export const getProduct = query({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update product
export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    inStock: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
    weight: v.optional(v.number()),
    dimensions: v.optional(v.object({
      length: v.number(),
      width: v.number(),
      height: v.number(),
    })),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(id, {
        ...cleanUpdates,
        updatedAt: Date.now(),
      });
    }

    return await ctx.db.get(id);
  },
});

// Delete product
export const deleteProduct = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    // Check if product exists
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error("Product not found");
    }

    // TODO: In production, check if product is in any active carts or orders
    // For now, simple delete
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Cart Management Functions

// Get user's cart
export const getCart = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
    
    if (!cart) {
      return null;
    }

    // Get product details for each cart item
    const itemsWithProducts = await Promise.all(
      cart.items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return {
          ...item,
          product,
        };
      })
    );

    return {
      ...cart,
      items: itemsWithProducts,
    };
  },
});

// Add item to cart
export const addToCart = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate product exists and is in stock
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }
    if (!product.inStock) {
      throw new Error("Product is out of stock");
    }

    // Get or create cart
    let cart = await ctx.db
      .query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();

    if (!cart) {
      // Create new cart
      const cartId = await ctx.db.insert("carts", {
        userId: args.userId,
        items: [{
          productId: args.productId,
          quantity: args.quantity,
          addedAt: Date.now(),
        }],
        currency: product.currency,
        lastUpdated: Date.now(),
        createdAt: Date.now(),
      });
      return cartId;
    } else {
      // Update existing cart
      const existingItemIndex = cart.items.findIndex(item => item.productId === args.productId);
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        updatedItems = [...cart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + args.quantity,
        };
      } else {
        // Add new item to cart
        updatedItems = [...cart.items, {
          productId: args.productId,
          quantity: args.quantity,
          addedAt: Date.now(),
        }];
      }

      await ctx.db.patch(cart._id, {
        items: updatedItems,
        lastUpdated: Date.now(),
      });

      return cart._id;
    }
  },
});

// Remove item from cart
export const removeFromCart = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();

    if (!cart) {
      throw new Error("Cart not found");
    }

    const updatedItems = cart.items.filter(item => item.productId !== args.productId);

    await ctx.db.patch(cart._id, {
      items: updatedItems,
      lastUpdated: Date.now(),
    });

    return cart._id;
  },
});

// Update cart item quantity
export const updateCartItemQuantity = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      // Remove item if quantity is 0 or negative
      return await removeCartItemHelper(ctx, { userId: args.userId, productId: args.productId });
    }

    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();

    if (!cart) {
      throw new Error("Cart not found");
    }

    const itemIndex = cart.items.findIndex(item => item.productId === args.productId);
    if (itemIndex === -1) {
      throw new Error("Item not found in cart");
    }

    const updatedItems = [...cart.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity: args.quantity,
    };

    await ctx.db.patch(cart._id, {
      items: updatedItems,
      lastUpdated: Date.now(),
    });

    return cart._id;
  },
});

// Helper function for cart item removal
async function removeCartItemHelper(ctx: any, args: { userId: Id<"users">, productId: Id<"products"> }) {
  const cart = await ctx.db
    .query("carts")
    .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
    .first();

  if (!cart) {
    throw new Error("Cart not found");
  }

  const updatedItems = cart.items.filter((item: any) => item.productId !== args.productId);

  await ctx.db.patch(cart._id, {
    items: updatedItems,
    lastUpdated: Date.now(),
  });

  return cart._id;
}

// Clear cart
export const clearCart = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();

    if (cart) {
      await ctx.db.patch(cart._id, {
        items: [],
        lastUpdated: Date.now(),
      });
    }

    return cart?._id;
  },
});

// Basic Order Functions

// Create order from cart
export const createOrder = mutation({
  args: {
    userId: v.id("users"),
    paymentIntentId: v.string(),
    shippingAddress: v.optional(v.object({
      name: v.string(),
      addressLine1: v.string(),
      addressLine2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      postalCode: v.string(),
      country: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Get user's cart
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Create cart snapshot with product details
    const cartSnapshot = await Promise.all(
      cart.items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        return {
          productId: item.productId,
          productTitle: product.title,
          productPrice: product.price,
          quantity: item.quantity,
        };
      })
    );

    // Calculate totals (simplified for MVP)
    const subtotal = cartSnapshot.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
    const shippingCost = 0; // Will be calculated later when shipping integration is added
    const tax = 0; // Will be calculated later when tax integration is added
    const total = subtotal + shippingCost + tax;

    // Generate order number
    const orderNumber = `AX-ORD-${Date.now().toString().slice(-8)}`;

    const order = {
      userId: args.userId,
      cartSnapshot: {
        items: cartSnapshot,
        subtotal,
        shippingCost,
        tax,
        total,
        currency: cart.currency,
      },
      status: "pending_payment" as const,
      paymentMethod: "stripe",
      paymentIntentId: args.paymentIntentId,
      paymentStatus: "pending",
      shippingAddress: args.shippingAddress,
      orderNumber,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const orderId = await ctx.db.insert("orders", order);

    // Clear the cart after creating order
    await ctx.db.patch(cart._id, {
      items: [],
      lastUpdated: Date.now(),
    });

    return orderId;
  },
});

// Get orders by user
export const getUserOrders = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("orders").withIndex("by_user", q => q.eq("userId", args.userId)).collect();
  },
});

// Get order by ID
export const getOrder = query({
  args: {
    id: v.id("orders"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update order status
export const updateOrderStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending_payment"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    paymentStatus: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});