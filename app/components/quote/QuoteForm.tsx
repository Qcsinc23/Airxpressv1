// QuoteForm.tsx
'use client';

import { useState } from 'react';
import { RateInput } from '../../types/shipping';

interface QuoteFormProps {
  onSubmit: (input: RateInput) => void;
  error?: string;
}

export default function QuoteForm({ onSubmit, error }: QuoteFormProps) {
  const [formData, setFormData] = useState({
    originZip: '',
    destCountry: '',
    destCity: '',
    serviceLevel: 'EXPRESS' as 'STANDARD' | 'EXPRESS' | 'NFO',
    afterHours: false,
    isPersonalEffects: false,
  });
  
  const [pieces, setPieces] = useState([
    { type: 'box', weight: 10, length: 0, width: 0, height: 0 }
  ]);
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePieceChange = (index: number, field: string, value: string | number) => {
    const updatedPieces = [...pieces];
    updatedPieces[index] = { ...updatedPieces[index], [field]: value };
    setPieces(updatedPieces);
  };

  const addPiece = () => {
    setPieces([...pieces, { type: 'box', weight: 10, length: 0, width: 0, height: 0 }]);
  };

  const removePiece = (index: number) => {
    if (pieces.length > 1) {
      const updatedPieces = pieces.filter((_, i) => i !== index);
      setPieces(updatedPieces);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Validate origin ZIP
    if (!formData.originZip.trim()) {
      errors.originZip = 'Pickup ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.originZip)) {
      errors.originZip = 'Please enter a valid ZIP code';
    }
    
    // Validate destination country
    if (!formData.destCountry) {
      errors.destCountry = 'Destination country is required';
    }
    
    // Validate pieces
    pieces.forEach((piece, index) => {
      if (piece.weight <= 0) {
        errors[`piece-${index}-weight`] = 'Weight must be greater than 0';
      }
      
      if (piece.length < 0 || piece.width < 0 || piece.height < 0) {
        errors[`piece-${index}-dimensions`] = 'Dimensions cannot be negative';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Conversion constants
    const LB_TO_KG = 0.45359237;
    const IN_TO_CM = 2.54;
    
    onSubmit({
      ...formData,
      pieces: pieces.map(piece => ({
        type: piece.type as 'barrel' | 'box',
        weight: Number(piece.weight) * LB_TO_KG, // Convert lbs to kg
        dimensions: piece.length && piece.width && piece.height ? {
          length: Number(piece.length) * IN_TO_CM, // Convert inches to cm
          width: Number(piece.width) * IN_TO_CM,
          height: Number(piece.height) * IN_TO_CM
        } : undefined
      }))
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 mb-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
          Get Your Quote
        </h2>
        <p className="text-gray-600">Fast, reliable shipping to the Caribbean</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-in slide-in-from-top duration-300">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {/* Origin and Destination Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pickup ZIP Code */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2" htmlFor="originZip">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Pickup ZIP Code (NJ)
            </label>
            <div className="relative">
              <input
                id="originZip"
                name="originZip"
                type="text"
                value={formData.originZip}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                  formErrors.originZip ? 'border-red-500 bg-red-50/50' : ''
                }`}
                placeholder="Enter pickup ZIP code"
              />
            </div>
            {formErrors.originZip && (
              <p className="text-red-500 text-sm flex items-center mt-2">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                </svg>
                {formErrors.originZip}
              </p>
            )}
          </div>

          {/* Destination Country */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2" htmlFor="destCountry">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
              </svg>
              Destination Country
            </label>
            <div className="relative">
              <select
                id="destCountry"
                name="destCountry"
                value={formData.destCountry}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none ${
                  formErrors.destCountry ? 'border-red-500 bg-red-50/50' : ''
                }`}
              >
                <option value="">Select destination country</option>
                <option value="Guyana">🇬🇾 Guyana</option>
                <option value="Trinidad">🇹🇹 Trinidad and Tobago</option>
                <option value="Jamaica">🇯🇲 Jamaica</option>
                <option value="Barbados">🇧🇧 Barbados</option>
                <option value="Puerto Rico">🇵🇷 Puerto Rico</option>
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {formErrors.destCountry && (
              <p className="text-red-500 text-sm flex items-center mt-2">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                </svg>
                {formErrors.destCountry}
              </p>
            )}
          </div>
        </div>

        {/* Destination City */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2" htmlFor="destCity">
            <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/>
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
            </svg>
            Destination City <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            id="destCity"
            name="destCity"
            type="text"
            value={formData.destCity}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            placeholder="Georgetown, Port of Spain, Kingston..."
          />
        </div>

        {/* Service Level */}
        <div className="space-y-4">
          <label className="flex items-center text-sm font-semibold text-gray-700">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
            Service Level
          </label>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { value: 'STANDARD', label: 'Standard', desc: 'Most economical', icon: '🚛' },
              { value: 'EXPRESS', label: 'Express', desc: 'Faster delivery', icon: '✈️' },
              { value: 'NFO', label: 'Next Flight Out', desc: 'Fastest option', icon: '🚀' }
            ].map((service) => (
              <label key={service.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="serviceLevel"
                  value={service.value}
                  checked={formData.serviceLevel === service.value}
                  onChange={handleInputChange}
                  className="peer sr-only"
                />
                <div className="p-4 bg-white/50 border-2 border-gray-200 rounded-xl transition-all duration-200 peer-checked:border-blue-500 peer-checked:bg-blue-50/50 hover:border-gray-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{service.icon}</span>
                        <span className="font-semibold text-gray-900">{service.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{service.desc}</p>
                    </div>
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all duration-200">
                      <div className="w-full h-full rounded-full bg-white scale-0 peer-checked:scale-50 transition-transform duration-200"></div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Shipment Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              Package Details
            </label>
            <span className="text-sm text-gray-500">{pieces.length} {pieces.length === 1 ? 'package' : 'packages'}</span>
          </div>
          
          <div className="space-y-4">
            {pieces.map((piece, index) => (
              <div key={index} className="bg-gradient-to-r from-white/60 to-white/40 border border-gray-200 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-gray-900">Package {index + 1}</h3>
                  </div>
                  {pieces.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePiece(index)}
                      className="flex items-center text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
                    <select
                      value={piece.type}
                      onChange={(e) => handlePieceChange(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="box">📦 Box/Carton</option>
                      <option value="barrel">🛢️ Barrel</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                    <input
                      type="number"
                      value={piece.weight}
                      onChange={(e) => handlePieceChange(index, 'weight', e.target.value)}
                      className={`w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        formErrors[`piece-${index}-weight`] ? 'border-red-500 bg-red-50/50' : ''
                      }`}
                      min="0.1"
                      step="0.1"
                      placeholder="Enter weight"
                    />
                    {formErrors[`piece-${index}-weight`] && (
                      <p className="text-red-500 text-sm flex items-center mt-2">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
                        </svg>
                        {formErrors[`piece-${index}-weight`]}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions (inches) <span className="text-gray-500 font-normal">- Optional</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <input
                        type="number"
                        value={piece.length}
                        onChange={(e) => handlePieceChange(index, 'length', e.target.value)}
                        className={`w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          formErrors[`piece-${index}-dimensions`] ? 'border-red-500 bg-red-50/50' : ''
                        }`}
                        min="0"
                        step="0.1"
                        placeholder="Length"
                      />
                    </div>
                    
                    <div>
                      <input
                        type="number"
                        value={piece.width}
                        onChange={(e) => handlePieceChange(index, 'width', e.target.value)}
                        className={`w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          formErrors[`piece-${index}-dimensions`] ? 'border-red-500 bg-red-50/50' : ''
                        }`}
                        min="0"
                        step="0.1"
                        placeholder="Width"
                      />
                    </div>
                    
                    <div>
                      <input
                        type="number"
                        value={piece.height}
                        onChange={(e) => handlePieceChange(index, 'height', e.target.value)}
                        className={`w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          formErrors[`piece-${index}-dimensions`] ? 'border-red-500 bg-red-50/50' : ''
                        }`}
                        min="0"
                        step="0.1"
                        placeholder="Height"
                      />
                    </div>
                  </div>
                  {formErrors[`piece-${index}-dimensions`] && (
                    <p className="text-red-500 text-sm flex items-center mt-2">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
                      </svg>
                      {formErrors[`piece-${index}-dimensions`]}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addPiece}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-200 flex items-center justify-center font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Add Another Package
            </button>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <svg className="w-4 h-4 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
            </svg>
            Additional Options
          </label>
          
          <div className="space-y-3">
            <label className="flex items-start cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  name="afterHours"
                  type="checkbox"
                  checked={formData.afterHours}
                  onChange={handleInputChange}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all duration-200 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">After-hours pickup</span>
                <p className="text-xs text-gray-500 mt-1">Available between 4:00 PM - 8:00 AM</p>
              </div>
            </label>

            <label className="flex items-start cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  name="isPersonalEffects"
                  type="checkbox"
                  checked={formData.isPersonalEffects}
                  onChange={handleInputChange}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all duration-200 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">Personal effects shipment</span>
                <p className="text-xs text-gray-500 mt-1">Barrel shipment to Guyana with special rates</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Get Instant Quote
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
