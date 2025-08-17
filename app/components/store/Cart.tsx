// app/components/store/Cart.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

interface CartItem {
  productId: string;
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    image?: string;
    inStock: boolean;
  } | null;
  quantity: number;
  addedAt: string;
}

interface Cart {
  id?: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  itemCount: number;
  lastUpdated?: string;
}

export default function Cart() {
  const { user } = useUser();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/store/cart');
      const data = await response.json();
      
      if (data.success) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      setUpdating(productId);
      const response = await fetch('/api/store/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchCart(); // Refresh cart data
      }
    } catch (err) {
      console.error('Error updating cart:', err);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      setUpdating(productId);
      const response = await fetch(`/api/store/cart?productId=${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchCart(); // Refresh cart data
      }
    } catch (err) {
      console.error('Error removing item:', err);
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(price / 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
          <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-gray-600">Loading your cart...</p>
      </div>
    );
  }

  // Not signed in state
  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Sign In Required
        </h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          Please sign in to view your shopping cart and continue shopping.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform transition-all duration-200 hover:scale-105"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Sign In
        </Link>
      </div>
    );
  }

  // Empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H3m0 0v2M7 13v7a2 2 0 002 2h6a2 2 0 002-2v-7m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.1" />
          </svg>
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Your Cart is Empty
        </h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          Start shopping to add items to your cart. We'll ship them to the Caribbean with our express air service.
        </p>
        <Link
          href="/store"
          className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform transition-all duration-200 hover:scale-105"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.productId} className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              {/* Product Image */}
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                {item.product?.image ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{item.product?.title || 'Unknown Product'}</h3>
                <p className="text-sm text-gray-600">{item.product?.description}</p>
                <p className="text-sm font-medium text-blue-600 mt-1">
                  {item.product ? formatPrice(item.product.price, item.product.currency) : 'Price unavailable'}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  disabled={updating === item.productId || item.quantity <= 1}
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>

                <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                  {item.quantity}
                </span>

                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={updating === item.productId}
                  className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                  </svg>
                </button>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.productId)}
                  disabled={updating === item.productId}
                  className="ml-4 text-red-600 hover:text-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Item total */}
            <div className="mt-4 text-right">
              <span className="text-lg font-bold text-gray-900">
                {item.product ? formatPrice(item.product.price * item.quantity, item.product.currency) : 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary - Using CTA section gradient style */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Background Pattern - identical to homepage CTA */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Cart Summary</h3>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H3m0 0v2M7 13v7a2 2 0 002 2h6a2 2 0 002-2v-7m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.1" />
              </svg>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg opacity-90">Subtotal ({cart.itemCount} items)</span>
              <span className="text-lg font-semibold">{formatPrice(cart.subtotal, cart.currency)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-lg opacity-90">Shipping</span>
              <span className="text-lg font-semibold">
                {cart.shippingCost > 0 ? formatPrice(cart.shippingCost, cart.currency) : 'Calculated at checkout'}
              </span>
            </div>
            
            {cart.tax > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-lg opacity-90">Tax</span>
                <span className="text-lg font-semibold">{formatPrice(cart.tax, cart.currency)}</span>
              </div>
            )}
            
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total</span>
                <span className="text-xl font-bold">{formatPrice(cart.total, cart.currency)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/store"
              className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all duration-200 hover:scale-105 transform"
            >
              Continue Shopping
            </Link>
            <Link
              href="/store/checkout"
              className="flex-1 bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-bold text-center shadow-xl hover:shadow-2xl transform transition-all duration-200 hover:scale-105"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Proceed to Checkout
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}