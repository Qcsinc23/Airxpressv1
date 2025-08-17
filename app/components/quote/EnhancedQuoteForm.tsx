// app/components/quote/EnhancedQuoteForm.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormField, Input, Select, RadioGroup } from '../ui/FormField';
import { useQuoteForm } from '../../lib/hooks/useQuoteForm';
import { RateInput } from '../../types/shipping';
import { QuoteRequest } from '../../lib/validation/schemas';

interface EnhancedQuoteFormProps {
  onSubmit: (input: RateInput) => void;
  error?: string;
  loading?: boolean;
  defaultValues?: Partial<QuoteRequest>;
}

const COUNTRIES = [
  { value: 'Guyana', label: '🇬🇾 Guyana', airport: 'GEO' },
  { value: 'Trinidad', label: '🇹🇹 Trinidad and Tobago', airport: 'POS' },
  { value: 'Jamaica', label: '🇯🇲 Jamaica', airport: 'KIN' },
  { value: 'Barbados', label: '🇧🇧 Barbados', airport: 'BGI' },
  { value: 'Puerto Rico', label: '🇵🇷 Puerto Rico', airport: 'SJU' },
];

const SERVICE_LEVELS = [
  { value: 'STANDARD', label: 'Standard', description: 'Most economical', icon: '🚛' },
  { value: 'EXPRESS', label: 'Express', description: 'Faster delivery', icon: '✈️' },
  { value: 'NFO', label: 'Next Flight Out', description: 'Fastest option', icon: '🚀' }
];

export default function EnhancedQuoteForm({ 
  onSubmit, 
  error, 
  loading = false, 
  defaultValues 
}: EnhancedQuoteFormProps) {
  const [realTimePricing, setRealTimePricing] = useState<any>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const {
    form,
    shouldShowStep,
    isAutoSaving,
    lastSaved,
    addPiece,
    removePiece,
    updatePiece,
    convertToRateInput,
    getFieldError,
    getFieldWarning,
    getCompletionPercentage,
    isValid,
  } = useQuoteForm({
    defaultValues,
    autoSave: true,
    onAutoSave: (data) => {
      console.log('Auto-saving form data...', data);
    },
  });

  const pieces = form.watch('pieces') || [];
  const originZip = form.watch('originZip');
  const destCountry = form.watch('destCountry');
  const serviceLevel = form.watch('serviceLevel');
  const afterHours = form.watch('afterHours');
  const isPersonalEffects = form.watch('isPersonalEffects');
  const completionPercentage = getCompletionPercentage();

  const handleSubmit = form.handleSubmit((data) => {
    const rateInput = convertToRateInput(data);
    onSubmit(rateInput);
  });

  return (
    <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Get Your Quote</h2>
            <p className="text-blue-100">Fast, reliable shipping to the Caribbean</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Completion</div>
            <div className="text-2xl font-bold">{completionPercentage}%</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-blue-500/30 rounded-full h-2">
          <motion.div
            className="bg-white h-2 rounded-full shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        {/* Auto-save indicator */}
        <AnimatePresence>
          {isAutoSaving && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center mt-2 text-sm text-blue-100"
            >
              <motion.div
                className="w-3 h-3 bg-white rounded-full mr-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              Auto-saving...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg"
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Origin & Destination */}
        <motion.section
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center mb-6">
            <motion.div
              className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              1
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900">Where are you shipping?</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              label="Pickup ZIP Code"
              name="originZip"
              error={getFieldError('originZip')}
              warning={getFieldWarning('originZip', originZip)}
              required
              icon={
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              }
              description="Must be in New Jersey"
            >
              <Input
                {...form.register('originZip')}
                placeholder="Enter NJ ZIP code"
                error={!!getFieldError('originZip')}
                warning={!!getFieldWarning('originZip', originZip)}
                maxLength={10}
              />
            </FormField>

            <FormField
              label="Destination Country"
              name="destCountry"
              error={getFieldError('destCountry')}
              required
              icon={
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
                </svg>
              }
            >
              <Select
                {...form.register('destCountry')}
                error={!!getFieldError('destCountry')}
              >
                <option value="">Select destination country</option>
                {COUNTRIES.map(country => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField
            label="Destination City"
            name="destCity"
            description="Optional but helps with delivery"
          >
            <Input
              {...form.register('destCity')}
              placeholder="Georgetown, Port of Spain, Kingston..."
            />
          </FormField>
        </motion.section>

        {/* Step 2: Service Level */}
        <AnimatePresence>
          {shouldShowStep(1) && (
            <motion.section
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Choose your service level</h3>
              </div>

              <FormField
                label="Service Level"
                name="serviceLevel"
                error={getFieldError('serviceLevel')}
                required
              >
                <RadioGroup
                  name="serviceLevel"
                  value={serviceLevel || ''}
                  options={SERVICE_LEVELS}
                  onChange={(value) => form.setValue('serviceLevel', value as any)}
                  error={!!getFieldError('serviceLevel')}
                />
              </FormField>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Step 3: Package Details */}
        <AnimatePresence>
          {shouldShowStep(2) && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Package details</h3>
                </div>
                <div className="text-sm text-gray-600">
                  {pieces.length} {pieces.length === 1 ? 'package' : 'packages'}
                </div>
              </div>

              <div className="space-y-4">
                {pieces.map((piece, index) => (
                  <motion.div
                    key={index}
                    data-package-index={index}
                    className="bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                          {index + 1}
                        </div>
                        <h4 className="font-semibold text-gray-900">Package {index + 1}</h4>
                      </div>
                      {pieces.length > 1 && (
                        <motion.button
                          type="button"
                          onClick={() => removePiece(index)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                          </svg>
                        </motion.button>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField label="Package Type" name={`pieces.${index}.type`}>
                        <Select
                          value={piece.type}
                          onChange={(e) => updatePiece(index, { type: e.target.value })}
                        >
                          <option value="box">📦 Box/Carton</option>
                          <option value="barrel">🛢️ Barrel</option>
                        </Select>
                      </FormField>
                      
                      <FormField 
                        label="Weight (lbs)" 
                        name={`pieces.${index}.weight`}
                        error={getFieldError(`pieces.${index}.weight` as any)}
                        required
                      >
                        <Input
                          type="number"
                          value={piece.weight}
                          onChange={(e) => updatePiece(index, { weight: parseFloat(e.target.value) || 0 })}
                          placeholder="Enter weight"
                          min="0.1"
                          step="0.1"
                          error={!!getFieldError(`pieces.${index}.weight` as any)}
                        />
                      </FormField>
                    </div>
                    
                    <div className="mt-4">
                      <FormField 
                        label="Dimensions (inches)" 
                        name={`pieces.${index}.dimensions`}
                        description="Optional - helps with accuracy"
                      >
                        <div className="grid grid-cols-3 gap-3">
                          <Input
                            type="number"
                            value={piece.dimensions?.length || ''}
                            onChange={(e) => updatePiece(index, {
                              dimensions: {
                                ...piece.dimensions,
                                length: parseFloat(e.target.value) || 0
                              }
                            })}
                            placeholder="Length"
                            min="0"
                            step="0.1"
                          />
                          <Input
                            type="number"
                            value={piece.dimensions?.width || ''}
                            onChange={(e) => updatePiece(index, {
                              dimensions: {
                                ...piece.dimensions,
                                width: parseFloat(e.target.value) || 0
                              }
                            })}
                            placeholder="Width"
                            min="0"
                            step="0.1"
                          />
                          <Input
                            type="number"
                            value={piece.dimensions?.height || ''}
                            onChange={(e) => updatePiece(index, {
                              dimensions: {
                                ...piece.dimensions,
                                height: parseFloat(e.target.value) || 0
                              }
                            })}
                            placeholder="Height"
                            min="0"
                            step="0.1"
                          />
                        </div>
                      </FormField>
                    </div>
                  </motion.div>
                ))}
                
                <motion.button
                  type="button"
                  onClick={addPiece}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-200 flex items-center justify-center font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Add Another Package
                </motion.button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Step 4: Additional Options */}
        <AnimatePresence>
          {shouldShowStep(3) && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  4
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Additional options</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.label
                  className="flex items-start cursor-pointer group p-4 bg-white/60 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative flex items-center mr-4">
                    <input
                      {...form.register('afterHours')}
                      type="checkbox"
                      className="peer sr-only"
                    />
                    <motion.div
                      className="w-6 h-6 bg-white border-2 border-gray-300 rounded peer-checked:border-blue-500 peer-checked:bg-blue-500 flex items-center justify-center"
                      animate={{
                        backgroundColor: afterHours ? '#3b82f6' : '#ffffff',
                        borderColor: afterHours ? '#3b82f6' : '#d1d5db'
                      }}
                    >
                      <motion.svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        initial={{ scale: 0 }}
                        animate={{ scale: afterHours ? 1 : 0 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </motion.svg>
                    </motion.div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">After-hours pickup</span>
                    <p className="text-sm text-gray-500 mt-1">Available between 4:00 PM - 8:00 AM</p>
                  </div>
                </motion.label>

                <motion.label
                  className="flex items-start cursor-pointer group p-4 bg-white/60 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative flex items-center mr-4">
                    <input
                      {...form.register('isPersonalEffects')}
                      type="checkbox"
                      className="peer sr-only"
                    />
                    <motion.div
                      className="w-6 h-6 bg-white border-2 border-gray-300 rounded peer-checked:border-blue-500 peer-checked:bg-blue-500 flex items-center justify-center"
                      animate={{
                        backgroundColor: isPersonalEffects ? '#3b82f6' : '#ffffff',
                        borderColor: isPersonalEffects ? '#3b82f6' : '#d1d5db'
                      }}
                    >
                      <motion.svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        initial={{ scale: 0 }}
                        animate={{ scale: isPersonalEffects ? 1 : 0 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </motion.svg>
                    </motion.div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Personal effects shipment</span>
                    <p className="text-sm text-gray-500 mt-1">Barrel shipment to Guyana with special rates</p>
                  </div>
                </motion.label>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.div
          className="pt-6 border-t border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            type="submit"
            disabled={loading || !isValid}
            className={`w-full py-4 px-8 rounded-xl font-semibold text-white transition-all duration-300 ${
              loading || !isValid
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
            whileHover={!loading && isValid ? { scale: 1.02, y: -2 } : {}}
            whileTap={!loading && isValid ? { scale: 0.98 } : {}}
          >
            <span className="flex items-center justify-center">
              {loading ? (
                <motion.div
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              )}
              {loading ? 'Getting Your Quote...' : 'Get Instant Quote'}
            </span>
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}