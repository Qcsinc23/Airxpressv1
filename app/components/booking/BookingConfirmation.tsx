// app/components/booking/BookingConfirmation.tsx
'use client';

import { useState, useEffect } from 'react';
import DocumentUpload from '../upload/DocumentUpload';

interface BookingData {
  id: string;
  status: string;
  trackingNumber: string;
  rate: {
    carrier: string;
    serviceLevel: string;
    departureAirport: string;
    arrivalAirport: string;
    totalPrice: number;
    transitTime: number;
  };
  pickupDetails: {
    scheduledTime: string;
    address: string;
    contact: string;
    specialInstructions?: string;
  };
  documents: Array<{
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  paymentIntentId: string;
  createdAt: string;
}

interface BookingConfirmationProps {
  bookingId: string;
  initialData?: BookingData;
  onDocumentUploaded?: (documentUrl: string, documentType: string) => void;
}

export default function BookingConfirmation({ 
  bookingId, 
  initialData, 
  onDocumentUploaded 
}: BookingConfirmationProps) {
  const [bookingData, setBookingData] = useState<BookingData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialData) {
      fetchBookingData();
    }
  }, [bookingId]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/booking?id=${bookingId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch booking data');
      }
      
      const data = await response.json();
      setBookingData(data);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploaded = (documentUrl: string, documentType: string) => {
    setUploadError(null);
    
    // Update local state
    if (bookingData) {
      setBookingData({
        ...bookingData,
        documents: [
          ...bookingData.documents,
          {
            type: documentType,
            url: documentUrl,
            uploadedAt: new Date().toISOString()
          }
        ]
      });
    }
    
    onDocumentUploaded?.(documentUrl, documentType);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'NEW': 'bg-blue-100 text-blue-800',
      'PAYMENT_CONFIRMED': 'bg-green-100 text-green-800',
      'PICKUP_SCHEDULED': 'bg-yellow-100 text-yellow-800',
      'TENDERED': 'bg-purple-100 text-purple-800',
      'IN_TRANSIT': 'bg-orange-100 text-orange-800',
      'ARRIVED': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error loading booking: {error}</p>
        <button 
          onClick={fetchBookingData}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="text-center py-8">
        <p>Booking not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Booking Confirmation Header */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <div className="text-center mb-6">
          <div className="text-green-600 mb-2">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">Your shipment has been successfully booked</p>
          
          {/* Next Steps CTA */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Complete Your Shipping Requirements</h3>
            <p className="text-blue-700 mb-4">
              To process your shipment, please complete the required documents and verification steps.
            </p>
            <a
              href="/dashboard/review"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Continue to Review Center
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Details */}
          <div>
            <h2 className="text-xl font-bold mb-4">Booking Details</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Booking ID:</strong> {bookingData.id}</div>
              <div><strong>Tracking Number:</strong> {bookingData.trackingNumber}</div>
              <div>
                <strong>Status:</strong>{' '}
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(bookingData.status)}`}>
                  {bookingData.status.replace('_', ' ')}
                </span>
              </div>
              <div><strong>Created:</strong> {new Date(bookingData.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Shipping Details */}
          <div>
            <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Carrier:</strong> {bookingData.rate.carrier}</div>
              <div><strong>Service:</strong> {bookingData.rate.serviceLevel}</div>
              <div><strong>Route:</strong> {bookingData.rate.departureAirport} → {bookingData.rate.arrivalAirport}</div>
              <div><strong>Transit Time:</strong> {bookingData.rate.transitTime} day{bookingData.rate.transitTime !== 1 ? 's' : ''}</div>
              <div><strong>Total Cost:</strong> <span className="font-bold text-lg">${bookingData.rate.totalPrice.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Pickup Details */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h2 className="text-xl font-bold mb-4">Pickup Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-2 text-sm">
              <div><strong>Scheduled Time:</strong> {new Date(bookingData.pickupDetails.scheduledTime).toLocaleString()}</div>
              <div><strong>Address:</strong> {bookingData.pickupDetails.address}</div>
              <div><strong>Contact:</strong> {bookingData.pickupDetails.contact}</div>
            </div>
          </div>
          {bookingData.pickupDetails.specialInstructions && (
            <div>
              <div><strong>Special Instructions:</strong></div>
              <p className="text-sm text-gray-600 mt-1">{bookingData.pickupDetails.specialInstructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Document Upload Section */}
      <div>
        <DocumentUpload
          bookingId={bookingData.id}
          onUploadSuccess={handleDocumentUploaded}
          onUploadError={handleUploadError}
        />
        
        {uploadError && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{uploadError}</p>
          </div>
        )}
      </div>

      {/* Uploaded Documents */}
      {bookingData.documents.length > 0 && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-xl font-bold mb-4">Uploaded Documents</h2>
          <div className="space-y-2">
            {bookingData.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">{doc.type.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-sm text-gray-600">
                    Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Document
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded px-6 py-4">
        <h3 className="font-bold text-blue-900 mb-2">What's Next?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your shipment is scheduled for pickup at the specified time</li>
          <li>• You'll receive email updates as your shipment progresses</li>
          <li>• Track your shipment anytime using tracking number: <strong>{bookingData.trackingNumber}</strong></li>
          <li>• Ensure all required documents are uploaded before pickup</li>
          <li>• Have your shipment ready and properly packaged for the pickup window</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={`/tracking/${bookingData.trackingNumber}`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-center"
        >
          Track Shipment
        </a>
        <a
          href="/dashboard"
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded text-center"
        >
          View Dashboard
        </a>
      </div>
    </div>
  );
}