// app/tracking/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Breadcrumb, { TrackingProcessBreadcrumbs } from '../../components/ui/Breadcrumb';

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

export default function TrackingPage() {
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
      'BOOKING_CREATED': 'bg-blue-100 text-blue-800',
      'PICKUP_COMPLETED': 'bg-yellow-100 text-yellow-800',
      'TENDERED_TO_CARRIER': 'bg-purple-100 text-purple-800',
      'DEPARTED_ORIGIN': 'bg-orange-100 text-orange-800',
      'IN_TRANSIT': 'bg-orange-100 text-orange-800',
      'ARRIVED_DESTINATION': 'bg-indigo-100 text-indigo-800',
      'OUT_FOR_DELIVERY': 'bg-green-100 text-green-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'EXCEPTION': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getProgressPercentage = (status: string) => {
    const statusSteps = {
      'BOOKING_CREATED': 10,
      'PICKUP_COMPLETED': 25,
      'TENDERED_TO_CARRIER': 40,
      'DEPARTED_ORIGIN': 60,
      'IN_TRANSIT': 75,
      'ARRIVED_DESTINATION': 85,
      'OUT_FOR_DELIVERY': 95,
      'DELIVERED': 100,
    };
    return statusSteps[status as keyof typeof statusSteps] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 flex items-center space-x-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <div className="text-gray-800">
            <div className="font-semibold text-lg">Loading tracking information</div>
            <div className="text-sm text-gray-600">Please wait while we fetch your shipment details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Tracking Information Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={fetchTrackingData}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold py-3 px-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl"
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
                className="bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-900 px-8 py-3 rounded-xl font-semibold text-center border border-white/20 hover:border-indigo-200 transition-all duration-200 hover:scale-[1.02] transform"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Another Shipment
                </span>
              </a>
            </div>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb 
            items={TrackingProcessBreadcrumbs.details(id)} 
            className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm"
          />
        </div>

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mr-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Track Your Shipment</h1>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-500">Tracking Number</div>
                <div className="text-lg font-bold text-gray-900 font-mono bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{trackingData.trackingId}</div>
              </div>
            </div>
            
            {/* Current Status */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(trackingData.status)} shadow-sm`}>
                  <div className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse"></div>
                  {trackingData.status.replace('_', ' ')}
                </div>
                <div className="mt-3 text-gray-700 font-medium">
                  {latestEvent.description}
                </div>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                  </svg>
                  {latestEvent.location}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-500 mb-1">Estimated Delivery</div>
                <div className="font-bold text-lg text-gray-900">
                  {new Date(trackingData.estimatedDelivery).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric'
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(trackingData.estimatedDelivery).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out shadow-lg relative overflow-hidden"
                  style={{ width: `${currentProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2 font-medium">
                <span className={currentProgress >= 10 ? 'text-indigo-600' : ''}>Booked</span>
                <span className={currentProgress >= 25 ? 'text-indigo-600' : ''}>Pickup</span>
                <span className={currentProgress >= 75 ? 'text-indigo-600' : ''}>In Transit</span>
                <span className={currentProgress >= 100 ? 'text-green-600' : ''}>Delivered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Shipment Details</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl">
                <div>
                  <div className="text-sm font-medium text-gray-500">Carrier</div>
                  <div className="font-semibold text-gray-900">{trackingData.carrier}</div>
                </div>
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl">
                <div>
                  <div className="text-sm font-medium text-gray-500">Service Level</div>
                  <div className="font-semibold text-gray-900">{trackingData.service}</div>
                </div>
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-50/50 to-teal-50/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-500">Route</div>
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                </div>
                <div className="font-semibold text-gray-900 flex items-center">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-mono mr-2">
                    {trackingData.origin.code}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-mono">
                    {trackingData.destination.code}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {trackingData.origin.name} to {trackingData.destination.name}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">References</h2>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Booking Reference</div>
                <div className="font-semibold text-gray-900 font-mono text-sm bg-white/60 px-3 py-2 rounded-lg">
                  {trackingData.references.bookingReference}
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Air Waybill</div>
                <div className="font-semibold text-gray-900 font-mono text-sm bg-white/60 px-3 py-2 rounded-lg">
                  {trackingData.references.airWaybill}
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-1">Estimated Delivery</div>
                <div className="font-semibold text-gray-900">
                  {new Date(trackingData.estimatedDelivery).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(trackingData.estimatedDelivery).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Timeline */}
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 mb-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Tracking Timeline</h2>
          </div>
          <div className="relative">
            {trackingData.events.map((event, index) => (
              <div key={index} className="relative pl-12 pb-8 last:pb-0">
                {/* Enhanced Timeline line */}
                {index < trackingData.events.length - 1 && (
                  <div className="absolute left-4 top-8 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full shadow-sm" />
                )}
                
                {/* Enhanced Timeline dot with animation */}
                <div className="absolute left-0 top-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                      {index === trackingData.events.length - 1 ? (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      )}
                    </div>
                    {index === trackingData.events.length - 1 && (
                      <div className="absolute inset-0 w-8 h-8 bg-gradient-to-r from-indigo-500/30 to-purple-600/30 rounded-full animate-ping" />
                    )}
                  </div>
                </div>
                
                {/* Enhanced Event content */}
                <div className="bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm border border-white/30 rounded-xl p-6 ml-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(event.status)} shadow-sm`}>
                      <div className="w-2 h-2 bg-current rounded-full mr-2"></div>
                      {event.status.replace('_', ' ')}
                    </div>
                    <div className="text-sm font-medium text-gray-600 bg-white/60 px-3 py-1 rounded-lg">
                      {new Date(event.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="font-semibold text-lg text-gray-900 mb-2">{event.description}</div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                    </svg>
                    {event.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modern Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={fetchTrackingData}
            className="group bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 group-hover:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh Status
            </span>
          </button>
          <a 
            href="/support"
            className="group bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-900 px-8 py-4 rounded-xl font-semibold text-center border border-white/20 hover:border-indigo-200 transition-all duration-200 hover:scale-[1.02] transform shadow-sm hover:shadow-md"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              Contact Support
            </span>
          </a>
          <a 
            href="/tracking"
            className="group bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-900 px-8 py-4 rounded-xl font-semibold text-center border border-white/20 hover:border-purple-200 transition-all duration-200 hover:scale-[1.02] transform shadow-sm hover:shadow-md"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 text-purple-500 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Track Another Shipment
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
