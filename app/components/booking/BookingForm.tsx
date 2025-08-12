// app/components/booking/BookingForm.tsx
'use client';

import { useState } from 'react';
import { Rate } from '../../types/shipping';

interface BookingFormProps {
  selectedRate: Rate;
  onSubmit: (pickupDetails: PickupDetails) => void;
  onBack: () => void;
}

export interface PickupDetails {
  scheduledTime: string;
  address: string;
  contact: string;
  specialInstructions?: string;
}

export default function BookingForm({ selectedRate, onSubmit, onBack }: BookingFormProps) {
  const [formData, setFormData] = useState<PickupDetails>({
    scheduledTime: '',
    address: '',
    contact: '',
    specialInstructions: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Pickup time is required';
    } else {
      const scheduledDate = new Date(formData.scheduledTime);
      const now = new Date();
      const cutoffTime = new Date();
      
      // Parse cutoff time (e.g., "14:00" -> 2:00 PM today)
      const [hours, minutes] = selectedRate.cutOffTime.split(':').map(Number);
      cutoffTime.setHours(hours, minutes, 0, 0);
      
      if (scheduledDate <= now) {
        newErrors.scheduledTime = 'Pickup time must be in the future';
      } else if (scheduledDate.toDateString() === now.toDateString() && now >= cutoffTime) {
        newErrors.scheduledTime = `Same-day pickups must be scheduled before ${selectedRate.cutOffTime} ET`;
      }
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Pickup address is required';
    }
    
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact information is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Calculate minimum pickup time (1 hour from now)
  const minDateTime = new Date();
  minDateTime.setHours(minDateTime.getHours() + 1);
  const minDateTimeString = minDateTime.toISOString().slice(0, 16);

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">Schedule Pickup</h2>
      
      {/* Selected Rate Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h3 className="font-bold mb-2">Selected Rate</h3>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">{selectedRate.carrier}</div>
            <div className="text-sm text-gray-600">
              {selectedRate.departureAirport} → {selectedRate.arrivalAirport}
            </div>
            <div className="text-sm text-gray-600">
              {selectedRate.serviceLevel} • {selectedRate.transitTime} day{selectedRate.transitTime !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="text-xl font-bold text-blue-600">
            ${selectedRate.totalPrice.toFixed(2)}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="scheduledTime">
            Pickup Date & Time *
          </label>
          <input
            id="scheduledTime"
            name="scheduledTime"
            type="datetime-local"
            value={formData.scheduledTime}
            onChange={handleInputChange}
            min={minDateTimeString}
            required
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.scheduledTime ? 'border-red-500' : ''
            }`}
          />
          {errors.scheduledTime && (
            <p className="text-red-500 text-xs italic mt-2">{errors.scheduledTime}</p>
          )}
          <p className="text-gray-600 text-xs mt-1">
            Cutoff for same-day service: {selectedRate.cutOffTime} ET
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
            Pickup Address *
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleInputChange}
            required
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.address ? 'border-red-500' : ''
            }`}
            placeholder="123 Main St, Newark, NJ 07102"
          />
          {errors.address && (
            <p className="text-red-500 text-xs italic mt-2">{errors.address}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact">
            Contact Information *
          </label>
          <input
            id="contact"
            name="contact"
            type="text"
            value={formData.contact}
            onChange={handleInputChange}
            required
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.contact ? 'border-red-500' : ''
            }`}
            placeholder="John Doe - (201) 555-0123"
          />
          {errors.contact && (
            <p className="text-red-500 text-xs italic mt-2">{errors.contact}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specialInstructions">
            Special Instructions (Optional)
          </label>
          <textarea
            id="specialInstructions"
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleInputChange}
            rows={3}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Building access code, delivery notes, etc."
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-blue-500 hover:text-blue-700"
          >
            ← Back to Rates
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
}