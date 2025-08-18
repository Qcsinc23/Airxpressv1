// app/dashboard/agent/setup/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

export default function AgentSetupPage() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    coverage: {
      states: ['NJ'] as string[],
      zipcodes: [] as string[],
      maxRadius: 50,
      homeBase: {
        address: '',
        lat: 0,
        lng: 0,
      },
    },
    capacity: {
      maxActiveBookings: 10,
      specializations: [] as string[],
    },
    contact: {
      phone: user?.primaryPhoneNumber?.phoneNumber || '',
      whatsapp: '',
      email: user?.emailAddresses?.[0]?.emailAddress || '',
    },
    schedule: {
      timezone: 'America/New_York',
      workingHours: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
      },
      unavailableDates: [] as string[],
    },
  });

  const [saving, setSaving] = useState(false);
  const [zipCodeInput, setZipCodeInput] = useState('');

  // TODO: Implement agent profile creation when agent functions are available
  const createAgentProfile = async (args: any) => {
    console.warn('Agent profile creation not implemented - agent functions not available');
    throw new Error('Agent profile creation functionality is not yet implemented');
  };

  const stateOptions = [
    'NJ', 'NY', 'CT', 'PA', 'DE', 'MD', 'MA', 'RI', 'VT', 'NH', 'ME'
  ];

  const specializationOptions = [
    'hazmat', 'fragile', 'oversized', 'temperature-controlled', 'express', 'white-glove'
  ];

  const handleStateChange = (state: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      coverage: {
        ...prev.coverage,
        states: checked
          ? [...prev.coverage.states, state]
          : prev.coverage.states.filter(s => s !== state)
      }
    }));
  };

  const handleSpecializationChange = (spec: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      capacity: {
        ...prev.capacity,
        specializations: checked
          ? [...prev.capacity.specializations, spec]
          : prev.capacity.specializations.filter(s => s !== spec)
      }
    }));
  };

  const addZipCode = () => {
    if (zipCodeInput && !formData.coverage.zipcodes.includes(zipCodeInput)) {
      setFormData(prev => ({
        ...prev,
        coverage: {
          ...prev.coverage,
          zipcodes: [...prev.coverage.zipcodes, zipCodeInput]
        }
      }));
      setZipCodeInput('');
    }
  };

  const removeZipCode = (zipCode: string) => {
    setFormData(prev => ({
      ...prev,
      coverage: {
        ...prev.coverage,
        zipcodes: prev.coverage.zipcodes.filter(z => z !== zipCode)
      }
    }));
  };

  const handleWorkingHoursChange = (day: string, field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        workingHours: {
          ...prev.schedule.workingHours,
          [day]: prev.schedule.workingHours[day as keyof typeof prev.schedule.workingHours]
            ? { ...prev.schedule.workingHours[day as keyof typeof prev.schedule.workingHours], [field]: value }
            : { start: field === 'start' ? value : '09:00', end: field === 'end' ? value : '17:00' }
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (formData.coverage.states.length === 0) {
      alert('Please select at least one state');
      return;
    }
    
    if (!formData.coverage.homeBase.address) {
      alert('Please enter your home base address');
      return;
    }

    setSaving(true);
    
    try {
      await createAgentProfile({
        userId: user.id as Id<"users">,
        ...formData,
      });
      
      // Redirect to agent dashboard
      window.location.href = '/dashboard/agent';
    } catch (error) {
      console.error('Failed to create agent profile:', error);
      alert('Failed to create agent profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Agent Profile Setup</h1>
          <p className="text-gray-600 mb-8">
            Complete your agent profile to start receiving booking assignments.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Coverage Area */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Area</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    States You Cover
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {stateOptions.map(state => (
                      <label key={state} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.coverage.states.includes(state)}
                          onChange={(e) => handleStateChange(state, e.target.checked)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{state}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific ZIP Codes (Optional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={zipCodeInput}
                      onChange={(e) => setZipCodeInput(e.target.value)}
                      placeholder="Enter ZIP code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addZipCode}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.coverage.zipcodes.map(zip => (
                      <span
                        key={zip}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {zip}
                        <button
                          type="button"
                          onClick={() => removeZipCode(zip)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Travel Radius (miles)
                  </label>
                  <input
                    type="number"
                    value={formData.coverage.maxRadius}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coverage: { ...prev.coverage, maxRadius: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Home Base Address *
                  </label>
                  <textarea
                    value={formData.coverage.homeBase.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coverage: {
                        ...prev.coverage,
                        homeBase: { ...prev.coverage.homeBase, address: e.target.value }
                      }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your main pickup/office address"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Specializations */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity & Specializations</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Active Bookings
                  </label>
                  <input
                    type="number"
                    value={formData.capacity.maxActiveBookings}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      capacity: { ...prev.capacity, maxActiveBookings: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specializations (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {specializationOptions.map(spec => (
                      <label key={spec} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.capacity.specializations.includes(spec)}
                          onChange={(e) => handleSpecializationChange(spec, e.target.checked)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {spec.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.whatsapp}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, whatsapp: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h3>
              
              <div className="space-y-3">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-20">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {day.slice(0, 3)}
                      </span>
                    </div>
                    <input
                      type="time"
                      value={formData.schedule.workingHours[day as keyof typeof formData.schedule.workingHours]?.start || ''}
                      onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={formData.schedule.workingHours[day as keyof typeof formData.schedule.workingHours]?.end || ''}
                      onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {saving ? 'Creating Profile...' : 'Create Agent Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}