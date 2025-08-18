"use client";
import { useEffect, useState } from "react";
import StoreSidebar from "../components/StoreSidebar";

interface SecondHandProduct {
  id: string;
  title: string;
  description: string;
  photos: string[];
  price: number;
  originalPrice?: number;
  condition: "Like New" | "Very Good" | "Good" | "Fair";
  category: string;
  seller: string;
  location: string;
  availability: "available" | "sold";
}

export default function SecondHandPage() {
  const [products, setProducts] = useState<SecondHandProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const conditions = ["Like New", "Very Good", "Good", "Fair"];
  const categories = ["Electronics", "Computers", "Home", "Sports", "Tools", "Clothing", "Books"];

  useEffect(() => {
    // Simulate loading second hand items
    setTimeout(() => {
      const mockProducts: SecondHandProduct[] = [
        {
          id: "sh001",
          title: "MacBook Pro 13\" 2020 M1",
          description: "Excellent condition MacBook Pro with M1 chip, 8GB RAM, 256GB SSD. Used for light programming work.",
          photos: ["https://via.placeholder.com/400x300/f3f4f6/000?text=MacBook+Pro"],
          price: 899.99,
          originalPrice: 1299.99,
          condition: "Like New",
          category: "Computers",
          seller: "TechUser123",
          location: "New York, NY",
          availability: "available"
        },
        {
          id: "sh002", 
          title: "iPhone 12 Pro 128GB",
          description: "Unlocked iPhone 12 Pro in good condition. Minor scratches on back, screen protector applied.",
          photos: ["https://via.placeholder.com/400x300/f3f4f6/000?text=iPhone+12+Pro"],
          price: 599.99,
          originalPrice: 999.99,
          condition: "Good",
          category: "Electronics",
          seller: "PhoneDealer",
          location: "Los Angeles, CA",
          availability: "available"
        },
        {
          id: "sh003",
          title: "Herman Miller Aeron Chair",
          description: "Size B Aeron chair in very good condition. All functions work perfectly.",
          photos: ["https://via.placeholder.com/400x300/f3f4f6/000?text=Aeron+Chair"],
          price: 599.99,
          originalPrice: 1200.00,
          condition: "Very Good",
          category: "Home",
          seller: "OfficeSupply",
          location: "Chicago, IL",
          availability: "available"
        }
      ];
      setProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesFilter = p.title.toLowerCase().includes(filter.toLowerCase()) ||
      p.description.toLowerCase().includes(filter.toLowerCase());
    const matchesCondition = !selectedCondition || p.condition === selectedCondition;
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesFilter && matchesCondition && matchesCategory;
  });

  async function contactSeller(productId: string) {
    alert("Contact seller functionality would be implemented here");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <StoreSidebar />
        <div className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">2nd Hand Items</h1>
            <div className="text-center">Loading items...</div>
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
          <h1 className="text-3xl font-bold mb-6">2nd Hand Items</h1>
          
          <div className="mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search items..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 min-w-64 px-4 py-2 border rounded-lg"
            />
            
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Conditions</option>
              {conditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredProducts.length} second-hand items
            {selectedCondition && ` in ${selectedCondition} condition`}
            {selectedCategory && ` in ${selectedCategory}`}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src={p.photos[0]} alt={p.title} className="w-full h-48 object-cover rounded-xl" />
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    2ND HAND
                  </div>
                  <div className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full ${
                    p.condition === 'Like New' ? 'bg-green-500' :
                    p.condition === 'Very Good' ? 'bg-blue-500' :
                    p.condition === 'Good' ? 'bg-yellow-500' : 'bg-orange-500'
                  }`}>
                    {p.condition}
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-sm overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{p.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'}}>{p.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {p.category}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400 mt-2">
                    <div>Seller: {p.seller}</div>
                    <div>Location: {p.location}</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-green-600">${p.price.toFixed(2)}</span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 line-through">${p.originalPrice.toFixed(2)}</span>
                          <span className="text-xs text-green-600 font-medium">
                            Save ${(p.originalPrice - p.price).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${p.availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.availability === 'available' ? 'Available' : 'Sold'}
                    </span>
                  </div>
                  <button 
                    className={`w-full mt-3 px-3 py-2 rounded-xl text-white font-medium transition-colors ${p.availability === 'available' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                    onClick={() => contactSeller(p.id)}
                    disabled={p.availability !== 'available'}
                  >
                    Contact Seller
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center text-gray-500 mt-8">
              {filter ? 'No items match your search.' : 'No second-hand items available.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}