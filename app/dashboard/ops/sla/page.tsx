// app/dashboard/ops/sla/page.tsx
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

export default function SLADashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'breaches' | 'metrics' | 'templates'>('breaches');

  // Check if user has ops/admin access
  const hasOpsAccess = user?.publicMetadata?.role === 'ops' || user?.publicMetadata?.role === 'admin';

  // TODO: Implement SLA functions when available
  // Placeholder data for demonstration - replace when api.sla functions are implemented
  const activeBreaches: any[] = [];
  const slaMetrics: any[] = [];

  // Placeholder mutation
  const resolveBreach = async (args: any) => {
    console.warn('SLA breach resolution not implemented - SLA functions not available');
    alert('SLA functionality is not yet implemented');
  };

  const handleResolveBreach = async (breachId: string, resolution: string) => {
    if (!user) return;
    
    try {
      await resolveBreach({
        breachId,
        resolvedBy: user.id,
        resolution,
      });
    } catch (error) {
      console.error('Failed to resolve breach:', error);
      alert('Failed to resolve breach');
    }
  };

  if (!hasOpsAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view SLA dashboard.</p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SLA Dashboard</h1>
          <p className="text-gray-600">Monitor service level agreements and performance metrics</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {activeBreaches.filter(b => !b.resolved).length}
                </p>
                <p className="text-sm text-gray-600">Active Breaches</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {activeBreaches.filter(b => b.severity === 'critical' && !b.resolved).length}
                </p>
                <p className="text-sm text-gray-600">Critical Breaches</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {slaMetrics.length > 0 ? 
                    Math.round(slaMetrics.reduce((acc, m) => acc + m.complianceRate, 0) / slaMetrics.length) 
                    : 0}%
                </p>
                <p className="text-sm text-gray-600">Compliance Rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {slaMetrics.length > 0 ? 
                    Math.round(slaMetrics.reduce((acc, m) => acc + m.averageResponseTime, 0) / slaMetrics.length) 
                    : 0}
                </p>
                <p className="text-sm text-gray-600">Avg Response (min)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('breaches')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'breaches'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Active Breaches ({activeBreaches.filter(b => !b.resolved).length})
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'metrics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Performance Metrics
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                SLA Templates
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'breaches' && (
              <div className="space-y-4">
                {activeBreaches.filter(breach => !breach.resolved).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="text-gray-600">No active SLA breaches</p>
                    <p className="text-sm text-gray-500 mt-1">Great job maintaining service levels!</p>
                  </div>
                ) : (
                  activeBreaches
                    .filter(breach => !breach.resolved)
                    .map((breach) => (
                      <div key={breach._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(breach.severity)}`}>
                              {breach.severity.toUpperCase()}
                            </span>
                            <h4 className="font-semibold text-gray-900">{breach.templateName}</h4>
                            <span className="text-sm text-gray-500">#{breach.booking?._id}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-red-600">
                              {breach.hoursOverdue}h overdue
                            </p>
                            <p className="text-xs text-gray-500">
                              Escalation Level: {breach.escalationLevel}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              <strong>Type:</strong> {breach.type}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Deadline:</strong> {new Date(breach.deadline).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Breached:</strong> {new Date(breach.breachedAt).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <strong>Contact:</strong> {breach.booking?.pickupDetails?.contact || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Address:</strong> {breach.booking?.pickupDetails?.address || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Resolution notes..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                  handleResolveBreach(breach._id, input.value);
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              const input = document.querySelector(`input[placeholder="Resolution notes..."]`) as HTMLInputElement;
                              if (input?.value.trim()) {
                                handleResolveBreach(breach._id, input.value);
                                input.value = '';
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {activeTab === 'metrics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
                {slaMetrics.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-gray-600">No metrics data available</p>
                    <p className="text-sm text-gray-500 mt-1">Metrics will appear as SLA commitments are processed</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {slaMetrics.map((metric, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900">{metric.date}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              metric.complianceRate >= 95 ? 'bg-green-100 text-green-800' :
                              metric.complianceRate >= 85 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {metric.complianceRate}% compliant
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Total: {metric.totalCommitments} | Met: {metric.metCommitments} | Breached: {metric.breachedCommitments}</p>
                            <p>Avg Response: {metric.averageResponseTime} minutes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'templates' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Templates Configuration</h3>
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">⚙️</div>
                  <p className="text-gray-600">SLA Templates Management</p>
                  <p className="text-sm text-gray-500 mt-1">Template configuration interface coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}