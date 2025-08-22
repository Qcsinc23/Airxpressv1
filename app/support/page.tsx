// app/support/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Header from '../components/ui/Header';
import Breadcrumb from '../components/ui/Breadcrumb';

// Force dynamic rendering for pages that use authentication
export const dynamic = 'force-dynamic';

interface ClerkUser {
  fullName?: string | null;
  emailAddresses?: Array<{ emailAddress: string }>;
}

export default function SupportPage() {
  // Initialize user as null, will be populated after component mounts
  const [user, setUser] = useState<ClerkUser | null>(null);
  const [clerkLoaded, setClerkLoaded] = useState(false);

  // Safely load user data after component mounts
  useEffect(() => {
    // Only try to load Clerk on the client side
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      // Note: We can't use useUser hook here as it needs to be at the top level
      // Instead, we'll handle this gracefully without user data prefill
      setClerkLoaded(true);
    } else {
      setClerkLoaded(true);
    }
  }, []);

  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    phone: '',
    subject: '',
    message: '',
    urgent: false,
    bookingId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // TODO: Implement email service integration
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: user?.fullName || '',
          email: user?.emailAddresses?.[0]?.emailAddress || '',
          phone: '',
          subject: '',
          message: '',
          urgent: false,
          bookingId: '',
        });
      } else {
        throw new Error('Failed to submit support request');
      }
    } catch (error) {
      console.error('Support form error:', error);
      alert('Failed to submit request. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (submitted) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted</h1>
                <p className="text-gray-600 mb-6">
                  Thank you for contacting us. We've received your support request and will respond within 24 hours.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  For urgent matters, please call us directly at <span className="font-semibold">201-249-0929</span>
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const supportBreadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Support', href: '/support' }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumb Navigation */}
          <Breadcrumb 
            items={supportBreadcrumbs} 
            className="mb-8"
          />

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Our Support Team</h1>
            <p className="text-xl text-gray-600">We're here to help with your shipping needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* 24/7 Phone Support */}
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-2xl font-bold text-blue-600 mb-2">201-249-0929</p>
            <p className="text-sm text-gray-600">Available 24/7 for urgent matters</p>
          </div>

          {/* Email Support */}
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm font-medium text-green-600 mb-2 break-all">support@cargoexpressnj.com</p>
            <p className="text-sm text-gray-600">Response within 24 hours</p>
          </div>

          {/* Live Chat */}
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-lg font-medium text-purple-600 mb-2">Coming Soon</p>
            <p className="text-sm text-gray-600">Real-time assistance</p>
          </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking ID (if applicable)
                </label>
                <input
                  type="text"
                  name="bookingId"
                  value={formData.bookingId}
                  onChange={handleInputChange}
                  placeholder="BOOK_..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a subject</option>
                <option value="booking-help">Booking Assistance</option>
                <option value="document-upload">Document Upload Issues</option>
                <option value="payment-issue">Payment Problems</option>
                <option value="tracking">Tracking & Status Updates</option>
                <option value="pricing">Pricing Questions</option>
                <option value="packaging">Packaging Services</option>
                <option value="complaint">Complaint</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe your question or issue in detail..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="urgent"
                checked={formData.urgent}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                This is urgent (we'll prioritize your request)
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Submitting...' : 'Send Message'}
            </button>
          </form>
          </div>
        </div>
      </div>
    </>
  );
}
