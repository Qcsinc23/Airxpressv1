"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "react-use-cart";
import StoreSidebar from "../../components/StoreSidebar";

interface Product {
  sourceId: string;
  title: string;
  fullTitle?: string;
  subtitle?: string;
  description: string;
  features?: string;
  specs?: string;
  writeUp?: {
    intro?: string;
    body?: string;
  };
  teaser?: string;
  photos: Array<{ url: string; caption?: string; width?: number; height?: number }>;
  price: number;
  listPrice?: number;
  currency: string;
  availability: string;
  categories: string[];
  site: string;
  url: string;
  condition?: string;
  attributes?: Array<{ key: string; value: string }>;
  purchaseLimit?: number;
  quantityLimit?: number;
  shippingMethods?: string[];
  isWootOff?: boolean;
  isLiveNow?: boolean;
  dealInfo?: {
    discount?: number;
    discountPercent?: number;
    savings?: number;
  };
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const { addItem, items } = useCart();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  async function loadProduct() {
    try {
      // First try to get from sessionStorage (faster)
      const cachedProduct = sessionStorage.getItem(`product_${productId}`);
      if (cachedProduct) {
        setProduct(JSON.parse(cachedProduct));
        setLoading(false);
        return;
      }

      // Fallback to API
      const response = await fetch(`/api/deals/woot/offer/${productId}`);
      const result = await response.json();
      if (result.success) {
        setProduct(result.data);
      }
    } catch (err) {
      console.error("Failed to load product:", err);
    } finally {
      setLoading(false);
    }
  }

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
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Failed to add to cart");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <StoreSidebar />
        <div className="flex-1 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <Link href="/store" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Store
            </Link>
            <div className="text-center">Loading product...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <StoreSidebar />
        <div className="flex-1 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <Link href="/store" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Store
            </Link>
            <div className="text-center text-red-500">Product not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StoreSidebar />
      <div className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/store" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Store
          </Link>
          
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={product.photos[selectedPhoto]?.url} 
                    alt={product.title}
                    className="w-full h-96 object-cover rounded-xl"
                  />
                  {product.dealInfo?.discountPercent && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-2 rounded-full">
                      -{product.dealInfo.discountPercent}% OFF
                    </div>
                  )}
                  {product.isWootOff && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white font-bold px-3 py-2 rounded-full">
                      WOOT-OFF
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
                        className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                          selectedPhoto === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedPhoto(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
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
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.fullTitle || product.title}
                  </h1>
                  
                  {product.subtitle && (
                    <p className="text-lg text-blue-600 mb-4">{product.subtitle}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.categories.map(cat => (
                    <span key={cat} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                      {cat.split('/').pop()}
                    </span>
                  ))}
                </div>

                <div className="border-t border-b py-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                      {product.listPrice && product.listPrice > product.price && (
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-lg text-gray-400 line-through">${product.listPrice.toFixed(2)}</span>
                          <span className="text-lg text-green-600 font-medium">
                            Save ${product.dealInfo?.savings?.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        product.availability === 'in_stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.availability === 'in_stock' ? 'In Stock' : 'Sold Out'}
                      </span>
                      {product.purchaseLimit && (
                        <p className="text-sm text-orange-600 mt-1">
                          Limit: {product.purchaseLimit} per customer
                        </p>
                      )}
                    </div>
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

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  </div>

                  {product.features && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Features</h3>
                      <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.features }} />
                    </div>
                  )}

                  {product.specs && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                      <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.specs }} />
                    </div>
                  )}

                  {product.attributes && product.attributes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Product Details</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {product.attributes.map((attr, index) => (
                          <div key={index} className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-600">{attr.key}:</span>
                            <span className="font-medium">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.shippingMethods && product.shippingMethods.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Shipping</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.shippingMethods.map((method, index) => (
                          <span key={index} className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t">
                  <a 
                    href={product.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View on Woot →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}