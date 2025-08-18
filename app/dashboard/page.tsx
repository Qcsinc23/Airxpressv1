// app/dashboard/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Header from '../components/ui/Header';
import Breadcrumb, { DashboardBreadcrumbs } from '../components/ui/Breadcrumb';

interface BookingSummary {
  id: string;
  trackingNumber: string;
  status: string;
  carrier: string;
  route: string;
  totalPrice: number;
  createdAt: string;
}

interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  totalSpent: number;
  avgDeliveryTime: number;
}

export default function UserDashboard() {
  const { user, isLoaded } = useUser();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchDashboardData();
    }
  }, [isLoaded, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user bookings
      const bookingsResponse = await fetch('/api/user/bookings');
      if (!bookingsResponse.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData.bookings);
      
      // Calculate stats
      const totalBookings = bookingsData.bookings.length;
      const activeBookings = bookingsData.bookings.filter(
        (b: BookingSummary) => ['NEW', 'PICKUP_SCHEDULED', 'TENDERED', 'IN_TRANSIT'].includes(b.status)
      ).length;
      const totalSpent = bookingsData.bookings.reduce(
        (sum: number, b: BookingSummary) => sum + b.totalPrice, 0
      );
      
      setStats({
        totalBookings,
        activeBookings,
        totalSpent,
        avgDeliveryTime: 1.5, // Mock average delivery time
      });

    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'NEW': 'bg-blue-100 text-blue-800',
      'PAYMENT_CONFIRMED': 'bg-green-100 text-green-800',
      'PICKUP_SCHEDULED': 'bg-yellow-100 text-yellow-800',
      'TENDERED': 'bg-purple-100 text-purple-800',
      'IN_TRANSIT': 'bg-orange-100 text-orange-800',
      'ARRIVED': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!isLoaded || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50/80 backdrop-blur-lg border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold">Error loading dashboard</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
              <button 
                onClick={fetchDashboardData}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 hover:scale-105 transform shadow-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumb 
            items={DashboardBreadcrumbs.main} 
            className="mb-8"
          />

          {/* Welcome Header */}
          <div className="mb-10">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.firstName || 'User'}! ✈️</h1>
                  <p className="text-blue-100 text-lg">Manage your shipments and track your packages</p>
                </div>
                <div className="hidden md:block">
                  <svg className="w-20 h-20 text-blue-200 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalBookings}</h3>
                    <p className="text-sm text-gray-600 font-medium">Total Shipments</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">{stats.activeBookings}</h3>
                    <p className="text-sm text-gray-600 font-medium">Active Shipments</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</h3>
                    <p className="text-sm text-gray-600 font-medium">Total Spent</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">{stats.avgDeliveryTime} days</h3>
                    <p className="text-sm text-gray-600 font-medium">Avg Delivery Time</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 mb-10">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a 
                  href="/quote" 
                  className="group flex items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl hover:from-blue-100 hover:to-indigo-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-blue-200"
                >
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">New Shipment</h3>
                    <p className="text-sm text-gray-600">Get a quote and book</p>
                  </div>
                </a>

                <a 
                  href="/tracking" 
                  className="group flex items-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl hover:from-green-100 hover:to-emerald-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-green-200"
                >
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">Track Shipment</h3>
                    <p className="text-sm text-gray-600">Search by tracking number</p>
                  </div>
                </a>

                <a 
                  href="/support" 
                  className="group flex items-center p-6 bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl hover:from-purple-100 hover:to-violet-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-purple-200"
                >
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">Get Support</h3>
                    <p className="text-sm text-gray-600">Contact our team</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Role-Based Dashboards */}
          {(user?.publicMetadata?.role === 'ops' || user?.publicMetadata?.role === 'admin' || user?.publicMetadata?.role === 'agent') && (
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 mb-10">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Staff Dashboards</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(user?.publicMetadata?.role === 'ops' || user?.publicMetadata?.role === 'admin') && (
                    <a 
                      href="/dashboard/ops" 
                      className="group flex items-center p-6 bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl hover:from-orange-100 hover:to-red-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-orange-200"
                    >
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="font-bold text-gray-900 group-hover:text-orange-700 transition-colors">Operations</h3>
                        <p className="text-sm text-gray-600">Manage all bookings</p>
                      </div>
                    </a>
                  )}

                  {user?.publicMetadata?.role === 'agent' && (
                    <a 
                      href="/dashboard/agent" 
                      className="group flex items-center p-6 bg-gradient-to-br from-teal-50 to-cyan-100 rounded-2xl hover:from-teal-100 hover:to-cyan-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-teal-200"
                    >
                      <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">Agent Panel</h3>
                        <p className="text-sm text-gray-600">Your assignments</p>
                      </div>
                    </a>
                  )}

                  {user?.publicMetadata?.role === 'admin' && (
                    <a 
                      href="/dashboard/admin" 
                      className="group flex items-center p-6 bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl hover:from-purple-100 hover:to-violet-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-purple-200"
                    >
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">Admin Panel</h3>
                        <p className="text-sm text-gray-600">System configuration</p>
                      </div>
                    </a>
                  )}

                  <a 
                    href="/dashboard/review" 
                    className="group flex items-center p-6 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl hover:from-indigo-100 hover:to-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-indigo-200"
                  >
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">Review Center</h3>
                      <p className="text-sm text-gray-600">Upload documents</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Recent Bookings */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Shipments</h2>
              
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg mb-4">No shipments yet</p>
                  <a 
                    href="/quote" 
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 transform shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create your first shipment
                  </a>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 font-bold text-gray-900">Tracking #</th>
                        <th className="text-left py-4 px-4 font-bold text-gray-900">Status</th>
                        <th className="text-left py-4 px-4 font-bold text-gray-900">Carrier</th>
                        <th className="text-left py-4 px-4 font-bold text-gray-900">Route</th>
                        <th className="text-left py-4 px-4 font-bold text-gray-900">Cost</th>
                        <th className="text-left py-4 px-4 font-bold text-gray-900">Date</th>
                        <th className="text-left py-4 px-4 font-bold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 10).map((booking) => (
                        <tr key={booking.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200">
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">{booking.trackingNumber}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                              {booking.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-700">{booking.carrier}</td>
                          <td className="py-4 px-4 text-sm text-gray-700">{booking.route}</td>
                          <td className="py-4 px-4 text-sm font-semibold text-gray-900">${booking.totalPrice.toFixed(2)}</td>
                          <td className="py-4 px-4 text-sm text-gray-700">{new Date(booking.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-4">
                            <a 
                              href={`/tracking/${booking.trackingNumber}`}
                              className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors duration-200"
                            >
                              Track
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
