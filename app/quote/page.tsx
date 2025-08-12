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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep === 'quote' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                currentStep === 'quote' ? 'border-blue-600 bg-blue-600 text-white' : 'border-green-600 bg-green-600 text-white'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Get Quote</span>
            </div>
            
            <div className={`h-1 w-16 ${['results', 'booking', 'payment'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center ${
              currentStep === 'results' ? 'text-blue-600' : 
              ['booking', 'payment'].includes(currentStep) ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                currentStep === 'results' ? 'border-blue-600 bg-blue-600 text-white' :
                ['booking', 'payment'].includes(currentStep) ? 'border-green-600 bg-green-600 text-white' :
                'border-gray-300 bg-white text-gray-400'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Select Rate</span>
            </div>
            
            <div className={`h-1 w-16 ${['booking', 'payment'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center ${
              currentStep === 'booking' ? 'text-blue-600' :
              currentStep === 'payment' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                currentStep === 'booking' ? 'border-blue-600 bg-blue-600 text-white' :
                currentStep === 'payment' ? 'border-green-600 bg-green-600 text-white' :
                'border-gray-300 bg-white text-gray-400'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Book & Pay</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>Processing your request...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}