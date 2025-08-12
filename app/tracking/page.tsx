// app/tracking/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb, { TrackingProcessBreadcrumbs } from '../components/ui/Breadcrumb';

export default function TrackingSearchPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      return;
    }

    setIsLoading(true);
    
    // Redirect to tracking results page
    router.push(`/tracking/${encodeURIComponent(trackingNumber.trim())}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          items={TrackingProcessBreadcrumbs.search} 
          className="mb-6"
        />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Shipment</h1>
          <p className="text-gray-600">
            Enter your tracking number to get real-time updates on your package.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label 
                htmlFor="trackingNumber" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tracking Number
              </label>
              <input
                id="trackingNumber"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (e.g., AX-TRK-001)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Your tracking number was provided in your booking confirmation email.
              </p>
            </div>

            <button
              type="submit"
              disabled={!trackingNumber.trim() || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </div>
              ) : (
                'Track Shipment'
              )}
            </button>
          </form>

          {/* Sample Tracking Numbers */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Try a sample tracking number:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'AX-TRK-001',
                'AX-TRK-002', 
                'CAL123456789',
                'DL987654321',
              ].map((sampleNumber) => (
                <button
                  key={sampleNumber}
                  onClick={() => setTrackingNumber(sampleNumber)}
                  className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-mono"
                >
                  {sampleNumber}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Tracking numbers are sent via email when your shipment is booked</p>
            <p>• Updates are available within 1 hour of status changes</p>
            <p>• Contact support at <a href="tel:(201)555-0100" className="font-medium">(201) 555-0100</a> if you need assistance</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/quote"
            className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-lg font-medium text-center border border-gray-300"
          >
            Ship New Package
          </a>
          <a 
            href="/dashboard"
            className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-lg font-medium text-center border border-gray-300"
          >
            View Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
