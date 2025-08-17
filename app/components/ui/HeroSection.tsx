// app/components/ui/HeroSection.tsx
'use client';

import React from 'react';
import Image from 'next/image';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  backgroundImage?: string;
  heroImage?: string;
  className?: string;
}

export default function HeroSection({
  title = "Fast, Reliable Shipping to the Caribbean",
  subtitle = "Ship your cargo with confidence. Track every step. Delivered on time.",
  ctaText = "Get Quote",
  ctaHref = "/quote",
  backgroundImage = "/hero-bg.jpg",
  heroImage = "/hero-transparent.png",
  className = ""
}: HeroSectionProps) {
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {/* Background Layer with Overlay */}
      <div className="absolute inset-0 z-0">
        {backgroundImage && (
          <Image
            src={backgroundImage}
            alt="Shipping background"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        )}
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/50 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <div className="text-white space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-lg leading-relaxed">
              {subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href={ctaHref}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-blue-500/25"
              >
                {ctaText}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              
              <a
                href="/tracking"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                Track Shipment
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 flex items-center space-x-8 text-blue-200">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Insured Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Real-time Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image with Professional Transparency Effects */}
          <div className="relative lg:order-last">
            {heroImage && (
              <div className="relative">
                {/* Main Hero Image with Transparency Support */}
                <div className="relative w-full aspect-square max-w-lg mx-auto">
                  <Image
                    src={heroImage}
                    alt="Airxpress shipping hero"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                    quality={100}
                  />
                  
                  {/* Subtle glow effect behind transparent image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-blue-600/20 rounded-full blur-3xl -z-10 scale-110" />
                </div>

                {/* Floating Elements for Visual Enhancement */}
                <div className="absolute top-10 -left-4 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl opacity-80 animate-float shadow-2xl" />
                <div className="absolute bottom-20 -right-6 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl opacity-70 animate-float-delayed shadow-xl" />
                <div className="absolute top-1/3 -right-8 w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg opacity-60 animate-pulse shadow-lg" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom wave divider for seamless section transition */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}