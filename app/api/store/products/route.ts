// app/api/store/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Product creation schema - following existing validation patterns
const CreateProductSchema = z.object({
  title: z.string().min(1, 'Product title is required').max(255, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description is too long'),
  price: z.number().positive('Price must be greater than 0').max(9999999, 'Price is too high'), // Max $99,999.99
  currency: z.string().min(3).max(3).default('USD'),
  image: z.string().url('Invalid image URL').optional(),
  images: z.array(z.string().url()).max(10, 'Maximum 10 images allowed').optional(),
  category: z.string().max(100, 'Category name is too long').optional(),
  source: z.string().default('internal'),
  sourceId: z.string().optional(),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  weight: z.number().positive('Weight must be positive').max(200, 'Weight cannot exceed 200 lbs').optional(),
  dimensions: z.object({
    length: z.number().positive('Length must be positive').max(120, 'Length cannot exceed 120 inches'),
    width: z.number().positive('Width must be positive').max(120, 'Width cannot exceed 120 inches'),
    height: z.number().positive('Height must be positive').max(120, 'Height cannot exceed 120 inches'),
  }).optional(),
  tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags allowed').optional(),
});

// GET - Retrieve products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const inStockOnly = searchParams.get('inStockOnly') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    try {
      const products = await convex.query(api.functions.store.getProducts, {
        category: category || undefined,
        featured: featured || undefined,
        inStockOnly: inStockOnly || undefined,
        limit: limit || undefined,
      });

      return NextResponse.json({
        success: true,
        products: products.map(product => ({
          id: product._id,
          title: product.title,
          description: product.description,
          price: product.price,
          currency: product.currency,
          image: product.image,
          images: product.images,
          category: product.category,
          inStock: product.inStock,
          featured: product.featured,
          weight: product.weight,
          dimensions: product.dimensions,
          tags: product.tags,
          createdAt: new Date(product.createdAt).toISOString(),
        })),
      });

    } catch (convexError) {
      console.error('Convex query error:', convexError);
      return NextResponse.json({
        success: true,
        products: [], // Return empty array on error but user can still browse
      });
    }

  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new product (admin only for MVP)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin permission check when RBAC is fully implemented
    // const user = await requirePermission(Permission.MANAGE_PRODUCTS);

    const body = await request.json();
    const validatedData = CreateProductSchema.parse(body);

    try {
      // Convert price to cents if not already
      const priceInCents = Math.round(validatedData.price * 100);

      const productId = await convex.mutation(api.functions.store.createProduct, {
        ...validatedData,
        price: priceInCents,
      });

      return NextResponse.json({
        success: true,
        productId,
        message: 'Product created successfully',
      });

    } catch (convexError) {
      console.error('Failed to create product:', convexError);
      return NextResponse.json({ 
        error: 'Failed to create product',
        details: convexError instanceof Error ? convexError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Products POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update product (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Validate updates using partial schema
    const UpdateProductSchema = CreateProductSchema.partial();
    const validatedUpdates = UpdateProductSchema.parse(updates);

    try {
      // Convert price to cents if provided
      if (validatedUpdates.price !== undefined) {
        validatedUpdates.price = Math.round(validatedUpdates.price * 100);
      }

      const updatedProduct = await convex.mutation(api.functions.store.updateProduct, {
        id: id as Id<"products">,
        ...validatedUpdates,
      });

      if (!updatedProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        product: updatedProduct,
        message: 'Product updated successfully',
      });

    } catch (convexError) {
      console.error('Failed to update product:', convexError);
      return NextResponse.json({ 
        error: 'Failed to update product',
        details: convexError instanceof Error ? convexError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Products PUT error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete product (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    try {
      await convex.mutation(api.functions.store.deleteProduct, {
        id: id as Id<"products">,
      });

      return NextResponse.json({
        success: true,
        message: 'Product deleted successfully',
      });

    } catch (convexError) {
      console.error('Failed to delete product:', convexError);
      
      if (convexError instanceof Error && convexError.message.includes('not found')) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        error: 'Failed to delete product',
        details: convexError instanceof Error ? convexError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Products DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}