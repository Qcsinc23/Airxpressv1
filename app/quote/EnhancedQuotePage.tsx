// app/quote/EnhancedQuotePage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import EnhancedQuoteForm from '../components/quote/EnhancedQuoteForm';
import QuoteResults from '../components/quote/QuoteResults';
import QuoteConfirmation from '../components/quote/QuoteConfirmation';
import PackagingSelector from '../components/quote/PackagingSelector';
import ModernBookingForm, { PickupDetails } from '../components/booking/ModernBookingForm';
import { Rate, RateInput } from '../types/shipping';
import Breadcrumb, { QuoteProcessBreadcrumbs } from '../components/ui/Breadcrumb';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type FlowStep = 'quote' | 'confirmation' | 'results' | 'booking' | 'payment';

export default function EnhancedQuotePage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('quote');
  const [quoteInput, setQuoteInput] = useState<RateInput | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [pickupDetails, setPickupDetails] = useState<PickupDetails | null>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackaging, setSelectedPackaging] = useState<string[]>([]);
  const [paidOutsideUSA, setPaidOutsideUSA] = useState(false);
  const [showPackagingSelector, setShowPackagingSelector] = useState(false);

  // Accessibility: Focus management
  useEffect(() => {
    const skipLink = document.querySelector('#skip-to-main');
    if (!skipLink) {
      const link = document.createElement('a');
      link.id = 'skip-to-main';
      link.href = '#main-content';
      link.textContent = 'Skip to main content';
      link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50';
      document.body.insertBefore(link, document.body.firstChild);
    }
  }, []);

  // Handle quote submission with enhanced error handling
  const handleQuoteSubmit = async (input: RateInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const enhancedInput = {
        ...input,
        packaging: selectedPackaging,
        paidOutsideUSA,
      };

      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enhancedInput),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      setQuoteInput(input);
      setRates(data.rates);
      setQuoteId(data.quoteId);
      setCurrentStep('results');

    } catch (err) {
      console.error('Quote error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePackagingSelect = (packageSKUs: string[]) => {
    setSelectedPackaging(packageSKUs);
    setShowPackagingSelector(false);
    
    if (quoteInput) {
      handleQuoteSubmit(quoteInput);
    }
  };

  const handleAddPackaging = (rateId: string) => {
    setShowPackagingSelector(true);
  };

  const handleTogglePaidOutsideUSA = (enabled: boolean) => {
    setPaidOutsideUSA(enabled);
    
    if (quoteInput) {
      handleQuoteSubmit(quoteInput);
    }
  };

  const handleRateSelect = (rate: any) => {
    setSelectedRate(rate);
    setCurrentStep('booking');
  };

  const handleBookingSubmit = async (details: PickupDetails) => {
    setPickupDetails(details);
    setLoading(true);
    setError(null);

    try {
      if (!quoteId) {
        throw new Error('Quote ID not found');
      }
      
      const isMockId = quoteId.startsWith('quote_');
      
      if (!isMockId) {
        try {
          await convex.mutation(api.functions.quotes.addPickupDetailsToQuote, {
            quoteId: quoteId as Id<'quotes'>,
            pickupDetails: details,
          });
        } catch (convexError) {
          console.error('Convex pickup details error:', convexError);
        }
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Server returned ${response.status}`);
      }

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received from server');
      }

    } catch (err) {
      console.error('Booking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const resetToQuote = () => {
    setCurrentStep('quote');
    setQuoteInput(null);
    setRates([]);
    setSelectedRate(null);
    setPickupDetails(null);
    setQuoteId(null);
    setError(null);
    setSelectedPackaging([]);
    setPaidOutsideUSA(false);
  };

  const goBackToResults = () => {
    setCurrentStep('results');
    setSelectedRate(null);
    setPickupDetails(null);
  };

  const goBackToBooking = () => {
    setCurrentStep('booking');
  };

  const skipToResults = () => {
    setCurrentStep('results');
  };

  // Get current breadcrumb based on step
  const getCurrentBreadcrumbs = () => {
    switch (currentStep) {
      case 'quote':
      case 'confirmation':
        return QuoteProcessBreadcrumbs.getQuote;
      case 'results':
        return QuoteProcessBreadcrumbs.selectRate;
      case 'booking':
      case 'payment':
        return QuoteProcessBreadcrumbs.bookAndPay;
      default:
        return QuoteProcessBreadcrumbs.getQuote;
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'quote':
      case 'confirmation':
        return 33;
      case 'results':
        return 66;
      case 'booking':
      case 'payment':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Accessibility: Skip link target */}
      <div id="skip-link-target" className="sr-only">Main content starts here</div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="relative max-w-5xl mx-auto px-4 py-8">
        {/* Accessibility: Main landmark */}
        <main id="main-content" role="main" aria-label="Shipping quote application">
          
          {/* Breadcrumb Navigation */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Breadcrumb 
              items={getCurrentBreadcrumbs()} 
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm"
            />
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0 rounded-full">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${getStepProgress()}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                
                {/* Steps */}
                {[
                  { step: 1, label: 'Get Quote', desc: 'Enter shipment details', active: ['quote', 'confirmation'] },
                  { step: 2, label: 'Select Rate', desc: 'Choose your service', active: ['results'] },
                  { step: 3, label: 'Book & Pay', desc: 'Complete booking', active: ['booking', 'payment'] }
                ].map(({ step, label, desc, active }) => {
                  const isActive = active.includes(currentStep);
                  const isCompleted = 
                    (step === 1 && ['results', 'booking', 'payment'].includes(currentStep)) ||
                    (step === 2 && ['booking', 'payment'].includes(currentStep));

                  return (
                    <div key={step} className="relative z-10 flex flex-col items-center">
                      <motion.div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                          isActive 
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                            : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-400 border-2 border-gray-200'
                        }`}
                        animate={{
                          scale: isActive ? [1, 1.1, 1] : 1,
                        }}
                        transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
                        role="progressbar"
                        aria-valuenow={isCompleted ? 100 : isActive ? 50 : 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Step ${step}: ${label}`}
                      >
                        {isCompleted ? '✓' : step}
                      </motion.div>
                      <div className={`mt-3 text-center transition-colors duration-300 ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        <div className="font-semibold text-sm">{label}</div>
                        <div className="text-xs text-gray-500 hidden sm:block">{desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="mb-8 bg-red-50/80 backdrop-blur-lg border border-red-200 rounded-2xl p-6 shadow-lg"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-start">
                  <motion.svg
                    className="w-6 h-6 text-red-600 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                  </motion.svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    <motion.button 
                      onClick={() => setError(null)}
                      className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline hover:no-underline transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Dismiss
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 'quote' && (
              <motion.div
                key="quote"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <EnhancedQuoteForm 
                  onSubmit={handleQuoteSubmit}
                  error={error || undefined}
                  loading={loading}
                />
              </motion.div>
            )}

            {currentStep === 'confirmation' && quoteInput && quoteId && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <QuoteConfirmation
                  quoteData={quoteInput}
                  quoteId={quoteId}
                  onNewQuote={resetToQuote}
                  onContinueBooking={skipToResults}
                />
              </motion.div>
            )}

            {currentStep === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
              >
                <QuoteResults 
                  rates={rates}
                  onBook={handleRateSelect}
                  onNewQuote={resetToQuote}
                  onAddPackaging={handleAddPackaging}
                  paidOutsideUSA={paidOutsideUSA}
                  onTogglePaidOutsideUSA={handleTogglePaidOutsideUSA}
                />
              </motion.div>
            )}

            {currentStep === 'booking' && selectedRate && (
              <motion.div
                key="booking"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.5 }}
              >
                <ModernBookingForm
                  selectedRate={selectedRate}
                  onSubmit={handleBookingSubmit}
                  onBack={goBackToResults}
                  loading={loading}
                />
              </motion.div>
            )}

            {currentStep === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg text-center"
              >
                <motion.div
                  className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  aria-label="Loading"
                />
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Redirecting to Payment</h2>
                <p className="text-gray-600 mb-6">
                  You'll be redirected to Stripe to complete your payment securely.
                </p>
                <motion.button
                  onClick={goBackToBooking}
                  className="text-blue-500 hover:text-blue-700 underline"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ← Back to Booking Details
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Packaging Selector Modal */}
          <AnimatePresence>
            {showPackagingSelector && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="packaging-selector-title"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <PackagingSelector
                    onPackagingSelect={handlePackagingSelect}
                    onClose={() => setShowPackagingSelector(false)}
                    maxWeight={quoteInput?.pieces.reduce((max, piece) => Math.max(max, piece.weight), 0)}
                    pieces={quoteInput?.pieces}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40"
                role="dialog"
                aria-modal="true"
                aria-labelledby="loading-title"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 flex items-center space-x-4 shadow-2xl border border-white/20 max-w-md"
                >
                  <div className="relative">
                    <motion.div
                      className="w-10 h-10 border-4 border-blue-200 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute top-0 left-0 w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <div className="text-gray-800">
                    <div id="loading-title" className="font-semibold">Processing your request</div>
                    <div className="text-sm text-gray-600">
                      {currentStep === 'booking' ? 'Setting up your checkout...' : 'Getting the best rates for you...'}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}