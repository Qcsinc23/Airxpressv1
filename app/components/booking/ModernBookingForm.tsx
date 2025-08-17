// app/components/booking/ModernBookingForm.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import { FormField, Input } from '../ui/FormField';
import { Rate } from '../../types/shipping';
import "react-datepicker/dist/react-datepicker.css";

interface ModernBookingFormProps {
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

interface AddressDetails {
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  zipCode: string;
  formatted: string;
}

interface ContactDetails {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export default function ModernBookingForm({ 
  selectedRate, 
  onSubmit, 
  onBack, 
  loading = false 
}: ModernBookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [addressDetails, setAddressDetails] = useState<AddressDetails>({
    streetNumber: '',
    streetName: '',
    city: '',
    state: 'NJ',
    zipCode: '',
    formatted: ''
  });
  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // Calculate minimum pickup time (1 hour from now)
  const minDateTime = new Date();
  minDateTime.setHours(minDateTime.getHours() + 1);

  // Validate form in real-time
  useEffect(() => {
    const hasDate = selectedDate && selectedDate > new Date();
    const hasAddress = addressDetails.streetNumber && addressDetails.streetName && addressDetails.zipCode;
    const hasContact = contactDetails.firstName && contactDetails.lastName && contactDetails.phone;
    
    setIsFormValid(!!hasDate && !!hasAddress && !!hasContact && Object.keys(errors).length === 0);
  }, [selectedDate, addressDetails, contactDetails, errors]);

  // Mock Google Places API for address validation
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    // Mock address suggestions (in production, use Google Places API)
    const mockSuggestions = [
      {
        description: `${query} Main St, Newark, NJ`,
        place_id: '1',
        structured_formatting: {
          main_text: `${query} Main St`,
          secondary_text: 'Newark, NJ, USA'
        }
      },
      {
        description: `${query} Broad St, Newark, NJ`,
        place_id: '2',
        structured_formatting: {
          main_text: `${query} Broad St`,
          secondary_text: 'Newark, NJ, USA'
        }
      }
    ];
    
    setAddressSuggestions(mockSuggestions);
    setShowSuggestions(true);
  };

  const handleAddressSelect = (suggestion: any) => {
    const parts = suggestion.description.split(', ');
    const streetParts = parts[0].split(' ');
    const streetNumber = streetParts[0];
    const streetName = streetParts.slice(1).join(' ');
    
    setAddressDetails({
      streetNumber,
      streetName,
      city: parts[1] || 'Newark',
      state: 'NJ',
      zipCode: '07102',
      formatted: suggestion.description
    });
    setShowSuggestions(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedDate || selectedDate <= new Date()) {
      newErrors.scheduledTime = 'Please select a future pickup time';
    }
    
    if (!addressDetails.streetNumber) {
      newErrors.streetNumber = 'Street number is required';
    }
    
    if (!addressDetails.streetName) {
      newErrors.streetName = 'Street name is required';
    }
    
    if (!addressDetails.zipCode || !/^\d{5}(-\d{4})?$/.test(addressDetails.zipCode)) {
      newErrors.zipCode = 'Valid ZIP code is required';
    }
    
    if (!contactDetails.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!contactDetails.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!contactDetails.phone || !/^\(?[\d\s\-\(\)]{10,}$/.test(contactDetails.phone)) {
      newErrors.phone = 'Valid phone number is required';
    }
    
    if (contactDetails.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactDetails.email)) {
      newErrors.email = 'Valid email is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const pickupDetails: PickupDetails = {
        scheduledTime: selectedDate!.toISOString(),
        address: `${addressDetails.streetNumber} ${addressDetails.streetName}, ${addressDetails.city}, ${addressDetails.state} ${addressDetails.zipCode}`,
        contact: `${contactDetails.firstName} ${contactDetails.lastName} - ${contactDetails.phone}${contactDetails.email ? ` - ${contactDetails.email}` : ''}`,
        specialInstructions
      };
      
      onSubmit(pickupDetails);
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
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
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
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Modern Date & Time Picker */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">1</div>
              Pickup Schedule
            </h3>
            
            <FormField
              label="Pickup Date & Time"
              name="scheduledTime"
              error={errors.scheduledTime}
              required
              description={`Same-day cutoff: ${selectedRate.cutOffTime} ET`}
              icon={
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                </svg>
              }
            >
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={minDateTime}
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-200 
                    focus:outline-none focus:ring-0 focus:border-blue-500
                    ${errors.scheduledTime ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                  placeholderText="Select pickup date and time"
                  popperClassName="z-50"
                />
              </div>
            </FormField>
          </motion.section>

          {/* Enhanced Address Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">2</div>
              Pickup Address
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                label="Street Number"
                name="streetNumber"
                error={errors.streetNumber}
                required
                icon={
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
                  </svg>
                }
              >
                <Input
                  value={addressDetails.streetNumber}
                  onChange={(e) => setAddressDetails(prev => ({...prev, streetNumber: e.target.value}))}
                  placeholder="123"
                  error={!!errors.streetNumber}
                />
              </FormField>

              <FormField
                label="Street Name"
                name="streetName"
                error={errors.streetName}
                required
              >
                <div className="relative">
                  <Input
                    ref={addressInputRef}
                    value={addressDetails.streetName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAddressDetails(prev => ({...prev, streetName: value}));
                      searchAddresses(value);
                    }}
                    placeholder="Main Street"
                    error={!!errors.streetName}
                  />
                  
                  {/* Address Suggestions */}
                  <AnimatePresence>
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1"
                      >
                        {addressSuggestions.map((suggestion, index) => (
                          <motion.button
                            key={suggestion.place_id}
                            type="button"
                            onClick={() => handleAddressSelect(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                            whileHover={{ backgroundColor: '#f9fafb' }}
                          >
                            <div className="font-medium text-gray-900">
                              {suggestion.structured_formatting.main_text}
                            </div>
                            <div className="text-sm text-gray-600">
                              {suggestion.structured_formatting.secondary_text}
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FormField>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                label="City"
                name="city"
                required
              >
                <Input
                  value={addressDetails.city}
                  onChange={(e) => setAddressDetails(prev => ({...prev, city: e.target.value}))}
                  placeholder="Newark"
                />
              </FormField>

              <FormField
                label="State"
                name="state"
                required
              >
                <select
                  value={addressDetails.state}
                  onChange={(e) => setAddressDetails(prev => ({...prev, state: e.target.value}))}
                  className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-gray-300"
                >
                  <option value="NJ">New Jersey</option>
                  <option value="NY">New York</option>
                  <option value="PA">Pennsylvania</option>
                </select>
              </FormField>

              <FormField
                label="ZIP Code"
                name="zipCode"
                error={errors.zipCode}
                required
              >
                <Input
                  value={addressDetails.zipCode}
                  onChange={(e) => setAddressDetails(prev => ({...prev, zipCode: e.target.value}))}
                  placeholder="07102"
                  error={!!errors.zipCode}
                />
              </FormField>
            </div>
          </motion.section>

          {/* Enhanced Contact Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">3</div>
              Contact Information
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                name="firstName"
                error={errors.firstName}
                required
                icon={
                  <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                }
              >
                <Input
                  value={contactDetails.firstName}
                  onChange={(e) => setContactDetails(prev => ({...prev, firstName: e.target.value}))}
                  placeholder="John"
                  error={!!errors.firstName}
                />
              </FormField>

              <FormField
                label="Last Name"
                name="lastName"
                error={errors.lastName}
                required
              >
                <Input
                  value={contactDetails.lastName}
                  onChange={(e) => setContactDetails(prev => ({...prev, lastName: e.target.value}))}
                  placeholder="Doe"
                  error={!!errors.lastName}
                />
              </FormField>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                label="Phone Number"
                name="phone"
                error={errors.phone}
                required
                icon={
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                }
              >
                <Input
                  type="tel"
                  value={contactDetails.phone}
                  onChange={(e) => setContactDetails(prev => ({...prev, phone: e.target.value}))}
                  placeholder="(201) 555-0123"
                  error={!!errors.phone}
                />
              </FormField>

              <FormField
                label="Email Address"
                name="email"
                error={errors.email}
                description="Optional - for pickup notifications"
                icon={
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                }
              >
                <Input
                  type="email"
                  value={contactDetails.email}
                  onChange={(e) => setContactDetails(prev => ({...prev, email: e.target.value}))}
                  placeholder="john@example.com"
                  error={!!errors.email}
                />
              </FormField>
            </div>
          </motion.section>

          {/* Special Instructions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">4</div>
              Additional Details
            </h3>

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
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-200 
                  focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-gray-300
                  placeholder:text-gray-400 resize-none"
                placeholder="Access code: 1234, Building entrance on Main St side, Ring doorbell twice..."
              />
            </FormField>
          </motion.section>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
                  <li>• Pickup window is typically ±30 minutes from scheduled time</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
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
                    Proceed to Payment (${selectedRate.totalPrice.toFixed(2)})
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