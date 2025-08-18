// app/dashboard/booking/[bookingId]/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

interface BookingDetailProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default function BookingDetailPage({ params }: BookingDetailProps) {
  const { user } = useUser();
  const [bookingId, setBookingId] = useState<string>('');
  
  // Resolve params
  useEffect(() => {
    params.then(resolvedParams => {
      setBookingId(resolvedParams.bookingId);
    });
  }, [params]);
  
  // Get booking data using available function
  const bookingData = useQuery(
    api.functions.bookings.getBooking,
    bookingId ? { id: bookingId as Id<"bookings"> } : "skip"
  );

  // TODO: Implement review state functionality when onboarding functions are available
  // Placeholder review state
  const reviewState = bookingData ? {
    checklist: [
      {
        _id: '1',
        key: 'complete-invoice',
        label: 'Complete Shipping Invoice',
        done: false
      },
      {
        _id: '2',
        key: 'upload-documents',
        label: 'Upload Required Documents',
        done: false
      }
    ]
  } : null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to view booking details.</p>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Details</h1>
          <p className="text-gray-600">Booking ID: {bookingId}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Status */}
            <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Progress</h3>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    bookingData.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                    bookingData.status === 'NEEDS_DOCS' ? 'bg-orange-100 text-orange-800' :
                    bookingData.status === 'READY_TO_TENDER' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {bookingData.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Completion</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {bookingData.status === 'NEW' ? 10 :
                     bookingData.status === 'NEEDS_DOCS' ? 25 :
                     bookingData.status === 'READY_TO_TENDER' ? 50 :
                     bookingData.status === 'TENDERED' ? 70 :
                     bookingData.status === 'IN_TRANSIT' ? 85 :
                     bookingData.status === 'ARRIVED' ? 95 : 100}%
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${bookingData.status === 'NEW' ? 10 :
                                     bookingData.status === 'NEEDS_DOCS' ? 25 :
                                     bookingData.status === 'READY_TO_TENDER' ? 50 :
                                     bookingData.status === 'TENDERED' ? 70 :
                                     bookingData.status === 'IN_TRANSIT' ? 85 :
                                     bookingData.status === 'ARRIVED' ? 95 : 100}%` }}
                ></div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Tasks</h3>
              
              <div className="space-y-3">
                {reviewState?.checklist.map((item) => (
                  <div
                    key={item._id}
                    className={`flex items-center p-4 rounded-lg border ${
                      item.done 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 ${
                      item.done ? 'bg-green-600' : 'bg-gray-300'
                    }`}>
                      {item.done && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${item.done ? 'text-green-900' : 'text-gray-900'}`}>
                        {item.label}
                      </p>
                      <p className={`text-sm ${item.done ? 'text-green-600' : 'text-gray-500'}`}>
                        {item.done ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                    {!item.done && (
                      <a
                        href={
                          item.key === 'complete-invoice' ? `/dashboard/booking/${bookingId}/invoice` :
                          item.key.includes('upload') ? '/dashboard/review' :
                          '/dashboard/review'
                        }
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        {item.key === 'complete-invoice' ? 'Complete' : 'Start'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Events */}
            <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking History</h3>
              
              <div className="space-y-4">
                {bookingData.trackingEvents.map((event, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 mr-4"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.status.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">{event.notes}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <a
                  href="/dashboard/review"
                  className="w-full flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Review Center</p>
                    <p className="text-xs text-gray-500">Upload documents</p>
                  </div>
                </a>
                
                <a
                  href={`/dashboard/booking/${bookingId}/invoice`}
                  className="w-full flex items-center p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Shipping Invoice</p>
                    <p className="text-xs text-gray-500">Complete form</p>
                  </div>
                </a>
                
                <a
                  href="/support"
                  className="w-full flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Get Help</p>
                    <p className="text-xs text-gray-500">Contact support</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
              
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">(201) 823-1974</p>
                  <p className="text-sm text-gray-600">24/7 Support Line</p>
                </div>
                
                <div className="text-center">
                  <p className="font-medium text-gray-900">support@cargoexpressnj.com</p>
                  <p className="text-sm text-gray-600">Email Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}