// app/tracking/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/ui/Header';

interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

interface TrackingData {
  trackingId: string;
  status: string;
  carrier: string;
  service: string;
  origin: { code: string; name: string };
  destination: { code: string; name: string };
  events: TrackingEvent[];
  estimatedDelivery: string;
  references: {
    bookingReference: string;
    airWaybill: string;
  };
}

export default function TrackingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTrackingData();
    }
  }, [id]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/tracking/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Tracking information not found');
      }
      
      setTrackingData(data.tracking);
    } catch (err) {
      console.error('Tracking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'BOOKING_CREATED': 'from-blue-500 to-blue-600',
      'PICKUP_COMPLETED': 'from-yellow-500 to-orange-500',
      'TENDERED_TO_CARRIER': 'from-purple-500 to-indigo-600',
      'DEPARTED_ORIGIN': 'from-orange-500 to-red-500',
      'IN_TRANSIT': 'from-orange-500 to-red-500',
      'ARRIVED': 'from-green-500 to-emerald-600',
      'DELIVERED': 'from-green-500 to-emerald-600',
    };
    return colors[status as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getProgressPercentage = (status: string) => {
    const statusSteps = {
      'BOOKING_CREATED': 15,
      'PICKUP_COMPLETED': 30,
      'TENDERED_TO_CARRIER': 50,
      'DEPARTED_ORIGIN': 70,
      'IN_TRANSIT': 85,
      'ARRIVED': 95,
      'DELIVERED': 100,
    };
    return statusSteps[status as keyof typeof statusSteps] || 0;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          </div>
          <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Loading Tracking Information
              </h3>
              <p className="text-gray-600">Please wait while we fetch your shipment details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          </div>
          <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                Tracking Information Not Found
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={fetchTrackingData}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform transition-all duration-200 hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </span>
                </button>
                <a 
                  href="/tracking"
                  className="bg-white/80 backdrop-blur-lg border border-white/20 hover:bg-white/90 text-gray-900 px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 transform shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Another Shipment
                  </span>
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return null;
  }

  const currentProgress = getProgressPercentage(trackingData.status);
  const latestEvent = trackingData.events[trackingData.events.length - 1];

  return (
    <div className="min-h-screen">
      {/* Header - consistent with all pages */}
      <Header />

      {/* Content Container - exact same structure as other pages */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Elements - identical to homepage */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Shipment Tracking
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Real-time tracking information for shipment {trackingData.trackingId}
            </p>
          </div>

          {/* Status Overview - using exact card design */}
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 mb-8">
            <div className={`w-16 h-16 bg-gradient-to-r ${getStatusColor(trackingData.status)} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              {trackingData.status.replace('_', ' ')}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {latestEvent.description}
            </p>
            <p className="text-sm text-gray-500 font-mono">
              {trackingData.trackingId}
            </p>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${currentProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Booked</span>
                <span>In Transit</span>
                <span>Delivered</span>
              </div>
            </div>
          </div>

          {/* Details Grid - using destination card grid structure */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Shipment Details */}
            <div className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Carrier & Service
              </h3>
              <p className="text-gray-600 leading-relaxed">
                <span className="font-semibold">{trackingData.carrier}</span><br />
                {trackingData.service} Service
              </p>
            </div>

            {/* Route Information */}
            <div className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Route
              </h3>
              <p className="text-gray-600 leading-relaxed">
                <span className="font-semibold">{trackingData.origin.code} → {trackingData.destination.code}</span><br />
                {trackingData.destination.name}
              </p>
            </div>

            {/* Delivery Information */}
            <div className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Estimated Delivery
              </h3>
              <p className="text-gray-600 leading-relaxed">
                <span className="font-semibold">
                  {new Date(trackingData.estimatedDelivery).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric'
                  })}
                </span><br />
                {new Date(trackingData.estimatedDelivery).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Tracking Timeline - using card design pattern */}
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Tracking Timeline
              </span>
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Follow your shipment's journey from pickup to delivery
            </p>
            
            <div className="space-y-6">
              {trackingData.events.map((event, index) => (
                <div key={index} className="flex items-start space-x-4">
                  {/* Event Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-r ${getStatusColor(event.status)} rounded-full flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  {/* Event Details */}
                  <div className="flex-1 bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/70 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {event.status.replace('_', ' ')}
                      </h3>
                      <span className="text-sm text-gray-500 font-medium">
                        {new Date(event.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{event.description}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                      </svg>
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Information - using destination grid pattern */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
            <div className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-lg">Booking Reference</h3>
              <p className="text-sm text-gray-600 font-medium font-mono">{trackingData.references.bookingReference}</p>
            </div>

            <div className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-lg">Air Waybill</h3>
              <p className="text-sm text-gray-600 font-medium font-mono">{trackingData.references.airWaybill}</p>
            </div>
          </div>

          {/* Action Buttons - same as homepage CTA */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
            {/* Background Pattern - identical to homepage */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              
              <h2 className="text-4xl font-bold mb-4">
                Need Help?
              </h2>
              <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                Refresh your tracking information or contact our support team for assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={fetchTrackingData}
                  className="inline-flex items-center bg-white hover:bg-gray-100 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Status
                </button>
                <a
                  href="/support"
                  className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 transform"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}