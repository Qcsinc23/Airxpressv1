// app/components/ui/Header.tsx
'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useCartSummary } from '../../lib/hooks/useCart';

export default function Header() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartSummary } = useCartSummary();

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AirXpress
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/quote"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 hover:scale-105 transform"
            >
              Get Quote
            </Link>
            <Link
              href="/tracking"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 hover:scale-105 transform"
            >
              Track Shipment
            </Link>
            <Link
              href="/store"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 hover:scale-105 transform"
            >
              Store
            </Link>
            {isSignedIn && (
              <>
                <Link
                  href="/store/cart"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 hover:scale-105 transform flex items-center relative"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H3m0 0v2M7 13v7a2 2 0 002 2h6a2 2 0 002-2v-7m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.1" />
                  </svg>
                  Cart
                  {cartSummary.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                      {cartSummary.itemCount > 9 ? '9+' : cartSummary.itemCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 hover:scale-105 transform"
                >
                  Dashboard
                </Link>
              </>
            )}
          </nav>

          {/* Authentication & Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Ship Button - Always visible */}
            <Link 
              href="/quote" 
              className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 transform shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Ship Now
            </Link>

            {/* Authentication Buttons */}
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <div className="flex items-center space-x-3">
                    {/* Welcome text for larger screens */}
                    <span className="hidden lg:block text-sm text-gray-600">
                      Welcome, <span className="font-semibold text-gray-900">{user.firstName || user.emailAddresses[0]?.emailAddress}</span>
                    </span>
                    
                    {/* User Button with custom styling */}
                    <div className="relative">
                      <UserButton 
                        appearance={{
                          elements: {
                            avatarBox: "w-10 h-10 border-2 border-white shadow-lg hover:scale-110 transition-transform duration-200",
                            userButtonPopoverCard: "bg-white/90 backdrop-blur-lg border border-white/20 shadow-2xl rounded-xl",
                            userButtonPopoverActionButton: "hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          }
                        }}
                        showName={false}
                        afterSignOutUrl="/"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    {/* Sign In Button */}
                    <SignInButton mode="modal">
                      <button className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-105 transform">
                        Sign In
                      </button>
                    </SignInButton>
                    
                    {/* Sign Up Button */}
                    <SignUpButton mode="modal">
                      <button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 transform shadow-lg hover:shadow-xl">
                        Create Account
                      </button>
                    </SignUpButton>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/90 backdrop-blur-lg border-t border-gray-200 py-4 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/quote"
                className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Quote
              </Link>
              <Link
                href="/tracking"
                className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Track Shipment
              </Link>
              <Link
                href="/store"
                className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Store
              </Link>
              {isSignedIn && (
                <>
                  <Link
                    href="/store/cart"
                    className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center relative"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H3m0 0v2M7 13v7a2 2 0 002 2h6a2 2 0 002-2v-7m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.1" />
                    </svg>
                    Cart
                    {cartSummary.itemCount > 0 && (
                      <span className="ml-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                        {cartSummary.itemCount > 9 ? '9+' : cartSummary.itemCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </>
              )}
              
              {/* Mobile Ship Now button */}
              <Link 
                href="/quote" 
                className="mx-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all duration-200 shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ship Now
              </Link>

              {/* Mobile Authentication */}
              {isLoaded && !isSignedIn && (
                <div className="flex flex-col space-y-2 mx-4 mt-4 pt-4 border-t border-gray-200">
                  <SignInButton mode="modal">
                    <button className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-left">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-6 py-2 rounded-xl font-semibold text-center transition-all duration-200 shadow-lg">
                      Create Account
                    </button>
                  </SignUpButton>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}