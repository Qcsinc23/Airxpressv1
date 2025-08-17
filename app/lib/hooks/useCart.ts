// app/lib/hooks/useCart.ts
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface CartSummary {
  itemCount: number;
  total: number;
  currency: string;
}

export function useCartSummary() {
  const { user, isLoaded } = useUser();
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    itemCount: 0,
    total: 0,
    currency: 'USD',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchCartSummary();
    } else if (isLoaded && !user) {
      // Reset cart summary when user signs out
      setCartSummary({ itemCount: 0, total: 0, currency: 'USD' });
    }
  }, [user, isLoaded]);

  const fetchCartSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/store/cart');
      const data = await response.json();
      
      if (data.success && data.cart) {
        setCartSummary({
          itemCount: data.cart.itemCount || 0,
          total: data.cart.total || 0,
          currency: data.cart.currency || 'USD',
        });
      }
    } catch (err) {
      console.error('Error fetching cart summary:', err);
      // Keep existing cart summary on error
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = () => {
    if (user) {
      fetchCartSummary();
    }
  };

  return {
    cartSummary,
    loading,
    refreshCart,
  };
}