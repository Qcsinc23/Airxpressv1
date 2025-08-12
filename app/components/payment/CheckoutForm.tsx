// app/components/payment/CheckoutForm.tsx
'use client';

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Rate } from '../../types/shipping';

interface CheckoutFormProps {
  selectedRate: Rate;
  quoteId: string;
  pickupDetails: {
    scheduledTime: string;
    address: string;
    contact: string;
    specialInstructions?: string;
  };
  onSuccess: (bookingId: string) => void;
  onError: (error: string) => void;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
  },
};

export default function CheckoutForm({ 
  selectedRate, 
  quoteId, 
  pickupDetails, 
  onSuccess, 
  onError 
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError('Card element not found');
      setLoading(false);
      return;
    }

    try {
      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: pickupDetails.contact,
        },
      });

      if (pmError) {
        setPaymentError(pmError.message || 'Payment method creation failed');
        setLoading(false);
        return;
      }

      // Create booking with payment
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId,
          pickupDetails,
          paymentMethodId: paymentMethod.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Booking creation failed');
      }

      if (result.requires_action) {
        // Handle 3D Secure authentication
        const { error: confirmError } = await stripe.confirmCardPayment(
          result.payment_intent.client_secret
        );

        if (confirmError) {
          setPaymentError(confirmError.message || 'Payment confirmation failed');
        } else {
          onSuccess(result.bookingId || 'pending');
        }
      } else if (result.success) {
        onSuccess(result.bookingId || 'completed');
      } else {
        setPaymentError('Payment processing failed');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentError(error instanceof Error ? error.message : 'An unexpected error occurred');
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">Complete Your Booking</h2>
      
      {/* Booking Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-bold mb-2">Booking Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Service:</div>
            <div>{selectedRate.carrier} - {selectedRate.serviceLevel}</div>
          </div>
          <div>
            <div className="font-medium">Route:</div>
            <div>{selectedRate.departureAirport} → {selectedRate.arrivalAirport}</div>
          </div>
          <div>
            <div className="font-medium">Transit Time:</div>
            <div>{selectedRate.transitTime} day{selectedRate.transitTime !== 1 ? 's' : ''}</div>
          </div>
          <div>
            <div className="font-medium">Total Cost:</div>
            <div className="text-lg font-bold text-blue-600">${selectedRate.totalPrice.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Pickup Details */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-bold mb-2">Pickup Details</h3>
        <div className="text-sm">
          <div><strong>Scheduled:</strong> {new Date(pickupDetails.scheduledTime).toLocaleString()}</div>
          <div><strong>Address:</strong> {pickupDetails.address}</div>
          <div><strong>Contact:</strong> {pickupDetails.contact}</div>
          {pickupDetails.specialInstructions && (
            <div><strong>Instructions:</strong> {pickupDetails.specialInstructions}</div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Payment Method
          </label>
          <div className="p-3 border rounded focus-within:border-blue-500">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {paymentError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>{paymentError}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Your payment is secured by Stripe
          </div>
          <button
            type="submit"
            disabled={!stripe || loading}
            className={`font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${
              loading || !stripe
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? 'Processing...' : `Pay $${selectedRate.totalPrice.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}