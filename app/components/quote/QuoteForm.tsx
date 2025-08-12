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
    
    onSubmit({
      ...formData,
      pieces: pieces.map(piece => ({
        type: piece.type as 'barrel' | 'box',
        weight: Number(piece.weight),
        dimensions: piece.length && piece.width && piece.height ? {
          length: Number(piece.length),
          width: Number(piece.width),
          height: Number(piece.height)
        } : undefined
      }))
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="originZip">
          Pickup ZIP Code (NJ)
        </label>
        <input
          id="originZip"
          name="originZip"
          type="text"
          value={formData.originZip}
          onChange={handleInputChange}
          required
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            formErrors.originZip ? 'border-red-500' : ''
          }`}
          placeholder="07001"
        />
        {formErrors.originZip && (
          <p className="text-red-500 text-xs italic mt-2">{formErrors.originZip}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destCountry">
          Destination Country
        </label>
        <select
          id="destCountry"
          name="destCountry"
          value={formData.destCountry}
          onChange={handleInputChange}
          required
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            formErrors.destCountry ? 'border-red-500' : ''
          }`}
        >
          <option value="">Select Country</option>
          <option value="Guyana">Guyana</option>
          <option value="Trinidad">Trinidad and Tobago</option>
          <option value="Jamaica">Jamaica</option>
          <option value="Barbados">Barbados</option>
          <option value="Puerto Rico">Puerto Rico</option>
        </select>
        {formErrors.destCountry && (
          <p className="text-red-500 text-xs italic mt-2">{formErrors.destCountry}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destCity">
          Destination City (Optional)
        </label>
        <input
          id="destCity"
          name="destCity"
          type="text"
          value={formData.destCity}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Georgetown, Port of Spain, etc."
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Service Level
        </label>
        <div className="flex items-center">
          <label className="mr-4">
            <input
              type="radio"
              name="serviceLevel"
              value="STANDARD"
              checked={formData.serviceLevel === 'STANDARD'}
              onChange={handleInputChange}
              className="mr-2"
            />
            Standard
          </label>
          <label className="mr-4">
            <input
              type="radio"
              name="serviceLevel"
              value="EXPRESS"
              checked={formData.serviceLevel === 'EXPRESS'}
              onChange={handleInputChange}
              className="mr-2"
            />
            Express
          </label>
          <label>
            <input
              type="radio"
              name="serviceLevel"
              value="NFO"
              checked={formData.serviceLevel === 'NFO'}
              onChange={handleInputChange}
              className="mr-2"
            />
            Next Flight Out
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Shipment Details
        </label>
        
        {pieces.map((piece, index) => (
          <div key={index} className="border p-4 mb-2 rounded">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Piece {index + 1}</h3>
              {pieces.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePiece(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-gray-700 text-xs mb-1">Type</label>
                <select
                  value={piece.type}
                  onChange={(e) => handlePieceChange(index, 'type', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="box">Box/Carton</option>
                  <option value="barrel">Barrel</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-xs mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  value={piece.weight}
                  onChange={(e) => handlePieceChange(index, 'weight', e.target.value)}
                  className={`w-full p-2 border rounded ${
                    formErrors[`piece-${index}-weight`] ? 'border-red-500' : ''
                  }`}
                  min="0.1"
                  step="0.1"
                />
                {formErrors[`piece-${index}-weight`] && (
                  <p className="text-red-500 text-xs italic mt-1">{formErrors[`piece-${index}-weight`]}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-700 text-xs mb-1">Length (in)</label>
                <input
                  type="number"
                  value={piece.length}
                  onChange={(e) => handlePieceChange(index, 'length', e.target.value)}
                  className={`w-full p-2 border rounded ${
                    formErrors[`piece-${index}-dimensions`] ? 'border-red-500' : ''
                  }`}
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-xs mb-1">Width (in)</label>
                <input
                  type="number"
                  value={piece.width}
                  onChange={(e) => handlePieceChange(index, 'width', e.target.value)}
                  className={`w-full p-2 border rounded ${
                    formErrors[`piece-${index}-dimensions`] ? 'border-red-500' : ''
                  }`}
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-xs mb-1">Height (in)</label>
                <input
                  type="number"
                  value={piece.height}
                  onChange={(e) => handlePieceChange(index, 'height', e.target.value)}
                  className={`w-full p-2 border rounded ${
                    formErrors[`piece-${index}-dimensions`] ? 'border-red-500' : ''
                  }`}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
            {formErrors[`piece-${index}-dimensions`] && (
              <p className="text-red-500 text-xs italic mt-1">{formErrors[`piece-${index}-dimensions`]}</p>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={addPiece}
          className="mt-2 text-blue-500 hover:text-blue-700"
        >
          + Add Another Piece
        </button>
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            name="afterHours"
            type="checkbox"
            checked={formData.afterHours}
            onChange={handleInputChange}
            className="mr-2"
          />
          <span className="text-gray-700 text-sm">After-hours pickup (4:00 PM - 8:00 AM)</span>
        </label>
      </div>

      <div className="mb-6">
        <label className="flex items-center">
          <input
            name="isPersonalEffects"
            type="checkbox"
            checked={formData.isPersonalEffects}
            onChange={handleInputChange}
            className="mr-2"
          />
          <span className="text-gray-700 text-sm">Personal effects/barrel shipment to Guyana</span>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Get Quote
        </button>
      </div>
    </form>
  );
}
