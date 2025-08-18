"use client";
import { useState } from "react";
import { useCart } from "react-use-cart";

interface Product {
  sourceId: string;
  title: string;
  fullTitle?: string;
  subtitle?: string;
  description: string;
  photos: Array<{ url: string; caption?: string; width?: number; height?: number }>;
  price: number;
  listPrice?: number;
  currency: string;
  availability: string;
  categories: string[];
  site: string;
  url: string;
  condition?: string;
  purchaseLimit?: number;
  dealInfo?: {
    discount?: number;
    discountPercent?: number;
    savings?: number;
  };
}

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickView({ product, isOpen, onClose }: QuickViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const { addItem } = useCart();

  if (!isOpen || !product) return null;

  function addToCart() {
    if (!product) return;

    try {
      addItem({
        id: product.sourceId,
        price: product.price,
        title: product.title,
        image: product.photos[0]?.url,
        currency: product.currency,
        availability: product.availability,
        site: product.site,
        categories: product.categories,
        listPrice: product.listPrice,
        dealInfo: product.dealInfo,
      });
      alert("Added to cart!");
      onClose();
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Failed to add to cart");
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Quick View</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={product.photos[selectedPhoto]?.url} 
                  alt={product.title}
                  className="w-full h-64 object-cover rounded-xl"
                />
                {product.dealInfo?.discountPercent && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm">
                    -{product.dealInfo.discountPercent}% OFF
                  </div>
                )}
              </div>
              
              {product.photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo.url}
                      alt={`${product.title} ${index + 1}`}
                      className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${
                        selectedPhoto === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedPhoto(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
                    {product.site}
                  </span>
                  {product.condition && (
                    <span className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full">
                      {product.condition}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {product.fullTitle || product.title}
                </h3>
                
                {product.subtitle && (
                  <p className="text-blue-600 mb-2">{product.subtitle}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {product.categories.slice(0, 3).map(cat => (
                  <span key={cat} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                    {cat.split('/').pop()}
                  </span>
                ))}
              </div>

              <div className="border-t border-b py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                    {product.listPrice && product.listPrice > product.price && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 line-through">${product.listPrice.toFixed(2)}</span>
                        <span className="text-green-600 font-medium">
                          Save ${product.dealInfo?.savings?.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    product.availability === 'in_stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.availability === 'in_stock' ? 'In Stock' : 'Sold Out'}
                  </span>
                </div>

                <button 
                  className={`w-full py-3 px-6 rounded-xl text-white font-medium transition-colors ${
                    product.availability === 'in_stock' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  onClick={addToCart}
                  disabled={product.availability !== 'in_stock'}
                >
                  {product.availability === 'in_stock' ? 'Add to Cart' : 'Sold Out'}
                </button>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
              </div>

              <div className="pt-4 border-t">
                <a 
                  href={product.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  View Full Details →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}