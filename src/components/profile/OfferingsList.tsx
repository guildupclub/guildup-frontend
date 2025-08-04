"use client";

import React, { useState } from "react";
import { Share, Phone, Calendar, Clock, Shield, CheckCircle, ArrowUp } from "lucide-react";
import { useRouter } from 'next/navigation';

interface Offering {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  price?: {
    amount: number;
    currency: string;
  } | number;
  discounted_price?: string | number;
  when?: Date;
  duration?: number;
  is_free?: boolean;
  tags?: string[];
  rating?: number;
  total_ratings?: number;
  features?: string[];
  community_id?: string;
  provider_id?: string;
}

interface OfferingsListProps {
  offerings?: Offering[];
}

const getOfferingIcon = (type: string) => {
  const iconClass = "w-6 h-6";
  
  switch (type.toLowerCase()) {
    case 'consultation':
      return (
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <svg className={`${iconClass} text-primary`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      );
    case 'webinar':
      return (
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <svg className={`${iconClass} text-primary`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      );
    case 'package':
      return (
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <svg className={`${iconClass} text-primary`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M7.5 7.5V6c0-1.1.9-2 2-2h5c1.1 0 2 .9 2 2v1.5h2.5c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-13c-.83 0-1.5-.67-1.5-1.5V9c0-.83.67-1.5 1.5-1.5H7.5z"/>
          </svg>
        </div>
      );
    case 'class':
      return (
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <svg className={`${iconClass} text-primary`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <svg className={`${iconClass} text-primary`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      );
  }
};

const formatPrice = (offering: Offering) => {
  const discountedPrice = offering.discounted_price;
  const price = offering.price;
  
  if (offering.is_free) {
    return { current: 'Free', original: null };
  }
  
  let currentPrice = '0';
  let originalPrice = null;
  
  if (discountedPrice) {
    currentPrice = typeof discountedPrice === 'string' ? discountedPrice : discountedPrice.toString();
    if (price) {
      originalPrice = typeof price === 'number' ? price.toString() : price.amount?.toString() || '0';
    }
  } else if (price) {
    currentPrice = typeof price === 'number' ? price.toString() : price.amount?.toString() || '0';
  }
  
  return { current: currentPrice, original: originalPrice };
};

export function OfferingsList({ offerings }: OfferingsListProps) {
  const router = useRouter();
  const displayOfferings = offerings && offerings.length > 0 ? offerings : [];

  const handleBookingClick = (offering: Offering, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/community/${offering.community_id}/offerings/${offering._id}`);
  };

  const handleViewAllOfferings = () => {
    if (offerings && offerings.length > 0) {
      const communityId = offerings[0].community_id;
      router.push(`/community/${communityId}/offerings`);
    }
  };



  return (
    <div className="max-w-7xl mx-auto p-8">
             {/* Header */}
       <div className="text-center mb-12">
         <h2 className="text-2xl font-bold text-gray-800 mb-2">My Offerings</h2>
         <h3 className="text-3xl font-bold text-primary mb-6">Choose your Transformation Journey</h3>
         {offerings && offerings.length > 0 && (
           <Button 
             onClick={handleViewAllOfferings}
             variant="outline"
             className="mt-4"
           >
             View All Community Offerings
           </Button>
         )}
       </div>

      {/* Loading State */}
      {!offerings && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offerings...</p>
        </div>
      )}

      {/* Empty State */}
      {offerings && offerings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Offerings Available</h3>
          <p className="text-gray-600">This community hasn't created any offerings yet.</p>
        </div>
      )}

      {/* Offerings Grid */}
      {displayOfferings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayOfferings.map((offering) => {
            const { current: currentPrice, original: originalPrice } = formatPrice(offering);
            const shortId = offering._id.slice(-5); // Get last 5 characters for short ID
            
            return (
              <div key={offering._id} className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Header with Icon and Title */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    {getOfferingIcon(offering.type || 'consultation')}
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">{offering.type?.toUpperCase() || 'OFFERING'}</div>
                      <div className="text-xs text-gray-400 font-mono">{shortId}</div>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{offering.title}</h4>
                  
                  {/* Price Display */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹ {currentPrice}
                    </span>
                    {originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        ₹ {originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="p-6 border-b border-gray-100">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {offering.description || 'Professional consultation tailored to your needs'}
                  </p>
                  
                  {/* What's Included */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800 mb-3">What's included:</h5>
                    <div className="space-y-2">
                      {offering.features && offering.features.length > 0 ? (
                        offering.features.slice(0, 5).map((feature, index) => (
                                                  <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-gray-600">Professional consultation</span>
                      </div>
                    )}
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created date</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Duration</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                    <span>June 25, 2025</span>
                    <span>{offering.duration || 30} mins</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6">
                  <div className="flex gap-3 mb-4">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 border border-primary/20 text-primary rounded-lg hover:bg-primary/5 transition-colors flex-1 text-sm font-medium">
                      <ArrowUp className="w-4 h-4" />
                      Share Link
                    </button>
                    <button 
                      onClick={(e) => handleBookingClick(offering, e)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex-1 text-sm font-medium"
                    >
                      <Phone className="w-4 h-4" />
                      Quick Explore Call
                    </button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Certified Expert</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>Secure payment</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>24/7 support</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
} 