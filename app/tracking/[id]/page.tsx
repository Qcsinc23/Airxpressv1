// app/tracking/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';

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

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TrackingPage({ params }: PageProps) {
  const { id } = await params;
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrackingData();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tracking Information Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-4">
              <button 
                onClick={fetchTrackingData}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
              >
                Try Again
              </button>
              <a 
                href="/tracking"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Search Another Shipment
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Track Your Shipment</h1>
              <div className="text-right">
                <div className="text-sm text-gray-500">Tracking Number</div>
                <div className="text-lg font-bold text-gray-900">{trackingData.trackingId}</div>
              </div>
            </div>
            
            {/* Current Status */}
            <div className="flex items-center justify-between">
              <div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(trackingData.status)}`}>
                  {trackingData.status.replace('_', ' ')}
                </div>
                <div className="mt-2 text-gray-600">
                  {latestEvent.description} • {latestEvent.location}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Estimated Delivery</div>
                <div className="font-bold text-gray-900">
                  {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Booked</span>
                <span>Pickup</span>
                <span>In Transit</span>
                <span>Delivered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shipment Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Carrier</div>
                <div className="font-medium">{trackingData.carrier}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Service Level</div>
                <div className="font-medium">{trackingData.service}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Route</div>
                <div className="font-medium">
                  {trackingData.origin.code} → {trackingData.destination.code}
                </div>
                <div className="text-sm text-gray-600">
                  {trackingData.origin.name} to {trackingData.destination.name}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">References</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Booking Reference</div>
                <div className="font-medium">{trackingData.references.bookingReference}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Air Waybill</div>
                <div className="font-medium">{trackingData.references.airWaybill}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Estimated Delivery</div>
                <div className="font-medium">
                  {new Date(trackingData.estimatedDelivery).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Tracking Timeline</h2>
          <div className="relative">
            {trackingData.events.map((event, index) => (
              <div key={index} className="relative pl-8 pb-6 last:pb-0">
                {/* Timeline line */}
                {index < trackingData.events.length - 1 && (
                  <div className="absolute left-3 top-6 w-0.5 h-full bg-gray-300" />
                )}
                
                {/* Timeline dot */}
                <div className="absolute left-0 top-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                
                {/* Event content */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                      {event.status.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="font-medium text-gray-900">{event.description}</div>
                  <div className="text-sm text-gray-600">{event.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center space-x-4">
          <button 
            onClick={fetchTrackingData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Refresh Status
          </button>
          <a 
            href="/support"
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}