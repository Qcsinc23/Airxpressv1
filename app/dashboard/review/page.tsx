// app/dashboard/review/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import DocumentUploaderConvex from '../../components/upload/DocumentUploaderConvex';

export default function ReviewPage() {
  const { user } = useUser();
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  
  // TODO: Get user's bookings - for now using mock data
  const mockBookings = [
    { id: 'BOOK_2024_001', destination: 'Georgetown, Guyana', status: 'NEW', createdAt: '2024-01-15' },
    { id: 'BOOK_2024_002', destination: 'Port of Spain, Trinidad', status: 'NEEDS_DOCS', createdAt: '2024-01-10' },
  ];

  // TODO: Implement review state functionality when onboarding functions are available
  // Placeholder review state
  const reviewState = selectedBookingId ? {
    checklist: [
      {
        _id: '1',
        key: 'upload-commercial-invoice',
        label: 'Upload Commercial Invoice',
        done: false
      },
      {
        _id: '2',
        key: 'upload-packing-list',
        label: 'Upload Packing List',
        done: false
      },
      {
        _id: '3',
        key: 'upload-photo-id',
        label: 'Upload Photo ID',
        done: false
      }
    ],
    progress: {
      progressPercentage: 0,
      percentage: 0,
      completed: 0,
      total: 3,
      missingDocs: []
    },
    documents: [] as Array<{_id: string, filename: string, type: string, size: number, status: string}>
  } : null;

  // Default to first booking if none selected
  useEffect(() => {
    if (!selectedBookingId && mockBookings.length > 0) {
      setSelectedBookingId(mockBookings[0].id);
    }
  }, [selectedBookingId]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const selectedBooking = mockBookings.find(b => b.id === selectedBookingId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Review Center</h1>
          <p className="text-gray-600">Complete your shipping requirements to proceed</p>
        </div>

        {/* Booking Selector */}
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Booking</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {mockBookings.map((booking) => (
              <button
                key={booking.id}
                onClick={() => setSelectedBookingId(booking.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedBookingId === booking.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{booking.id}</p>
                  <p className="text-sm text-gray-600">{booking.destination}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: <span className="font-medium">{booking.status}</span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedBooking && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Progress Ring & Overview */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
                
                {/* Progress Ring */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(reviewState?.progress.percentage || 0) * 2.51} 251`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {reviewState?.progress.percentage || 0}%
                        </div>
                        <div className="text-xs text-gray-500">Complete</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600">
                  {reviewState?.progress.completed || 0} of {reviewState?.progress.total || 0} tasks completed
                </div>
              </div>

              {/* Help Section */}
              <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <a
                    href="tel:(201)823-1974"
                    className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">(201) 823-1974</p>
                      <p className="text-xs text-gray-500">24/7 Phone Support</p>
                    </div>
                  </a>
                  
                  <a
                    href="/support"
                    className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email Support</p>
                      <p className="text-xs text-gray-500">Contact our team</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Checklist & Documents */}
            <div className="lg:col-span-2">
              {/* Checklist */}
              <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Checklist</h3>
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
                      {!item.done && item.key.includes('upload') && (
                        <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Upload
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Center */}
              <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Center</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* ID Front Upload */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">ID (Front)</h4>
                    <DocumentUploaderConvex
                      userId={user.id as Id<"users">}
                      bookingId={selectedBookingId}
                      documentType="id-front"
                      label="ID Front"
                      acceptedFileTypes="image/*"
                      maxSizeMB={5}
                      onUploadComplete={(docId) => {
                        console.log('ID Front uploaded:', docId);
                        // TODO: Refresh review state
                      }}
                      onUploadError={(error) => {
                        console.error('Upload error:', error);
                        alert(`Upload failed: ${error}`);
                      }}
                    />
                  </div>

                  {/* ID Back Upload */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">ID (Back)</h4>
                    <DocumentUploaderConvex
                      userId={user.id as Id<"users">}
                      bookingId={selectedBookingId}
                      documentType="id-back"
                      label="ID Back"
                      acceptedFileTypes="image/*"
                      maxSizeMB={5}
                      onUploadComplete={(docId) => {
                        console.log('ID Back uploaded:', docId);
                        // TODO: Refresh review state
                      }}
                      onUploadError={(error) => {
                        console.error('Upload error:', error);
                        alert(`Upload failed: ${error}`);
                      }}
                    />
                  </div>
                </div>

                {/* Uploaded Documents */}
                {reviewState?.documents && reviewState.documents.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents</h4>
                    <div className="space-y-2">
                      {reviewState.documents.map((doc) => (
                        <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{doc.filename}</p>
                            <p className="text-sm text-gray-500">
                              {doc.type} • {(doc.size / (1024 * 1024)).toFixed(1)}MB
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            doc.status === 'uploaded' ? 'bg-blue-100 text-blue-800' :
                            doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}