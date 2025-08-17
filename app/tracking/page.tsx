// app/tracking/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/ui/Header';

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
    <div className="min-h-screen">
      {/* Header - consistent with all other pages */}
      <Header />

      {/* Content Container - exact same structure as homepage/store */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Elements - identical to homepage */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header - same styling as other pages */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-8 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Track Your Shipment
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              Enter your tracking number to get real-time updates and detailed information about your package's journey to the Caribbean.
            </p>
          </div>

          {/* Search Form - using exact card design pattern */}
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 mb-16">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="trackingNumber" 
                  className="block text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4"
                >
                  Enter Tracking Number
                </label>
                <div className="relative">
                  <input
                    id="trackingNumber"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g., AX-TRK-001234"
                    className="w-full px-6 py-4 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-mono text-center"
                    disabled={isLoading}
                  />
                  {trackingNumber && (
                    <button
                      type="button"
                      onClick={() => setTrackingNumber('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!trackingNumber.trim() || isLoading}
                className={`w-full py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform transition-all duration-200 ${
                  isLoading || !trackingNumber.trim()
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Track My Shipment
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Sample Tracking Numbers - using feature card design */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Try Sample Tracking Numbers
              </span>
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Test our tracking system with these sample shipments
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { number: 'AX-TRK-001', status: 'Delivered', flag: '🇬🇾', destination: 'Georgetown' },
                { number: 'AX-TRK-002', status: 'In Transit', flag: '🇹🇹', destination: 'Port of Spain' },
                { number: 'CAL123456789', status: 'Departed Origin', flag: '🇯🇲', destination: 'Kingston' },
                { number: 'DL987654321', status: 'Out for Delivery', flag: '🇧🇧', destination: 'Bridgetown' },
              ].map((sample) => (
                <div 
                  key={sample.number}
                  onClick={() => setTrackingNumber(sample.number)}
                  className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{sample.flag}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg font-mono">{sample.number}</h3>
                  <p className="text-sm text-gray-600 font-medium">{sample.destination}</p>
                  <p className="text-xs text-gray-500 mt-1">{sample.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Help Section - using feature card design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Email Notifications
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Tracking numbers are sent via email when your shipment is booked and at every status update.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Real-Time Updates
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Track your shipment every step of the way with live status updates within 1 hour of changes.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Support Available
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Contact support at <span className="font-semibold text-blue-600">(201) 555-0100</span> if you need assistance.
              </p>
            </div>
          </div>

          {/* Call to Action Section - same as homepage CTA */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
            {/* Background Pattern - identical to homepage */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              
              <h2 className="text-4xl font-bold mb-4">
                Need to Ship Something?
              </h2>
              <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                Get your instant quote and book your shipment to the Caribbean. Fast, reliable, and affordable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/quote"
                  className="inline-flex items-center bg-white hover:bg-gray-100 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get Quote
                </a>
                <a
                  href="/dashboard"
                  className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 transform"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Dashboard
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}