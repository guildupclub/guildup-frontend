"use client";
import React, { useState, useEffect } from "react";
import { Clock, Zap, Star, Users } from "lucide-react";

interface PromotionalBannerProps {
  originalPrice: number;
  discountedPrice: number;
  limitedSlots: number;
  offeringId: string;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  originalPrice,
  discountedPrice,
  limitedSlots,
  offeringId,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedPrice, setAnimatedPrice] = useState(originalPrice);
  const [slotsLeft, setSlotsLeft] = useState(limitedSlots);

  // Show banner only for the specific offering
  const eligibleOfferingIds = [
    "687135a760c4b417811f345e",
    "688088d8db6573f8f8b68bd3" // Specific offering from guildup.club
  ];
  
  // Show banner only if offering ID matches the specific promotional offering
  const shouldShowBanner = eligibleOfferingIds.includes(offeringId);

  useEffect(() => {
    if (!shouldShowBanner) return;

    // Entrance animation
    const timer = setTimeout(() => setIsVisible(true), 500);

    // Price drop animation
    const priceAnimationTimer = setTimeout(() => {
      const steps = 20;
      const decrement = (originalPrice - discountedPrice) / steps;
      let currentPrice = originalPrice;
      let step = 0;

      const priceInterval = setInterval(() => {
        if (step < steps) {
          currentPrice -= decrement;
          setAnimatedPrice(Math.round(currentPrice));
          step++;
        } else {
          setAnimatedPrice(discountedPrice);
          clearInterval(priceInterval);
        }
      }, 50);
    }, 1000);

    // Slots countdown simulation (optional - you can remove this if you have real data)
    const slotsTimer = setInterval(() => {
      setSlotsLeft((prev) => {
        if (prev > 1) {
          return Math.max(1, prev - Math.floor(Math.random() * 2));
        }
        return prev;
      });
    }, 30000); // Decrease every 30 seconds

    return () => {
      clearTimeout(timer);
      clearTimeout(priceAnimationTimer);
      clearInterval(slotsTimer);
    };
  }, [originalPrice, discountedPrice, shouldShowBanner, offeringId]);

  if (!shouldShowBanner) return null;


  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r from-primary/90 via-blue-600 to-primary/80 rounded-xl shadow-lg transition-all duration-700 transform ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 px-3 py-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Limited Time Offer Label */}
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-300 animate-bounce" />
            <span className="text-yellow-300 font-bold text-xs uppercase tracking-wide">
              Limited Time Offer
            </span>
          </div>

          {/* Horizontal Price Section */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {/* Original Price */}
            <div className="text-center">
              <span className="text-white/70 text-xs line-through">
                ₹{999}
              </span>
            </div>

            {/* Arrow */}
            <div className="text-white animate-pulse text-xs">
              →
            </div>

            {/* Discounted Price - Highlighted */}
            <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1 border border-yellow-400 pb-1">
              <div className="text-white text-base font-bold">
                ₹{animatedPrice.toLocaleString("en-IN")}
                {animatedPrice !== discountedPrice && (
                  <span className="inline-block ml-1 animate-spin text-xs">⬇️</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 animate-pulse"></div>
    </div>
  );
};

export default PromotionalBanner; 