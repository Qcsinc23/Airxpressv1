// app/store/cart/page.tsx
'use client';

import React from 'react';
import Header from '../../components/ui/Header';
import Cart from '../../components/store/Cart';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

export default function CartPage() {
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
                Shopping Cart
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Review your items and proceed to checkout. We'll ship everything to the Caribbean with our express air service.
            </p>
          </div>

          {/* Cart Component */}
          <Cart />
        </main>
      </div>
    </div>
  );
}
