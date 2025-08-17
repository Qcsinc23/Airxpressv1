// app/page.tsx
import Link from 'next/link';
import Header from './components/ui/Header';
import HeroSection from './components/ui/HeroSection';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Professional Hero Section with Transparency Effects */}
      <HeroSection
        title="Express Air Shipping to the Caribbean"
        subtitle="Fast, reliable air shipping from New Jersey to Guyana, Trinidad, Jamaica, Barbados, and Puerto Rico. Same-day pickup, next-day delivery."
        ctaText="Get Instant Quote"
        ctaHref="/quote"
        backgroundImage="/hero-bg.jpg"
        heroImage="/hero-transparent.png"
      />

      {/* Content Container for remaining sections */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        </div>

          <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              Same-Day Pickup
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Schedule pickup today before 2 PM ET for same-day service to the airport.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              Next-Day Delivery
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Your packages arrive at Caribbean destinations within 24 hours.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              Real-Time Tracking
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Track your shipment every step of the way with live status updates.
            </p>
          </div>
        </div>

        {/* Destinations */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              We Serve the Caribbean
            </span>
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Express shipping to major destinations across the Caribbean islands
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { name: 'Guyana', code: 'GUY', airport: 'Georgetown', flag: '🇬🇾', color: 'from-green-500 to-yellow-500' },
              { name: 'Trinidad', code: 'TTO', airport: 'Port of Spain', flag: '🇹🇹', color: 'from-red-500 to-blue-500' },
              { name: 'Jamaica', code: 'JAM', airport: 'Kingston', flag: '🇯🇲', color: 'from-green-500 to-yellow-500' },
              { name: 'Barbados', code: 'BAR', airport: 'Bridgetown', flag: '🇧🇧', color: 'from-blue-500 to-yellow-500' },
              { name: 'Puerto Rico', code: 'PRI', airport: 'San Juan', flag: '🇵🇷', color: 'from-red-500 to-blue-500' },
            ].map((destination) => (
              <div key={destination.code} className="group bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className={`w-12 h-12 bg-gradient-to-r ${destination.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{destination.flag}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">{destination.name}</h3>
                <p className="text-sm text-gray-600 font-medium">{destination.airport}</p>
                <p className="text-xs text-gray-500 mt-1 font-mono">{destination.code}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Ready to Ship?
            </h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Get your instant quote and book your shipment in minutes. Fast, reliable, and affordable.
            </p>
            <Link 
              href="/quote"
              className="inline-flex items-center bg-white hover:bg-gray-100 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Shipping Now
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-16 mt-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  AirXpress
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                Express air shipping to the Caribbean. Fast, reliable, and affordable service 
                connecting New Jersey to major Caribbean destinations.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors duration-200 hover:scale-110 transform">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center transition-colors duration-200 hover:scale-110 transform">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors duration-200 hover:scale-110 transform">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zm0 21.582c-5.291 0-9.595-4.304-9.595-9.595 0-5.291 4.304-9.595 9.595-9.595 5.291 0 9.595 4.304 9.595 9.595 0 5.291-4.304 9.595-9.595 9.595z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Services</h4>
              <ul className="space-y-3">
                <li><Link href="/quote" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group">
                  <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Get Quote
                </Link></li>
                <li><Link href="/tracking" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group">
                  <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Track Shipment
                </Link></li>
                <li><Link href="/store" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group">
                  <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Store
                </Link></li>
                <li><Link href="/dashboard" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group">
                  <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Dashboard
                </Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Contact & Support</h4>
              <div className="space-y-4">
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>(201) 555-0100</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>support@airxpress.com</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Newark, New Jersey</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 AirXpress LLC. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}