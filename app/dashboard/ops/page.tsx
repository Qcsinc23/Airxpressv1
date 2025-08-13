// app/dashboard/ops/page.tsx
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface BookingCard {
  _id: Id<"bookings">;
  status: string;
  userId: Id<"users">;
  pickupDetails: {
    address: string;
    contact: string;
  };
  progress: {
    progressPercentage: number;
    missingDocs: string[];
  };
  createdAt: number;
}

export default function OpsPage() {
  const { user } = useUser();
  const [selectedColumn, setSelectedColumn] = useState<string>('all');
  
  // Get all bookings for ops dashboard
  const allBookings = useQuery(api.bookings.getOpsBookings) || [];
  const updateBookingStatus = useMutation(api.bookings.updateBookingStatus);

  // Check if user has ops/admin role
  const hasOpsAccess = user?.publicMetadata?.role === 'ops' || user?.publicMetadata?.role === 'admin';

  if (!hasOpsAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view the ops dashboard.</p>
        </div>
      </div>
    );
  }

  // Group bookings by status
  const bookingsByStatus = allBookings.reduce((acc, booking) => {
    const status = booking.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(booking);
    return acc;
  }, {} as Record<string, BookingCard[]>);

  const columns = [
    { key: 'NEW', label: 'New', color: 'bg-blue-100 border-blue-200 text-blue-800' },
    { key: 'NEEDS_DOCS', label: 'Needs Docs', color: 'bg-orange-100 border-orange-200 text-orange-800' },
    { key: 'READY_TO_TENDER', label: 'Ready to Tender', color: 'bg-green-100 border-green-200 text-green-800' },
    { key: 'TENDERED', label: 'Tendered', color: 'bg-purple-100 border-purple-200 text-purple-800' },
    { key: 'IN_TRANSIT', label: 'In Transit', color: 'bg-indigo-100 border-indigo-200 text-indigo-800' },
    { key: 'ARRIVED', label: 'Arrived', color: 'bg-teal-100 border-teal-200 text-teal-800' },
    { key: 'DELIVERED', label: 'Delivered', color: 'bg-gray-100 border-gray-200 text-gray-800' },
  ];

  const handleStatusChange = async (bookingId: Id<"bookings">, newStatus: string) => {
    try {
      await updateBookingStatus({
        bookingId,
        status: newStatus as any,
        notes: `Status changed to ${newStatus} by ${user?.fullName || 'Ops'}`,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update booking status');
    }
  };

  const BookingCard = ({ booking }: { booking: BookingCard & { assignment?: any; assignedAgent?: any } }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{booking._id}</h4>
          <p className="text-sm text-gray-600">{booking.pickupDetails.contact}</p>
          {booking.assignedAgent && (
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <p className="text-xs text-green-600 font-medium">
                Agent: {booking.assignedAgent.contact?.phone || 'Unknown'}
              </p>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {booking.progress.progressPercentage}%
          </div>
          <div className="text-xs text-gray-500">Progress</div>
        </div>
      </div>

      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${booking.progress.progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {booking.progress.missingDocs.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-red-600 mb-1">Missing:</p>
          <div className="space-y-1">
            {booking.progress.missingDocs.slice(0, 2).map((doc, idx) => (
              <div key={idx} className="text-xs text-red-500">• {doc}</div>
            ))}
            {booking.progress.missingDocs.length > 2 && (
              <div className="text-xs text-red-500">
                +{booking.progress.missingDocs.length - 2} more
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={() => alert(`Call ${booking.pickupDetails.contact}`)}
          className="w-full text-xs bg-blue-50 text-blue-700 py-1 px-2 rounded hover:bg-blue-100 transition-colors"
        >
          📞 Call Customer
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          {!booking.assignedAgent ? (
            <button
              onClick={async () => {
                try {
                  // This would call the auto-assignment function
                  alert('Auto-assign agent feature integration needed');
                } catch (error) {
                  alert('Failed to assign agent');
                }
              }}
              className="text-xs bg-green-50 text-green-700 py-1 px-2 rounded hover:bg-green-100 transition-colors"
            >
              👤 Assign Agent
            </button>
          ) : (
            <button
              onClick={() => alert(`Agent: ${booking.assignedAgent.contact?.phone}`)}
              className="text-xs bg-green-50 text-green-700 py-1 px-2 rounded hover:bg-green-100 transition-colors"
            >
              👤 View Agent
            </button>
          )}
          
          <button
            onClick={() => alert('Request missing docs feature coming soon')}
            className="text-xs bg-orange-50 text-orange-700 py-1 px-2 rounded hover:bg-orange-100 transition-colors"
          >
            📄 Request Docs
          </button>
        </div>

        <select
          value={booking.status}
          onChange={(e) => handleStatusChange(booking._id, e.target.value)}
          className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {columns.map(col => (
            <option key={col.key} value={col.key}>{col.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Created: {new Date(booking.createdAt).toLocaleDateString()}
        </p>
        {booking.assignment && (
          <p className="text-xs text-gray-500">
            Assigned: {new Date(booking.assignment.assignedAt).toLocaleDateString()}
            {booking.assignment.autoAssigned && <span className="ml-1 text-blue-500">(Auto)</span>}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Operations Dashboard</h1>
          <p className="text-gray-600">Manage bookings and customer onboarding</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {columns.map(column => {
            const count = bookingsByStatus[column.key]?.length || 0;
            return (
              <div key={column.key} className={`${column.color} border rounded-lg p-4 text-center`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm font-medium">{column.label}</div>
              </div>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {columns.map(column => {
            const bookings = bookingsByStatus[column.key] || [];
            return (
              <div key={column.key} className="bg-gray-100 rounded-lg p-4">
                <div className={`${column.color} border rounded-lg p-3 mb-4 text-center`}>
                  <h3 className="font-semibold">{column.label}</h3>
                  <p className="text-sm opacity-75">{bookings.length} bookings</p>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bookings.map(booking => (
                    <BookingCard key={booking._id} booking={booking} />
                  ))}
                  
                  {bookings.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📭</div>
                      <p className="text-sm">No bookings</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <a 
              href="/dashboard/ops/sla"
              className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div className="text-red-600 font-semibold">🚨 SLA Monitor</div>
              <p className="text-sm text-red-600 mt-1">View breaches & metrics</p>
            </a>
            
            <button className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="text-blue-600 font-semibold">📊 Daily Report</div>
              <p className="text-sm text-blue-600 mt-1">Generate today's summary</p>
            </button>
            
            <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
              <div className="text-green-600 font-semibold">📋 Bulk Actions</div>
              <p className="text-sm text-green-600 mt-1">Process multiple bookings</p>
            </button>
            
            <button className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="text-purple-600 font-semibold">⚙️ Settings</div>
              <p className="text-sm text-purple-600 mt-1">Configure workflows</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}