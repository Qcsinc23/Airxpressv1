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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-3xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb 
            items={TrackingProcessBreadcrumbs.search} 
            className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Track Your Shipment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your tracking number to get real-time updates and detailed information about your package's journey.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="trackingNumber" 
                className="flex items-center text-sm font-semibold text-gray-700 mb-3"
              >
                <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
                </svg>
                Tracking Number
              </label>
              <div className="relative">
                <input
                  id="trackingNumber"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter your tracking number (e.g., AX-TRK-001)"
                  className="w-full px-4 py-4 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-lg font-mono"
                  disabled={isLoading}
                />
                {trackingNumber && (
                  <button
                    type="button"
                    onClick={() => setTrackingNumber('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                </svg>
                Your tracking number was provided in your booking confirmation email.
              </p>
            </div>

            <button
              type="submit"
              disabled={!trackingNumber.trim() || isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/30"></div>
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <span className="ml-3">Searching for your shipment...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  Track My Shipment
                </span>
              )}
            </button>
          </form>

          {/* Sample Tracking Numbers */}
          <div className="mt-8 pt-8 border-t border-gray-200/50">
            <div className="flex items-center mb-4">
              <svg className="w-4 h-4 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <h3 className="text-sm font-semibold text-gray-700">Try a sample tracking number:</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { number: 'AX-TRK-001', status: 'Delivered' },
                { number: 'AX-TRK-002', status: 'In Transit' }, 
                { number: 'CAL123456789', status: 'Departed Origin' },
                { number: 'DL987654321', status: 'Out for Delivery' },
              ].map((sample) => (
                <button
                  key={sample.number}
                  onClick={() => setTrackingNumber(sample.number)}
                  className="group p-4 bg-gradient-to-r from-white/60 to-white/40 border border-gray-200 rounded-xl hover:from-white/80 hover:to-white/60 hover:border-indigo-200 transition-all duration-200 text-left"
                >
                  <div className="font-mono text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {sample.number}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{sample.status}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-lg border border-indigo-200/50 rounded-2xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-indigo-900">Need Help?</h3>
          </div>
          <div className="space-y-3 text-sm text-indigo-800">
            <div className="flex items-start">
              <svg className="w-4 h-4 mt-0.5 mr-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <span>Tracking numbers are sent via email when your shipment is booked</span>
            </div>
            <div className="flex items-start">
              <svg className="w-4 h-4 mt-0.5 mr-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
              </svg>
              <span>Real-time updates are available within 1 hour of status changes</span>
            </div>
            <div className="flex items-start">
              <svg className="w-4 h-4 mt-0.5 mr-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              <span>Contact support at <a href="tel:(201)555-0100" className="font-semibold hover:underline">(201) 555-0100</a> if you need assistance</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/quote"
            className="group bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-900 px-8 py-4 rounded-xl font-semibold text-center border border-white/20 hover:border-indigo-200 transition-all duration-200 hover:scale-[1.02] transform"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              Ship New Package
            </span>
          </a>
          <a 
            href="/dashboard"
            className="group bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-900 px-8 py-4 rounded-xl font-semibold text-center border border-white/20 hover:border-purple-200 transition-all duration-200 hover:scale-[1.02] transform"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 text-purple-500 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              View Dashboard
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
