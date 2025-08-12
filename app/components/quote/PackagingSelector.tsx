// PackagingSelector.tsx
'use client';

import { useState, useEffect } from 'react';

interface PackagingSKU {
  id: string;
  code: string;
  name: string;
  description: string;
  sellPriceUSD: number;
  category: 'barrel' | 'container' | 'protection';
  specifications: {
    maxWeightKg: number;
    dimensionsCm: {
      length: number;
      width: number;
      height: number;
    };
    material: string;
  };
  availability: 'available' | 'unavailable';
}

interface PackagingSelectorProps {
  onPackagingSelect: (selectedSKUs: string[]) => void;
  onClose: () => void;
  maxWeight?: number; // Filter by weight capacity
  pieces?: Array<{ weight: number; type: string }>; // For recommendations
}

export default function PackagingSelector({
  onPackagingSelect,
  onClose,
  maxWeight,
  pieces = []
}: PackagingSelectorProps) {
  const [availablePackaging, setAvailablePackaging] = useState<PackagingSKU[]>([]);
  const [selectedSKUs, setSelectedSKUs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'barrel' | 'container' | 'protection'>('all');

  useEffect(() => {
    fetchPackagingOptions();
  }, [maxWeight]);

  const fetchPackagingOptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (maxWeight) {
        params.set('maxWeight', maxWeight.toString());
      }

      const response = await fetch(`/api/packaging?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailablePackaging(data.packaging || []);
      }
    } catch (error) {
      console.error('Failed to fetch packaging options:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackaging = availablePackaging.filter(sku => {
    if (filter === 'all') return true;
    return sku.category === filter;
  });

  const getRecommendedSKUs = () => {
    if (pieces.length === 0) return [];

    const recommendations = [];
    const totalWeight = pieces.reduce((sum, piece) => sum + piece.weight, 0);
    
    // Recommend based on item types and weight
    const hasFood = pieces.some(piece => piece.type === 'barrel');
    const hasElectronics = pieces.some(piece => piece.type === 'box');
    
    if (hasFood) {
      recommendations.push('sku_fiber_barrel_60l'); // Eco-friendly for food
    }
    
    if (hasElectronics) {
      recommendations.push('sku_econtainer_small'); // Secure for electronics
    }
    
    if (totalWeight > 20) {
      recommendations.push('sku_fragile_protection'); // Extra protection for heavy items
    }

    return recommendations;
  };

  const handleSKUToggle = (skuId: string) => {
    setSelectedSKUs(prev => 
      prev.includes(skuId)
        ? prev.filter(id => id !== skuId)
        : [...prev, skuId]
    );
  };

  const handleConfirm = () => {
    onPackagingSelect(selectedSKUs);
    onClose();
  };

  const getTotalCost = () => {
    return selectedSKUs.reduce((total, skuId) => {
      const sku = availablePackaging.find(s => s.id === skuId);
      return total + (sku?.sellPriceUSD || 0);
    }, 0);
  };

  const recommendedSKUs = getRecommendedSKUs();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4">Loading packaging options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Select Packaging</h2>
              <p className="text-gray-600 text-sm mt-1">Protect your items with professional packaging options</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-4 mt-4">
            {(['all', 'barrel', 'container', 'protection'] as const).map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Options' : 
                 category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {recommendedSKUs.length > 0 && (
          <div className="p-6 bg-blue-50 border-b border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">💡 Recommended for your shipment</h3>
            <div className="flex flex-wrap gap-2">
              {recommendedSKUs.map(skuId => {
                const sku = availablePackaging.find(s => s.id === skuId);
                if (!sku) return null;
                
                return (
                  <button
                    key={skuId}
                    onClick={() => handleSKUToggle(skuId)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedSKUs.includes(skuId)
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                    }`}
                  >
                    {sku.name} - ${sku.sellPriceUSD}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Packaging Options */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPackaging.map(sku => (
              <div
                key={sku.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedSKUs.includes(sku.id)
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleSKUToggle(sku.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-800">{sku.name}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{sku.code}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">${sku.sellPriceUSD}</div>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedSKUs.includes(sku.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedSKUs.includes(sku.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{sku.description}</p>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Capacity:</span>
                    <div className="text-gray-600">{sku.specifications.maxWeightKg}kg max</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Dimensions:</span>
                    <div className="text-gray-600">
                      {sku.specifications.dimensionsCm.length}×{sku.specifications.dimensionsCm.width}×{sku.specifications.dimensionsCm.height}cm
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Material:</span>
                    <div className="text-gray-600">{sku.specifications.material}</div>
                  </div>
                </div>

                {recommendedSKUs.includes(sku.id) && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    ⭐ Recommended for your items
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              {selectedSKUs.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{selectedSKUs.length}</span> packaging option{selectedSKUs.length !== 1 ? 's' : ''} selected
                  <div className="text-lg font-bold text-gray-800 mt-1">
                    Total: ${getTotalCost().toFixed(2)}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedSKUs.length === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedSKUs.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add to Quote ({selectedSKUs.length})
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-3">
            💡 Tip: Multiple packaging options can be combined for optimal protection
          </div>
        </div>
      </div>
    </div>
  );
}