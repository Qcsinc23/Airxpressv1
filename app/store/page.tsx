// app/store/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Header from '../components/ui/Header';
import ProductCard from '../components/store/ProductCard';
import { useUser } from '@clerk/nextjs';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  category?: string;
  inStock: boolean;
  weight?: number;
}

export default function StorePage() {
  const { user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/store/products?inStockOnly=true');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      // Redirect to sign in if not authenticated
      window.location.href = '/sign-in';
      return;
    }

    try {
      setAddingToCart(productId);
      const response = await fetch('/api/store/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Show success feedback (could add toast notification here)
        console.log('Item added to cart successfully');
      } else {
        console.error('Failed to add to cart:', data.error);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Content Container - exact same structure as homepage */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Elements - identical to homepage */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        </div>

        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header - same styling as homepage sections */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AirXpress Store
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Shop our curated selection of products with fast shipping to the Caribbean. 
              All items can be shipped using our express air service.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchProducts}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 transform shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Products Grid - EXACT same structure as destinations */}
          {!loading && !error && (
            <>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      isAddingToCart={addingToCart === product.id}
                    />
                  ))}
                </div>
              ) : (
                // Empty state
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                    No Products Available
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We're working on adding products to our store. Check back soon!
                  </p>
                </div>
              )}

              {/* Call to Action Section - same as homepage CTA */}
              {products.length > 0 && (
                <div className="mt-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
                  {/* Background Pattern - identical to homepage */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full"></div>
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white rounded-full"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H3m0 0v2M7 13v7a2 2 0 002 2h6a2 2 0 002-2v-7m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.1" />
                      </svg>
                    </div>
                    
                    <h2 className="text-4xl font-bold mb-4">
                      Ready to Shop?
                    </h2>
                    <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                      Add items to your cart and we'll ship them to the Caribbean with our express air service.
                    </p>
                    {user ? (
                      <a
                        href="/store/cart"
                        className="inline-flex items-center bg-white hover:bg-gray-100 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform transition-all duration-200 hover:scale-105"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H3m0 0v2M7 13v7a2 2 0 002 2h6a2 2 0 002-2v-7m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.1" />
                        </svg>
                        View Cart
                      </a>
                    ) : (
                      <a
                        href="/sign-in"
                        className="inline-flex items-center bg-white hover:bg-gray-100 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform transition-all duration-200 hover:scale-105"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Sign In to Shop
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}