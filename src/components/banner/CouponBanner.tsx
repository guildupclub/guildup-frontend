"use client";
import React, { useState, useEffect } from "react";
import { Zap, Clock, Star, Gift } from "lucide-react";

const CouponBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner after a short delay
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed top-16 z-40 w-full overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 transition-all duration-700 transform ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white/5 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-white/8 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 px-2 sm:px-4 py-2 sm:py-3">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          {/* Center content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3">
              {/* Left side - Icon and urgency */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Gift className="w-5 h-5 text-yellow-300 animate-bounce" />
                  <Star className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full border border-orange-400/30">
                  <Clock className="w-3 h-3 text-orange-200" />
                  <span className="text-orange-100 text-xs font-bold">LIMITED TIME!</span>
                </div>
              </div>

              {/* Center - Main message */}
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">
                  Use coupon code 
                </span>
                <div className="relative">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg border-2 border-yellow-300 animate-pulse">
                    GUILD100
                  </span>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-white font-semibold text-sm">
                  for 
                </span>
                <span className="bg-green-500 text-white px-2 py-1 rounded font-bold text-sm animate-pulse">
                  100% OFF
                </span>
                <span className="text-white font-semibold text-sm">
                  on your first 3 bookings!
                </span>
              </div>

              {/* Right side - Additional urgency */}
              <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-full border border-emerald-400/30">
                <Zap className="w-3 h-3 text-emerald-200" />
                <span className="text-emerald-100 text-xs font-bold">HOT DEAL!</span>
              </div>
            </div>
          </div>

          {/* Right side - T&C */}
          <div className="text-white/70 text-xs font-medium ml-4">
            T&C Apply
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden px-1">
          {/* Single row horizontal layout */}
          <div className="flex items-center justify-between gap-1">
            {/* Left side - Icon and urgency */}
            <div className="flex items-center gap-1">
              <div className="relative">
                <Gift className="w-4 h-4 text-yellow-300 animate-bounce" />
                <Star className="w-2 h-2 text-yellow-400 absolute -top-0.5 -right-0.5 animate-pulse" />
              </div>
              <div className="flex items-center gap-1 bg-orange-500/20 px-1 py-0.5 rounded-full border border-orange-400/30">
                <Clock className="w-2 h-2 text-orange-200" />
                <span className="text-orange-100 text-xs font-bold">LIMITED!</span>
              </div>
            </div>

            {/* Center - Main message */}
            <div className="flex items-center gap-1 flex-1 justify-center">
              <span className="text-white font-semibold text-xs">
                Use 
              </span>
              <div className="relative">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-1.5 py-0.5 rounded font-bold text-xs shadow-lg border border-yellow-300 animate-pulse">
                  GUILD100
                </span>
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-white font-semibold text-xs">
                for 
              </span>
              <span className="bg-green-500 text-white px-1 py-0.5 rounded font-bold text-xs animate-pulse">
                100% OFF
              </span>
            </div>

            {/* Right side - Urgency and T&C */}
            <div className="flex items-center gap-1">
              <span className="text-white/70 text-xs font-medium">T&C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced decorative borders */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400"></div>
    </div>
  );
};

export default CouponBanner; 