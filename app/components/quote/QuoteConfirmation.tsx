// app/components/quote/QuoteConfirmation.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RateInput } from '../../types/shipping';

interface QuoteConfirmationProps {
  quoteData: RateInput;
  quoteId: string;
  onNewQuote: () => void;
  onContinueBooking?: () => void;
}

const COUNTRY_INFO = {
  'Guyana': {
    flag: '🇬🇾',
    airport: 'GEO',
    fullName: 'Georgetown, Guyana',
    timezone: 'GMT-4',
    currency: 'GYD'
  },
  'Trinidad': {
    flag: '🇹🇹',
    airport: 'POS',
    fullName: 'Port of Spain, Trinidad and Tobago',
    timezone: 'GMT-4',
    currency: 'TTD'
  },
  'Jamaica': {
    flag: '🇯🇲',
    airport: 'KIN',
    fullName: 'Kingston, Jamaica',
    timezone: 'GMT-5',
    currency: 'JMD'
  },
  'Barbados': {
    flag: '🇧🇧',
    airport: 'BGI',
    fullName: 'Bridgetown, Barbados',
    timezone: 'GMT-4',
    currency: 'BBD'
  },
  'Puerto Rico': {
    flag: '🇵🇷',
    airport: 'SJU',
    fullName: 'San Juan, Puerto Rico',
    timezone: 'GMT-4',
    currency: 'USD'
  }
};

export default function QuoteConfirmation({
  quoteData,
  quoteId,
  onNewQuote,
  onContinueBooking
}: QuoteConfirmationProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const destInfo = COUNTRY_INFO[quoteData.destCountry as keyof typeof COUNTRY_INFO];
  const totalWeight = quoteData.pieces.reduce((sum, piece) => sum + piece.weight, 0);
  const totalPackages = quoteData.pieces.length;

  // Accessibility: Announce success to screen readers
  useEffect(() => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Quote successfully created with ID ${quoteId}. Your shipping quote from ${quoteData.originZip} to ${quoteData.destCountry} has been generated.`;
    document.body.appendChild(announcement);

    const timer = setTimeout(() => {
      document.body.removeChild(announcement);
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    };
  }, [quoteId, quoteData.originZip, quoteData.destCountry]);

  const copyQuoteId = async () => {
    try {
      await navigator.clipboard.writeText(quoteId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy quote ID:', err);
    }
  };

  const shareQuote = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AirXpress Shipping Quote',
          text: `My shipping quote from ${quoteData.originZip} to ${quoteData.destCountry}`,
          url: `${window.location.origin}/quote?id=${quoteId}`
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    }
  };

  return (
    <div 
      className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
      role="main"
      aria-labelledby="quote-confirmation-title"
    >
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
          className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 mx-auto"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h1 id="quote-confirmation-title" className="text-3xl font-bold mb-2">
            Quote Created Successfully!
          </h1>
          <p className="text-green-100 text-lg">
            Your shipping quote is ready for review
          </p>
        </motion.div>
      </div>

      <div className="p-8">
        {/* Quote Reference */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
          aria-labelledby="quote-reference-title"
        >
          <h2 id="quote-reference-title" className="text-lg font-semibold text-gray-900 mb-4">
            Quote Reference
          </h2>
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Quote ID</div>
              <div className="font-mono text-lg font-semibold text-gray-900" role="text" tabIndex={0}>
                {quoteId}
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={copyQuoteId}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied 
                    ? 'bg-green-100 text-green-700 border-green-300' 
                    : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
                } border`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-describedby="copy-feedback"
              >
                {copied ? '✓ Copied!' : 'Copy ID'}
              </motion.button>
              <div id="copy-feedback" className="sr-only" aria-live="polite">
                {copied ? 'Quote ID copied to clipboard' : ''}
              </div>
              
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <motion.button
                  onClick={shareQuote}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Share quote"
                >
                  Share
                </motion.button>
              )}
            </div>
          </div>
        </motion.section>

        {/* Shipment Summary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
          aria-labelledby="shipment-summary-title"
        >
          <h2 id="shipment-summary-title" className="text-lg font-semibold text-gray-900 mb-4">
            Shipment Summary
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Origin & Destination */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
                Route Details
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-blue-700">From</div>
                  <div className="font-semibold text-blue-900">
                    {quoteData.originZip}, New Jersey, USA 🇺🇸
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <motion.svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </motion.svg>
                </div>
                <div>
                  <div className="text-sm text-blue-700">To</div>
                  <div className="font-semibold text-blue-900">
                    {destInfo?.flag} {destInfo?.fullName || quoteData.destCountry}
                    {quoteData.destCity && (
                      <div className="text-sm font-normal">{quoteData.destCity}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Package Info */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="font-semibold text-purple-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                Package Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-700">Total Packages:</span>
                  <span className="font-semibold text-purple-900">{totalPackages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Total Weight:</span>
                  <span className="font-semibold text-purple-900">
                    {totalWeight.toFixed(1)} lbs ({(totalWeight * 0.453592).toFixed(1)} kg)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Service Level:</span>
                  <span className="font-semibold text-purple-900 flex items-center">
                    {quoteData.serviceLevel === 'EXPRESS' && '✈️ Express'}
                    {quoteData.serviceLevel === 'STANDARD' && '🚛 Standard'}
                    {quoteData.serviceLevel === 'NFO' && '🚀 Next Flight Out'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Package Details */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            aria-expanded={showDetails}
            aria-controls="package-details"
          >
            <span className="font-semibold text-gray-900">Package Details</span>
            <motion.svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: showDetails ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </motion.svg>
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                id="package-details"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  {quoteData.pieces.map((piece, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          Package {index + 1}
                        </span>
                        <span className="text-sm text-gray-600">
                          {piece.type === 'box' ? '📦 Box' : '🛢️ Barrel'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Weight:</span>
                          <span className="ml-2 font-medium">{piece.weight} lbs</span>
                        </div>
                        {piece.dimensions && (
                          <div>
                            <span className="text-gray-600">Dimensions:</span>
                            <span className="ml-2 font-medium">
                              {piece.dimensions.length}" × {piece.dimensions.width}" × {piece.dimensions.height}"
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Next Steps */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mb-8"
          aria-labelledby="next-steps-title"
        >
          <h2 id="next-steps-title" className="text-lg font-semibold text-gray-900 mb-4">
            What's Next?
          </h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Review Rate Options</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    Compare different carriers and service levels to find the best option for your needs.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Book Your Shipment</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    Schedule pickup, provide delivery details, and complete your booking.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Track Your Package</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    Monitor your shipment's progress with real-time tracking updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            onClick={onNewQuote}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors border border-gray-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Get New Quote
            </span>
          </motion.button>
          
          {onContinueBooking && (
            <motion.button
              onClick={onContinueBooking}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
                Continue to Booking
              </span>
            </motion.button>
          )}
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl"
          role="note"
        >
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
            </svg>
            <div>
              <h3 className="font-semibold text-amber-800">Important Information</h3>
              <p className="text-amber-700 text-sm mt-1">
                This quote is valid for 24 hours. Rates may change due to fuel surcharges, seasonal demand, 
                or carrier updates. Save your quote ID for easy reference when booking.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}