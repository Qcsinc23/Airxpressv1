// app/store/checkout/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Header from '../../components/ui/Header';
import StoreCheckoutForm from '../../components/store/StoreCheckoutForm';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Cart {
  items: Array<{
    productId: string;
    product: {
      id: string;
      title: string;
      price: number;
      currency: string;
      image?: string;
    } | null;
    quantity: number;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  itemCount: number;
}

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  // Safe Clerk hook usage with build-time error handling
  let user = null;
  let isLoaded = false;
  
  try {
    const userState = useUser();
    user = userState.user;
    isLoaded = userState.isLoaded;
  } catch (error) {
    console.warn('Clerk hooks not available during build');
    isLoaded = false;
  }

  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }
    
    if (user) {
      fetchCart();
    }
  }, [user, isLoaded, router]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/store/cart');
      const data = await response.json();
      
      if (data.success) {
        if (data.cart.items.length === 0) {
          router.push('/store/cart');
          return;
        }
        setCart(data.cart);
      } else {
        setError('Failed to load cart');
      }
    } catch (err) {
      setError('Failed to load cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutSuccess = (orderId: string) => {
    router.push(`/store/orders/${orderId}`);
  };

  const handleCheckoutError = (error: string) => {
    setError(error);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-600">Loading checkout...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Checkout Error
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/store/cart')}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 transform shadow-lg hover:shadow-xl"
              >
                Return to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Content Container - exact same structure as other pages */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Elements - identical to homepage */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        </div>

        <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Checkout
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Complete your purchase and we'll ship your items to the Caribbean with our express air service.
            </p>
          </div>

          {/* Checkout Form */}
          {cart && (
            <Elements stripe={stripePromise}>
              <StoreCheckoutForm
                cart={cart}
                onSuccess={handleCheckoutSuccess}
                onError={handleCheckoutError}
              />
            </Elements>
          )}
        </main>
      </div>
    </div>
  );
}
