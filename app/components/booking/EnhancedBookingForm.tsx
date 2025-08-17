// app/components/booking/EnhancedBookingForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormField, Input } from '../ui/FormField';
import { Rate } from '../../types/shipping';

interface EnhancedBookingFormProps {
  selectedRate: Rate;
  onSubmit: (pickupDetails: PickupDetails) => void;
  onBack: () => void;
  loading?: boolean;
}

export interface PickupDetails {
  scheduledTime: string;
  address: string;
  contact: string;
  specialInstructions?: string;
}

export default function EnhancedBookingForm({ 
  selectedRate, 
  onSubmit, 
  onBack, 
  loading = false 
}: EnhancedBookingFormProps) {
  const [formData, setFormData] = useState<PickupDetails>({
    scheduledTime: '',
    address: '',
    contact: '',
    specialInstructions: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Calculate minimum pickup time (1 hour from now)
  const minDateTime = new Date();
  minDateTime.setHours(minDateTime.getHours() + 1);
  const minDateTimeString = minDateTime.toISOString().slice(0, 16);

  // Validate form in real-time
  useEffect(() => {
    const requiredFields = ['scheduledTime', 'address', 'contact'];
    const allFieldsFilled = requiredFields.every(field => 
      formData[field as keyof PickupDetails]?.toString().trim()
    );
    
    const hasScheduledTime = formData.scheduledTime && new Date(formData.scheduledTime) > new Date();
    setIsFormValid(allFieldsFilled && hasScheduledTime && Object.keys(errors).length === 0);
  }, [formData, errors]);

  const handleInputChange = (field: keyof PickupDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
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
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address';
    }
    
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact information is required';
    } else if (!/\d/.test(formData.contact)) {
      newErrors.contact = 'Please include a phone number';
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

  return (
    <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold mb-2">Book & Pay</h2>
            <p className="text-green-100">Schedule your pickup and complete your booking</p>
          </div>
          <motion.div
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </motion.div>
        </motion.div>
      </div>

      <div className="p-8">
        {/* Selected Rate Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
        >
          <h3 className="font-bold text-blue-900 mb-4 flex items-center">
            <motion.svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </motion.svg>
            Selected Rate
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">Carrier:</span>
                <span className="font-semibold text-blue-900">{selectedRate.carrier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">Route:</span>
                <span className="font-mono text-blue-900">
                  {selectedRate.departureAirport} → {selectedRate.arrivalAirport}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">Service:</span>
                <span className="flex items-center text-blue-900">
                  {selectedRate.serviceLevel === 'EXPRESS' && '✈️ Express'}
                  {selectedRate.serviceLevel === 'STANDARD' && '🚛 Standard'}
                  {selectedRate.serviceLevel === 'NFO' && '🚀 Next Flight Out'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  ${selectedRate.totalPrice.toFixed(2)}
                </div>
                <div className="text-sm text-blue-700">
                  {selectedRate.transitTime} day{selectedRate.transitTime !== 1 ? 's' : ''} transit
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time */}
          <FormField
            label="Pickup Date & Time"
            name="scheduledTime"
            error={errors.scheduledTime}
            required
            description={`Cutoff for same-day: ${selectedRate.cutOffTime} ET`}
            icon={
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
              </svg>
            }
          >
            <input
              type="datetime-local"
              value={formData.scheduledTime}
              onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
              min={minDateTimeString}
              className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-200 
                focus:outline-none focus:ring-0 focus:border-blue-500
                ${errors.scheduledTime 
                  ? 'border-red-300 bg-red-50/50' 
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            />
          </FormField>

          {/* Pickup Address */}
          <FormField
            label="Pickup Address"
            name="address"
            error={errors.address}
            required
            icon={
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
            }
          >
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Main St, Newark, NJ 07102"
              error={!!errors.address}
            />
          </FormField>

          {/* Contact Information */}
          <FormField
            label="Contact Information"
            name="contact"
            error={errors.contact}
            required
            description="Name and phone number for pickup coordination"
            icon={
              <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
            }
          >
            <Input
              value={formData.contact}
              onChange={(e) => handleInputChange('contact', e.target.value)}
              placeholder="John Doe - (201) 555-0123"
              error={!!errors.contact}
            />
          </FormField>

          {/* Special Instructions */}
          <FormField
            label="Special Instructions"
            name="specialInstructions"
            description="Building access codes, delivery notes, etc."
            icon={
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
              </svg>
            }
          >
            <textarea
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-200 
                focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-gray-300
                placeholder:text-gray-400 resize-none"
              placeholder="Access code: 1234, Building entrance on Main St side, Ring doorbell twice..."
            />
          </FormField>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-xl"
          >
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
              </svg>
              <div>
                <h4 className="font-semibold text-blue-800">Important Pickup Information</h4>
                <ul className="text-blue-700 text-sm mt-2 space-y-1">
                  <li>• Please ensure someone is available at the scheduled time</li>
                  <li>• Have packages ready and labeled for pickup</li>
                  <li>• You'll receive SMS/email updates on driver location</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6">
            <motion.button
              type="button"
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back to Rates
            </motion.button>

            <motion.button
              type="submit"
              disabled={!isFormValid || loading}
              className={`px-8 py-4 rounded-xl font-semibold text-white transition-all shadow-lg ${
                isFormValid && !loading
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              whileHover={isFormValid && !loading ? { scale: 1.05, y: -2 } : {}}
              whileTap={isFormValid && !loading ? { scale: 0.95 } : {}}
            >
              <span className="flex items-center">
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    Proceed to Payment
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}