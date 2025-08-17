// app/components/store/ProductCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number; // Price in cents
  currency: string;
  image?: string;
  category?: string;
  inStock: boolean;
  weight?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => Promise<void>;
  isAddingToCart?: boolean;
}

export default function ProductCard({ product, onAddToCart, isAddingToCart = false }: ProductCardProps) {
  // Format price for display
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency,
    minimumFractionDigits: 2,
  }).format(product.price / 100);

  // Get category color - using same gradient patterns as destinations
  const getCategoryColor = (category?: string) => {
    const colorMap: { [key: string]: string } = {
      'electronics': 'from-blue-500 to-indigo-600',
      'home': 'from-green-500 to-emerald-600',
      'clothing': 'from-purple-500 to-pink-600',
      'books': 'from-orange-500 to-red-600',
      'toys': 'from-yellow-500 to-orange-600',
    };
    return colorMap[category || 'electronics'] || 'from-blue-500 to-indigo-600';
  };

  // Get category icon - same as destination flags
  const getCategoryIcon = (category?: string) => {
    const iconMap: { [key: string]: string } = {
      'electronics': '📱',
      'home': '🏠',
      'clothing': '👕',
      'books': '📚',
      'toys': '🧸',
    };
    return iconMap[category || 'electronics'] || '📦';
  };

  const handleAddToCart = async () => {
    if (!product.inStock || isAddingToCart) return;
    await onAddToCart(product.id);
  };

  return (
    // Use EXACT same card structure as destinations
    <div className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
      {/* Product image in circular background - same as destination flags */}
      <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(product.category)} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {product.image ? (
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={product.image}
              alt={product.title}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <span className="text-2xl">{getCategoryIcon(product.category)}</span>
        )}
      </div>

      {/* Product title - same typography as destination name */}
      <h3 className="font-bold text-gray-900 mb-1 text-lg">{product.title}</h3>
      
      {/* Product price - same styling as destination airport */}
      <p className="text-sm text-gray-600 font-medium">{formattedPrice}</p>
      
      {/* Stock status - same styling as destination code */}
      <p className="text-xs text-gray-500 mt-1 font-mono">
        {product.inStock ? 'In Stock' : 'Out of Stock'}
      </p>

      {/* Add to Cart button - follows AirXpress button patterns */}
      <div className="mt-4">
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAddingToCart}
          className={`
            px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg
            ${product.inStock && !isAddingToCart
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white hover:scale-105 transform hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isAddingToCart ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </span>
          ) : product.inStock ? (
            'Add to Cart'
          ) : (
            'Out of Stock'
          )}
        </button>
      </div>

      {/* Product category badge - additional info like destination code */}
      {product.category && (
        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
            {product.category}
          </span>
        </div>
      )}
    </div>
  );
}