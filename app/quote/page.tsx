// app/(pages)/quote/page.tsx
'use client';

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import QuoteForm from '../components/quote/QuoteForm';
import QuoteResults from '../components/quote/QuoteResults';
import PackagingSelector from '../components/quote/PackagingSelector';
import BookingForm, { PickupDetails } from '../components/booking/BookingForm';
import CheckoutForm from '../components/payment/CheckoutForm';
import { Rate, RateInput } from '../types/shipping';
import Breadcrumb, { QuoteProcessBreadcrumbs } from '../components/ui/Breadcrumb';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type FlowStep = 'quote' | 'results' | 'booking' | 'payment' | 'confirmation';

export default function QuotePage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('quote');
  const [quoteInput, setQuoteInput] = useState<RateInput | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [pickupDetails, setPickupDetails] = useState<PickupDetails | null>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New pricing-related state
  const [selectedPackaging, setSelectedPackaging] = useState<string[]>([]);
  const [paidOutsideUSA, setPaidOutsideUSA] = useState(false);
  const [showPackagingSelector, setShowPackagingSelector] = useState(false);

  const handleQuoteSubmit = async (input: RateInput) => {
    setLoading(true);
    setError(null);
    
    try {
      // Include packaging and payment location in request
      const enhancedInput = {
        ...input,
        packaging: selectedPackaging,
        paidOutsideUSA,
      };

      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedInput),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get rates');
      }

      setQuoteInput(input);
      setRates(data.rates);
      setQuoteId(data.quoteId);
      setCurrentStep('results');

    } catch (err) {
      console.error('Quote error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get rates');
    } finally {
      setLoading(false);
    }
  };

  const handlePackagingSelect = (packageSKUs: string[]) => {
    setSelectedPackaging(packageSKUs);
    setShowPackagingSelector(false);
    
    // Re-calculate rates with new packaging
    if (quoteInput) {
      handleQuoteSubmit(quoteInput);
    }
  };

  const handleAddPackaging = (rateId: string) => {
    setShowPackagingSelector(true);
  };

  const handleTogglePaidOutsideUSA = (enabled: boolean) => {
    setPaidOutsideUSA(enabled);
    
    // Re-calculate rates with new surcharge setting
    if (quoteInput) {
      handleQuoteSubmit(quoteInput);
    }
  };

  const handleRateSelect = (rate: any) => {
    setSelectedRate(rate);
    setCurrentStep('booking');
  };

  const handleBookingSubmit = (details: PickupDetails) => {
    setPickupDetails(details);
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = (bookingId: string) => {
    // Redirect to confirmation page
    window.location.href = `/booking/confirmation/${bookingId}`;
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const resetToQuote = () => {
    setCurrentStep('quote');
    setQuoteInput(null);
    setRates([]);
    setSelectedRate(null);
    setPickupDetails(null);
    setQuoteId(null);
    setError(null);
  };

  const goBackToResults = () => {
    setCurrentStep('results');
    setSelectedRate(null);
    setPickupDetails(null);
  };

  const goBackToBooking = () => {
    setCurrentStep('booking');
  };

  // Get current breadcrumb based on step
  const getCurrentBreadcrumbs = () => {
    switch (currentStep) {
      case 'quote':
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-5xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb 
            items={getCurrentBreadcrumbs()} 
            className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm"
          />
        </div>

        {/* Modern Progress Indicator */}
        <div className="mb-10">
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 rounded-full"
                  style={{ 
                    width: currentStep === 'quote' ? '0%' : 
                           currentStep === 'results' ? '50%' : '100%' 
                  }}
                />
              </div>
              
              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  currentStep === 'quote' ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                  'bg-green-600 text-white'
                }`}>
                  {currentStep === 'quote' ? '1' : '✓'}
                </div>
                <div className={`mt-3 text-center transition-colors duration-300 ${
                  currentStep === 'quote' ? 'text-blue-600' : 'text-green-600'
                }`}>
                  <div className="font-semibold text-sm">Get Quote</div>
                  <div className="text-xs text-gray-500 hidden sm:block">Enter shipment details</div>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  currentStep === 'results' ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                  ['booking', 'payment'].includes(currentStep) ? 'bg-green-600 text-white' :
                  'bg-white text-gray-400 border-2 border-gray-200'
                }`}>
                  {currentStep === 'results' ? '2' : 
                   ['booking', 'payment'].includes(currentStep) ? '✓' : '2'}
                </div>
                <div className={`mt-3 text-center transition-colors duration-300 ${
                  currentStep === 'results' ? 'text-blue-600' : 
                  ['booking', 'payment'].includes(currentStep) ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className="font-semibold text-sm">Select Rate</div>
                  <div className="text-xs text-gray-500 hidden sm:block">Choose your service</div>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  currentStep === 'booking' ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                  currentStep === 'payment' ? 'bg-green-600 text-white ring-4 ring-green-100' :
                  'bg-white text-gray-400 border-2 border-gray-200'
                }`}>
                  {['booking', 'payment'].includes(currentStep) ? 
                   (currentStep === 'payment' ? '✓' : '3') : '3'}
                </div>
                <div className={`mt-3 text-center transition-colors duration-300 ${
                  currentStep === 'booking' ? 'text-blue-600' :
                  currentStep === 'payment' ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className="font-semibold text-sm">Book & Pay</div>
                  <div className="text-xs text-gray-500 hidden sm:block">Complete booking</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Error Display */}
        {error && (
          <div className="mb-8 bg-red-50/80 backdrop-blur-lg border border-red-200 rounded-2xl p-6 shadow-lg animate-in slide-in-from-top duration-300">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline hover:no-underline transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 'quote' && (
          <QuoteForm 
            onSubmit={handleQuoteSubmit}
            error={error || undefined}
          />
        )}

        {currentStep === 'results' && (
          <QuoteResults 
            rates={rates}
            onBook={handleRateSelect}
            onNewQuote={resetToQuote}
            onAddPackaging={handleAddPackaging}
            paidOutsideUSA={paidOutsideUSA}
            onTogglePaidOutsideUSA={handleTogglePaidOutsideUSA}
          />
        )}

        {currentStep === 'booking' && selectedRate && (
          <BookingForm 
            selectedRate={selectedRate}
            onSubmit={handleBookingSubmit}
            onBack={goBackToResults}
          />
        )}

        {currentStep === 'payment' && selectedRate && pickupDetails && quoteId && (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              selectedRate={selectedRate}
              quoteId={quoteId}
              pickupDetails={pickupDetails}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
            <div className="mt-4 text-center">
              <button
                onClick={goBackToBooking}
                className="text-blue-500 hover:text-blue-700"
              >
                ← Back to Booking Details
              </button>
            </div>
          </Elements>
        )}

        {/* Packaging Selector Modal */}
        {showPackagingSelector && (
          <PackagingSelector
            onPackagingSelect={handlePackagingSelect}
            onClose={() => setShowPackagingSelector(false)}
            maxWeight={quoteInput?.pieces.reduce((max, piece) => Math.max(max, piece.weight), 0)}
            pieces={quoteInput?.pieces}
          />
        )}

        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 flex items-center space-x-4 shadow-2xl border border-white/20">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <div className="text-gray-800">
                <div className="font-semibold">Processing your request</div>
                <div className="text-sm text-gray-600">Getting the best rates for you...</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
