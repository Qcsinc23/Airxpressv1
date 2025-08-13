// app/dashboard/agent/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

export default function AgentDashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed' | 'profile'>('assigned');

  // Check if user is an agent
  const agentProfile = useQuery(
    api.agents.getAgentProfile,
    user ? { userId: user.id as Id<"users"> } : "skip"
  );

  // Get agent's bookings
  const assignedBookings = useQuery(
    api.agents.getAgentBookings,
    agentProfile ? { agentId: agentProfile._id, status: "assigned" } : "skip"
  );

  const completedBookings = useQuery(
    api.agents.getAgentBookings,
    agentProfile ? { agentId: agentProfile._id, status: "completed" } : "skip"
  );

  // Get notifications
  const notifications = useQuery(
    api.agents.getAgentNotifications,
    agentProfile ? { agentId: agentProfile._id, unreadOnly: true } : "skip"
  );

  // Mutations
  const updateAssignmentStatus = useMutation(api.agents.updateAssignmentStatus);
  const markNotificationRead = useMutation(api.agents.markNotificationRead);

  const handleStatusUpdate = async (assignmentId: Id<"agentAssignments">, newStatus: string, notes?: string) => {
    try {
      await updateAssignmentStatus({
        assignmentId,
        status: newStatus,
        notes,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleNotificationClick = async (notificationId: Id<"agentNotifications">) => {
    try {
      await markNotificationRead({ notificationId });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Check role access
  const hasAgentAccess = user?.publicMetadata?.role === 'agent' || agentProfile;

  if (!hasAgentAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent Access Required</h1>
          <p className="text-gray-600">You need to be registered as an agent to access this dashboard.</p>
          <a
            href="/dashboard"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!agentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Agent Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.firstName}</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {notifications?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {agentProfile.capacity.currentActiveBookings}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {agentProfile.performance.completedBookings}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {agentProfile.performance.averageRating.toFixed(1)}★
            </div>
            <div className="text-sm text-gray-600">Rating</div>
          </div>
        </div>
      </div>

      {/* Notifications Banner */}
      {notifications && notifications.length > 0 && (
        <div className="px-4 mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">{notifications.length}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  You have {notifications.length} unread notification{notifications.length !== 1 ? 's' : ''}
                </p>
                <div className="mt-1 space-y-1">
                  {notifications.slice(0, 2).map((notification) => (
                    <button
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification._id)}
                      className="block text-xs text-yellow-700 hover:text-yellow-900"
                    >
                      • {notification.title}: {notification.message}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="px-4 mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'assigned'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Assigned ({assignedBookings?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed ({completedBookings?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-6">
        {activeTab === 'assigned' && (
          <div className="space-y-3">
            {assignedBookings?.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-600">No assigned bookings</p>
              </div>
            ) : (
              assignedBookings?.map(({ assignment, booking }) => (
                <div key={assignment._id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Booking {booking._id}</h3>
                      <p className="text-sm text-gray-600">{booking.pickupDetails?.contact}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      assignment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {assignment.priority}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div><strong>Address:</strong> {booking.pickupDetails?.address}</div>
                    <div><strong>Scheduled:</strong> {new Date(booking.pickupDetails?.scheduledTime || '').toLocaleString()}</div>
                    {booking.pickupDetails?.specialInstructions && (
                      <div><strong>Instructions:</strong> {booking.pickupDetails.specialInstructions}</div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => window.open(`tel:${booking.pickupDetails?.contact}`)}
                      className="py-2 px-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100"
                    >
                      📞 Call Customer
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(assignment._id, 'accepted', 'Agent accepted the assignment')}
                      className="py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
                    >
                      ✅ Accept
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <select
                      value={assignment.status}
                      onChange={(e) => handleStatusUpdate(assignment._id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="assigned">Assigned</option>
                      <option value="accepted">Accepted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="space-y-3">
            {completedBookings?.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-gray-600">No completed bookings</p>
              </div>
            ) : (
              completedBookings?.map(({ assignment, booking }) => (
                <div key={assignment._id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">Booking {booking._id}</h3>
                      <p className="text-sm text-gray-600">{booking.pickupDetails?.contact}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Completed
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Completed: {new Date(assignment.updatedAt).toLocaleDateString()}</div>
                    {assignment.notes && <div>Notes: {assignment.notes}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Profile</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Coverage Area</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>States:</strong> {agentProfile.coverage.states.join(', ')}</div>
                  <div><strong>Max Radius:</strong> {agentProfile.coverage.maxRadius} miles</div>
                  <div><strong>Home Base:</strong> {agentProfile.coverage.homeBase.address}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Capacity</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Max Active Bookings:</strong> {agentProfile.capacity.maxActiveBookings}</div>
                  <div><strong>Current Active:</strong> {agentProfile.capacity.currentActiveBookings}</div>
                  <div><strong>Specializations:</strong> {agentProfile.capacity.specializations.join(', ') || 'None'}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Rating:</strong> {agentProfile.performance.averageRating}/5.0</div>
                  <div><strong>On-time Rate:</strong> {agentProfile.performance.onTimePercentage}%</div>
                  <div><strong>Total Completed:</strong> {agentProfile.performance.completedBookings}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Phone:</strong> {agentProfile.contact.phone}</div>
                  <div><strong>Email:</strong> {agentProfile.contact.email}</div>
                  {agentProfile.contact.whatsapp && (
                    <div><strong>WhatsApp:</strong> {agentProfile.contact.whatsapp}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}