// app/dashboard/booking/[bookingId]/invoice/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

interface ShippingInvoiceProps {
  params: {
    bookingId: string;
  };
}

export default function ShippingInvoicePage({ params }: ShippingInvoiceProps) {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    shipFrom: {
      name: user?.fullName || '',
      phone: user?.primaryPhoneNumber?.phoneNumber || '',
      address: '',
    },
    shipTo: {
      name: '',
      phone: '',
      address: '',
      destination: 'Georgetown, Guyana',
    },
    mode: 'Air Freight',
    awbNumber: '',
    documentNo: '',
    paymentTerms: ['PREPAID'],
    freightCollect: false,
    serviceType: 'General Air',
    insurance: {
      accepted: false,
      value: 0,
      initials: '',
    },
    items: [{
      description: '',
      lengthIn: 0,
      widthIn: 0,
      heightIn: 0,
      pieces: 1,
      cubicFt: 0,
      weightLb: 0,
    }],
    instructions: '',
    charges: {
      freight: 0,
      pickup: 0,
      packing: 0,
      others: 0,
      subtotal: 0,
      deposit: 0,
      freightCollectFee: 0,
      balanceDue: 0,
    },
    hazardous: false,
    signature: {
      initials: '',
      signedAtISO: '',
    },
    disclaimerVersion: 'v2025-08',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // TODO: Implement invoice saving functionality when onboarding functions are available
  const saveInvoice = async (args: any) => {
    console.warn('Invoice saving not implemented - onboarding functions not available');
    throw new Error('Invoice saving functionality is not yet implemented');
  };

  // Calculate cubic feet automatically
  const calculateCubicFeet = (item: any) => {
    if (item.lengthIn && item.widthIn && item.heightIn) {
      return (item.lengthIn * item.widthIn * item.heightIn) / 1728; // 1728 cubic inches = 1 cubic foot
    }
    return 0;
  };

  // Update charges automatically
  useEffect(() => {
    const subtotal = formData.charges.freight + formData.charges.pickup + formData.charges.packing + formData.charges.others;
    const balanceDue = subtotal - formData.charges.deposit + formData.charges.freightCollectFee;
    
    setFormData(prev => ({
      ...prev,
      charges: {
        ...prev.charges,
        subtotal,
        balanceDue,
      }
    }));
  }, [formData.charges.freight, formData.charges.pickup, formData.charges.packing, formData.charges.others, formData.charges.deposit, formData.charges.freightCollectFee]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value,
      }
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate cubic feet
    if (['lengthIn', 'widthIn', 'heightIn'].includes(field)) {
      updatedItems[index].cubicFt = calculateCubicFeet(updatedItems[index]);
    }
    
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        lengthIn: 0,
        widthIn: 0,
        heightIn: 0,
        pieces: 1,
        cubicFt: 0,
        weightLb: 0,
      }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.signature.initials) {
      alert('Please provide your initials to sign the invoice');
      return;
    }

    setSaving(true);
    
    try {
      const invoiceData = {
        ...formData,
        bookingId: params.bookingId,
        userId: user?.id as Id<"users">,
        signature: {
          ...formData.signature,
          signedAtISO: new Date().toISOString(),
        }
      };

      await saveInvoice({ invoice: invoiceData });
      setSaved(true);
      
      // Redirect to booking overview after a delay
      setTimeout(() => {
        window.location.href = `/dashboard/booking/${params.bookingId}`;
      }, 2000);
      
    } catch (error) {
      console.error('Failed to save invoice:', error);
      alert('Failed to save invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Saved Successfully</h1>
            <p className="text-gray-600 mb-6">
              Your Cargo Xpress NJ Shipping Invoice has been completed and saved.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to booking overview...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Cargo Xpress NJ - Shipping Invoice
            </h1>
            <p className="text-gray-600">Booking ID: {params.bookingId}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shipper & Consignee Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Ship From */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Ship From</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.shipFrom.name}
                    onChange={(e) => handleInputChange('shipFrom', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.shipFrom.phone}
                    onChange={(e) => handleInputChange('shipFrom', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <textarea
                    placeholder="Full Address"
                    value={formData.shipFrom.address}
                    onChange={(e) => handleInputChange('shipFrom', 'address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Ship To */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Ship To (Consignee)</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.shipTo.name}
                    onChange={(e) => handleInputChange('shipTo', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.shipTo.phone}
                    onChange={(e) => handleInputChange('shipTo', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <textarea
                    placeholder="Full Address"
                    value={formData.shipTo.address}
                    onChange={(e) => handleInputChange('shipTo', 'address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <select
                    value={formData.shipTo.destination}
                    onChange={(e) => handleInputChange('shipTo', 'destination', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Georgetown, Guyana">Georgetown, Guyana</option>
                    <option value="Port of Spain, Trinidad">Port of Spain, Trinidad</option>
                    <option value="Kingston, Jamaica">Kingston, Jamaica</option>
                    <option value="Bridgetown, Barbados">Bridgetown, Barbados</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
            
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <input
                    type="number"
                    placeholder="Length (in)"
                    value={item.lengthIn || ''}
                    onChange={(e) => handleItemChange(index, 'lengthIn', parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Width (in)"
                    value={item.widthIn || ''}
                    onChange={(e) => handleItemChange(index, 'widthIn', parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Height (in)"
                    value={item.heightIn || ''}
                    onChange={(e) => handleItemChange(index, 'heightIn', parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Pieces"
                    value={item.pieces || ''}
                    onChange={(e) => handleItemChange(index, 'pieces', parseInt(e.target.value) || 1)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Cubic Ft"
                    value={item.cubicFt.toFixed(2)}
                    readOnly
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <input
                    type="number"
                    placeholder="Weight (lbs)"
                    value={item.weightLb || ''}
                    onChange={(e) => handleItemChange(index, 'weightLb', parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <textarea
                  placeholder="Item Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            ))}
            
            <button
              type="button"
              onClick={addItem}
              className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              + Add Another Item
            </button>
          </div>

          {/* Charges */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Charges</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Freight:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.charges.freight || ''}
                    onChange={(e) => handleInputChange('charges', 'freight', parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Pickup:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.charges.pickup || ''}
                    onChange={(e) => handleInputChange('charges', 'pickup', parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Packing:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.charges.packing || ''}
                    onChange={(e) => handleInputChange('charges', 'packing', parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Others:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.charges.others || ''}
                    onChange={(e) => handleInputChange('charges', 'others', parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center font-semibold">
                  <label className="text-sm text-gray-900">Subtotal:</label>
                  <span className="text-gray-900">${formData.charges.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Deposit:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.charges.deposit || ''}
                    onChange={(e) => handleInputChange('charges', 'deposit', parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Freight Collect Fee:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.charges.freightCollectFee || ''}
                    onChange={(e) => handleInputChange('charges', 'freightCollectFee', parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-between items-center font-bold border-t pt-2">
                  <label className="text-sm text-gray-900">Balance Due:</label>
                  <span className="text-gray-900">${formData.charges.balanceDue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature & Agreement</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Disclaimer (v2025-08):</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p>• Per-piece limits: ≤50 lb & L+W+H ≤62″. Volumetric weight may apply.</p>
                <p>• Prohibited items; destination duties/taxes unless agreed.</p>
                <p>• Paid outside USA surcharge: $10 if total &lt; $100, else 10%.</p>
                <p>• Storage after 7 days: $1/cu-ft/day.</p>
                <p>• Carrier liability limits; force majeure; data & e-sign consent.</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Initials (Required) *
                </label>
                <input
                  type="text"
                  value={formData.signature.initials}
                  onChange={(e) => handleInputChange('signature', 'initials', e.target.value)}
                  placeholder="Enter your initials"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time
                </label>
                <input
                  type="text"
                  value={new Date().toLocaleString()}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="bg-white rounded-lg shadow p-6">
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving Invoice...' : 'Save Shipping Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}