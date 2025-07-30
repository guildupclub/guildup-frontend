"use client";

import React from "react";
import { Phone } from "lucide-react";

interface CallToActionBannerProps {
  onQuickExploreCall?: () => void;
}

export function CallToActionBanner({ onQuickExploreCall }: CallToActionBannerProps) {
  const handleCallClick = () => {
    if (onQuickExploreCall) {
      onQuickExploreCall();
    }
    // Default behavior - could scroll to booking section or open a modal
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="relative bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 rounded-2xl p-12 overflow-hidden">
        {/* Background Phone Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <svg 
            className="w-96 h-96 text-white transform -rotate-12" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </div>

        {/* Content */}
        <div className="relative text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Not sure which offering is
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold mb-8">
            right for you?
          </h3>
          
          <button 
            onClick={handleCallClick}
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            <Phone className="w-5 h-5" />
            Quick Explore Call
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-8 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-6 right-12 w-16 h-16 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 right-8 w-12 h-12 bg-white/10 rounded-full"></div>
      </div>
    </div>
  );
} 