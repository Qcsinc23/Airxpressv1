"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "react-use-cart";
import StoreSidebar from "../components/StoreSidebar";
import QuickView from "../components/QuickView";

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
  source: string;
  categories: string[];
  site: string;
  url: string;
  condition?: string;
  purchaseLimit?: number;
  isWootOff?: boolean;
  dealInfo?: {
    discount?: number;
    discountPercent?: number;
    savings?: number;
  };
}

function StoreContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFeed, setSelectedFeed] = useState(searchParams.get("feed") || "All");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addItem, items } = useCart();

  const feeds = ["All", "Electronics", "Computers", "Home", "Sports", "Tools", "Clearance"];

  useEffect(() => {
    const feedFromUrl = searchParams.get("feed");
    if (feedFromUrl && feedFromUrl !== selectedFeed) {
      setSelectedFeed(feedFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadRecommendations();
  }, [selectedFeed, selectedCategory]);

  async function loadCategories() {
    try {
      const response = await fetch("/api/deals/woot/categories");
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        feed: selectedFeed,
        limit: "200",
        ...(selectedCategory && { category: selectedCategory })
      });

      const response = await fetch(`/api/deals/woot?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecommendations() {
    try {
      // Load different category recommendations based on cart items
      const cartCategories = items.flatMap((item: any) => item.categories || []);
      const uniqueCategories = [...new Set(cartCategories)];
      
      if (uniqueCategories.length > 0) {
        // Get recommendations from different feeds
        const feeds = ["Electronics", "Home", "Tools"];
        const recommendedProducts: Product[] = [];
        
        for (const feed of feeds) {
          try {
            const response = await fetch(`/api/deals/woot?feed=${feed}&limit=3`);
            const result = await response.json();
            if (result.success && result.data) {
              recommendedProducts.push(...result.data.slice(0, 3));
            }
          } catch (err) {
            console.error(`Failed to load ${feed} recommendations:`, err);
          }
        }
        
        setRecommendations(recommendedProducts.slice(0, 9));
      } else {
        // Default recommendations if cart is empty
        const response = await fetch("/api/deals/woot?feed=Electronics&limit=3");
        const result = await response.json();
        if (result.success) {
          setRecommendations(result.data || []);
        }
      }
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    }
  }

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(filter.toLowerCase()) ||
    p.description.toLowerCase().includes(filter.toLowerCase())
  );

  function addToCart(productId: string) {
    const product = products.find(p => p.sourceId === productId) || 
                  recommendations.find(p => p.sourceId === productId);
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
      loadRecommendations(); // Refresh recommendations based on new cart
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Failed to add to cart");
    }
  }

  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
    setProducts([]);
  }

  function openQuickView(product: Product) {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  }

  function closeQuickView() {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <StoreSidebar />
        <div className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">Store - {selectedFeed} Deals</h1>
            <div className="text-center">Loading products...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StoreSidebar />
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Store - {selectedFeed} Deals</h1>
          
          <div className="mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 min-w-64 px-4 py-2 border rounded-lg"
            />

            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {recommendations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {items.length > 0 ? "Recommended for You" : "Featured Deals"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((p) => (
                  <div key={`rec-${p.sourceId}`} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-sm border border-blue-200 p-4 hover:shadow-md transition-shadow">
                    <div className="relative cursor-pointer" onClick={() => {
                      sessionStorage.setItem(`product_${p.sourceId}`, JSON.stringify(p));
                      window.location.href = `/product/${p.sourceId}`;
                    }}>
                      <img src={p.photos?.[0]?.url} alt={p.title} className="w-full h-32 object-cover rounded-xl" />
                      {p.dealInfo?.discountPercent && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{p.dealInfo.discountPercent}%
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                        {p.site}
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="font-medium text-sm overflow-hidden cursor-pointer hover:text-blue-600 transition-colors" 
                          style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}
                          onClick={() => {
                            sessionStorage.setItem(`product_${p.sourceId}`, JSON.stringify(p));
                            window.location.href = `/product/${p.sourceId}`;
                          }}>
                        {p.fullTitle || p.title}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-bold text-blue-600">${p.price.toFixed(2)}</span>
                        <div className="flex gap-1">
                          <button 
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full transition-colors"
                            onClick={() => openQuickView(p)}
                          >
                            View
                          </button>
                          <button 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full transition-colors"
                            onClick={() => addToCart(p.sourceId)}
                            disabled={p.availability !== 'in_stock'}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredProducts.length} products
            {selectedCategory && ` in ${selectedCategory}`}
            {selectedFeed !== "All" && ` from ${selectedFeed}`}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div key={p.sourceId} className="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition-shadow">
                <div className="relative cursor-pointer" onClick={() => {
                  // Store product data in sessionStorage for the detail page
                  sessionStorage.setItem(`product_${p.sourceId}`, JSON.stringify(p));
                  window.location.href = `/product/${p.sourceId}`;
                }}>
                  <img src={p.photos?.[0]?.url} alt={p.title} className="w-full h-48 object-cover rounded-xl" />
                  {p.dealInfo?.discountPercent && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{p.dealInfo.discountPercent}%
                    </div>
                  )}
                  {p.isWootOff && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      WOOT-OFF
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {p.site}
                  </div>
                </div>
                <div className="mt-3">
                  <h3 
                    className="font-semibold text-sm overflow-hidden cursor-pointer hover:text-blue-600 transition-colors" 
                    style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}
                    onClick={() => {
                      sessionStorage.setItem(`product_${p.sourceId}`, JSON.stringify(p));
                      window.location.href = `/product/${p.sourceId}`;
                    }}
                  >
                    {p.fullTitle || p.title}
                  </h3>
                  {p.subtitle && (
                    <p className="text-xs text-blue-600 mt-1">{p.subtitle}</p>
                  )}
                  {p.condition && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      {p.condition}
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-1 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                    {p.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.categories.slice(0, 2).map(cat => (
                      <span key={cat} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {cat.split('/').pop()}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-blue-600">${p.price.toFixed(2)}</span>
                      {p.listPrice && p.listPrice > p.price && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 line-through">${p.listPrice.toFixed(2)}</span>
                          <span className="text-xs text-green-600 font-medium">
                            Save ${p.dealInfo?.savings?.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.availability === 'in_stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.availability === 'in_stock' ? 'In Stock' : 'Sold Out'}
                      </span>
                      {p.purchaseLimit && (
                        <span className="text-xs text-orange-600">
                          Limit: {p.purchaseLimit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button 
                      className="flex-1 bg-gray-100 text-gray-800 px-3 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                      onClick={() => openQuickView(p)}
                    >
                      Quick View
                    </button>
                    <button 
                      className={`flex-1 px-3 py-2 rounded-xl text-white font-medium transition-colors text-sm ${p.availability === 'in_stock' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                      onClick={() => addToCart(p.sourceId)}
                      disabled={p.availability !== 'in_stock'}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center text-gray-500 mt-8">
              {filter ? 'No products match your search.' : 'No products available.'}
            </div>
          )}
        </div>
      </div>

      <QuickView 
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
      />
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex">
        <StoreSidebar />
        <div className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">Store - Loading...</h1>
            <div className="text-center">Loading store...</div>
          </div>
        </div>
      </div>
    }>
      <StoreContent />
    </Suspense>
  );
}
