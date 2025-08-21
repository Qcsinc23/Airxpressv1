// app/dashboard/admin/pricing/page.tsx
'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { usePermissions } from '../../../lib/auth/usePermissions';
import { Permission } from '../../../lib/auth/rbac';

interface PricingPolicy {
  id: string;
  version: string;
  components: {
    freight: ComponentPricing;
    overweight: ComponentPricing;
    packaging: ComponentPricing;
    storage: ComponentPricing;
    pickup: ComponentPricing;
    delivery: ComponentPricing;
  };
  surchargeRules: {
    paidOutsideUSA: {
      enabled: boolean;
      thresholdUSD: number;
      flatFeeUSD: number;
      percentageRate: number;
    };
  };
  globalRules: {
    minSellPrice: number;
    defaultRoundRule: 'up' | 'down' | 'nearest';
    roundToNearest: number;
  };
  effectiveDate: string;
  updatedAt: number;
}

interface ComponentPricing {
  markup: number;
  roundRule: 'up' | 'down' | 'nearest';
  minFloor: number;
  passThrough: boolean;
}

interface PreviewResult {
  weightKg: number;
  cost: number;
  sell: number;
  margin: number;
  marginPercent: number;
}

export default function AdminPricingPage() {
  // Check if we're in a browser environment to avoid build-time issues with Convex hooks
  const isBrowser = typeof window !== 'undefined';
  const { hasPermission, loading: authLoading } = isBrowser ? usePermissions() : { 
    hasPermission: () => false, 
    loading: true 
  };
  const [policy, setPolicy] = useState<PricingPolicy | null>(null);
  const [preview, setPreview] = useState<PreviewResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state for editing
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!authLoading && hasPermission(Permission.MANAGE_RATES)) {
      fetchCurrentPolicy();
      fetchPreview();
    }
  }, [authLoading, hasPermission]);

  const fetchCurrentPolicy = async () => {
    try {
      const response = await fetch('/api/admin/pricing');
      const data = await response.json();
      
      if (data.success) {
        setPolicy(data.policy);
      } else {
        setError('Failed to load pricing policy');
      }
    } catch (err) {
      setError('Network error loading pricing policy');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    try {
      const response = await fetch('/api/admin/pricing?action=preview');
      const data = await response.json();
      
      if (data.success) {
        setPreview(data.preview.results);
      }
    } catch (err) {
      console.error('Failed to load preview:', err);
    }
  };

  const handleComponentChange = (component: string, field: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: {
          ...prev.components?.[component],
          [field]: value,
        },
      },
    }));
  };

  const handleSurchargeChange = (field: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      surchargeRules: {
        ...prev.surchargeRules,
        paidOutsideUSA: {
          ...prev.surchargeRules?.paidOutsideUSA,
          [field]: value,
        },
      },
    }));
  };

  const handleGlobalRuleChange = (field: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      globalRules: {
        ...prev.globalRules,
        [field]: value,
      },
    }));
  };

  const saveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      setError('No changes to save');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pendingChanges),
      });

      const data = await response.json();
      
      if (data.success) {
        setPolicy(data.policy);
        setPreview(data.preview.results);
        setPendingChanges({});
        setSuccessMessage('Pricing policy updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Failed to save changes');
      }
    } catch (err) {
      setError('Network error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setPendingChanges({});
    setEditingComponent(null);
    setError(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pricing dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission(Permission.MANAGE_RATES)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to manage pricing policies.</p>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Policy</h1>
          <p className="text-gray-600">{error || 'Failed to load pricing policy'}</p>
        </div>
      </div>
    );
  }

  const getComponentValue = (component: string, field: string) => {
    return pendingChanges.components?.[component]?.[field] ?? policy.components[component as keyof typeof policy.components][field as keyof ComponentPricing];
  };

  const getSurchargeValue = (field: string) => {
    return pendingChanges.surchargeRules?.paidOutsideUSA?.[field] ?? policy.surchargeRules.paidOutsideUSA[field as keyof typeof policy.surchargeRules.paidOutsideUSA];
  };

  const getGlobalRuleValue = (field: string) => {
    return pendingChanges.globalRules?.[field] ?? policy.globalRules[field as keyof typeof policy.globalRules];
  };

  const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pricing Policy Management</h1>
              <p className="text-gray-600 mt-2">Configure markup rules and preview pricing impact</p>
              <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                <span>Policy Version: {policy.version}</span>
                <span>•</span>
                <span>Last Updated: {new Date(policy.updatedAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>Effective: {new Date(policy.effectiveDate).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {hasUnsavedChanges && (
                <button
                  onClick={resetChanges}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Reset Changes
                </button>
              )}
              <button
                onClick={saveChanges}
                disabled={!hasUnsavedChanges || saving}
                className={`px-6 py-2 rounded-lg font-medium ${
                  hasUnsavedChanges && !saving
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
          
          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {successMessage}
            </div>
          )}
          
          {hasUnsavedChanges && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
              You have unsaved changes. Save them to apply the new pricing policy.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Component Markups */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Component Markup Settings</h2>
              
              <div className="space-y-6">
                {Object.entries(policy.components).map(([component, config]) => (
                  <div key={component} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-900 capitalize">
                        {component.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </h3>
                      <button
                        onClick={() => setEditingComponent(editingComponent === component ? null : component)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {editingComponent === component ? 'Done' : 'Edit'}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Markup</label>
                        {editingComponent === component ? (
                          <input
                            type="number"
                            step="0.01"
                            min="1.0"
                            value={getComponentValue(component, 'markup')}
                            onChange={(e) => handleComponentChange(component, 'markup', parseFloat(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <div className="text-sm font-medium">{getComponentValue(component, 'markup')}x</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Round Rule</label>
                        {editingComponent === component ? (
                          <select
                            value={getComponentValue(component, 'roundRule')}
                            onChange={(e) => handleComponentChange(component, 'roundRule', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="up">Round Up</option>
                            <option value="down">Round Down</option>
                            <option value="nearest">Round Nearest</option>
                          </select>
                        ) : (
                          <div className="text-sm">{getComponentValue(component, 'roundRule')}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Min Floor</label>
                        {editingComponent === component ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={getComponentValue(component, 'minFloor')}
                            onChange={(e) => handleComponentChange(component, 'minFloor', parseFloat(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <div className="text-sm">${getComponentValue(component, 'minFloor')}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Pass Through</label>
                        {editingComponent === component ? (
                          <input
                            type="checkbox"
                            checked={getComponentValue(component, 'passThrough')}
                            onChange={(e) => handleComponentChange(component, 'passThrough', e.target.checked)}
                            className="h-4 w-4 text-blue-600"
                          />
                        ) : (
                          <div className="text-sm">{getComponentValue(component, 'passThrough') ? 'Yes' : 'No'}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Surcharge Rules */}
            <div className="bg-white shadow rounded-lg p-6 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Surcharge Rules</h2>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Paid Outside USA Surcharge</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Threshold ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={getSurchargeValue('thresholdUSD')}
                      onChange={(e) => handleSurchargeChange('thresholdUSD', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Flat Fee ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={getSurchargeValue('flatFeeUSD')}
                      onChange={(e) => handleSurchargeChange('flatFeeUSD', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Percentage (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={getSurchargeValue('percentageRate')}
                      onChange={(e) => handleSurchargeChange('percentageRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mt-2">
                  Apply ${getSurchargeValue('flatFeeUSD')} for orders under ${getSurchargeValue('thresholdUSD')}, 
                  or {getSurchargeValue('percentageRate')}% for orders ${getSurchargeValue('thresholdUSD')}+
                </p>
              </div>
            </div>

            {/* Global Rules */}
            <div className="bg-white shadow rounded-lg p-6 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Global Rules</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Sell Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={getGlobalRuleValue('minSellPrice')}
                    onChange={(e) => handleGlobalRuleChange('minSellPrice', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Round Rule</label>
                  <select
                    value={getGlobalRuleValue('defaultRoundRule')}
                    onChange={(e) => handleGlobalRuleChange('defaultRoundRule', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="up">Round Up</option>
                    <option value="down">Round Down</option>
                    <option value="nearest">Round Nearest</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Round To Nearest</label>
                  <input
                    type="number"
                    step="0.01"
                    value={getGlobalRuleValue('roundToNearest')}
                    onChange={(e) => handleGlobalRuleChange('roundToNearest', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Pricing Preview</h2>
              
              <div className="space-y-4">
                {preview.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{result.weightKg}kg</span>
                      <span className="text-lg font-bold text-blue-600">${result.sell.toFixed(2)}</span>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span>${result.cost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margin:</span>
                        <span className={result.marginPercent >= 50 ? 'text-green-600' : 'text-orange-600'}>
                          ${result.margin.toFixed(2)} ({result.marginPercent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 text-sm mb-1">Sample Calculation</h4>
                <p className="text-blue-700 text-xs">
                  Based on JetPak rates to Guyana with current policy settings. 
                  Changes update in real-time when saved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
