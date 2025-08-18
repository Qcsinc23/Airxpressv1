// app/dashboard/admin/page.tsx
'use client';

export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function AdminDashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'sla' | 'users' | 'system'>('overview');

  // Check if user has admin access
  const hasAdminAccess = user?.publicMetadata?.role === 'admin';

  // Get system data - using available API endpoints
  // TODO: Implement getOpsBookings function - using placeholder for now
  const allBookings: any[] = [];
  // Note: SLA functions not available in current API, using placeholder
  const activeBreaches: any[] = [];
  
  // Mutations - using available API endpoints
  const initializeSlaTemplates = () => Promise.resolve({ message: 'SLA templates not yet implemented' });

  const handleInitializeSla = async () => {
    try {
      const result = await initializeSlaTemplates();
      alert(result.message);
    } catch (error) {
      console.error('Failed to initialize SLA templates:', error);
      alert('Failed to initialize SLA templates');
    }
  };

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need administrator privileges to access this dashboard.</p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Calculate system metrics
  const totalUsers = 0; // Would need user query
  const totalAgents = 0; // Would need agent count query
  const activeBookingsCount = allBookings.filter(b => 
    ['NEW', 'NEEDS_DOCS', 'READY_TO_TENDER', 'IN_TRANSIT'].includes(b.status)
  ).length;
  const criticalBreaches = activeBreaches.filter(b => b.severity === 'critical' && !b.resolved).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">System configuration and management</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Welcome, {user?.firstName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{allBookings.length}</p>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{totalAgents}</p>
                <p className="text-sm text-gray-600">Active Agents</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{activeBookingsCount}</p>
                <p className="text-sm text-gray-600">Active Shipments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{criticalBreaches}</p>
                <p className="text-sm text-gray-600">Critical SLA Breaches</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'System Overview', icon: '📊' },
                { id: 'sla', name: 'SLA Configuration', icon: '⏱️' },
                { id: 'system', name: 'System Settings', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Bookings Today</span>
                          <span className="font-medium">{allBookings.filter(b => 
                            new Date(b.createdAt).toDateString() === new Date().toDateString()
                          ).length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Active SLA Breaches</span>
                          <span className={`font-medium ${activeBreaches.filter(b => !b.resolved).length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {activeBreaches.filter(b => !b.resolved).length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">System Status</span>
                          <span className="font-medium text-green-600">Operational</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        <button
                          onClick={handleInitializeSla}
                          className="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50 text-sm"
                        >
                          Initialize Default SLA Templates
                        </button>
                        <a 
                          href="/dashboard/ops"
                          className="block w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50 text-sm"
                        >
                          View Operations Dashboard
                        </a>
                        <a 
                          href="/dashboard/ops/sla"
                          className="block w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50 text-sm"
                        >
                          Monitor SLA Breaches
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
                  <div className="space-y-3">
                    {criticalBreaches > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                        <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-medium text-red-800">Critical SLA Breaches</p>
                          <p className="text-sm text-red-600">{criticalBreaches} critical breaches require immediate attention</p>
                        </div>
                        <a
                          href="/dashboard/ops/sla"
                          className="ml-auto px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          View
                        </a>
                      </div>
                    )}
                    
                    {criticalBreaches === 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-green-800">All systems operational - no critical alerts</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sla' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">SLA Configuration</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add SLA Template
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Default SLA Templates</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded border p-3">
                        <h5 className="font-medium text-gray-900">Standard Pickup</h5>
                        <p className="text-sm text-gray-600 mt-1">24 hours from booking</p>
                        <div className="mt-2 flex space-x-2">
                          <button className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Active</button>
                          <button className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">Edit</button>
                        </div>
                      </div>
                      <div className="bg-white rounded border p-3">
                        <h5 className="font-medium text-gray-900">JetPak Delivery</h5>
                        <p className="text-sm text-gray-600 mt-1">2 business days</p>
                        <div className="mt-2 flex space-x-2">
                          <button className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Active</button>
                          <button className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">Edit</button>
                        </div>
                      </div>
                      <div className="bg-white rounded border p-3">
                        <h5 className="font-medium text-gray-900">Document Completion</h5>
                        <p className="text-sm text-gray-600 mt-1">48 hours from booking</p>
                        <div className="mt-2 flex space-x-2">
                          <button className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Active</button>
                          <button className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">Edit</button>
                        </div>
                      </div>
                      <div className="bg-white rounded border p-3">
                        <h5 className="font-medium text-gray-900">Customer Response</h5>
                        <p className="text-sm text-gray-600 mt-1">4 hours maximum</p>
                        <div className="mt-2 flex space-x-2">
                          <button className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Active</button>
                          <button className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">Edit</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Configuration Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={handleInitializeSla}
                        className="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <span className="mr-3">🚀</span>
                          <div>
                            <p className="font-medium">Initialize Default Templates</p>
                            <p className="text-sm text-gray-600">Create standard SLA templates</p>
                          </div>
                        </div>
                      </button>
                      <a 
                        href="/dashboard/ops/sla"
                        className="block w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <span className="mr-3">📊</span>
                          <div>
                            <p className="font-medium">View SLA Reports</p>
                            <p className="text-sm text-gray-600">Compliance and performance analytics</p>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">System Settings</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Application Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Auto-assign Agents</p>
                          <p className="text-sm text-gray-600">Automatically assign agents to new bookings</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">SLA Monitoring</p>
                          <p className="text-sm text-gray-600">Enable automatic SLA breach detection</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-600">Send email alerts for critical events</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">System Management</h4>
                    <div className="space-y-2">
                      <a 
                        href="/dashboard/ops"
                        className="block w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <span className="mr-3">🏢</span>
                          <div>
                            <p className="font-medium">Operations Dashboard</p>
                            <p className="text-sm text-gray-600">Monitor all bookings and agents</p>
                          </div>
                        </div>
                      </a>
                      <a 
                        href="/dashboard/agent/setup"
                        className="block w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <span className="mr-3">👥</span>
                          <div>
                            <p className="font-medium">Agent Management</p>
                            <p className="text-sm text-gray-600">Configure agent profiles and coverage</p>
                          </div>
                        </div>
                      </a>
                      <button className="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50">
                        <div className="flex items-center">
                          <span className="mr-3">📊</span>
                          <div>
                            <p className="font-medium">System Report</p>
                            <p className="text-sm text-gray-600">Generate comprehensive system health report</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}