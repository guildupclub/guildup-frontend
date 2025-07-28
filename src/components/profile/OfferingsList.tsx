"use client";

import React from "react";
import { Share, Phone, Calendar, Clock, Shield, CheckCircle } from "lucide-react";

interface Offering {
  _id: string;
  title: string;
  description: string;
  type: string;
  price: {
    amount: number;
    currency: string;
  };
  discounted_price?: string;
  when: Date;
  duration: number;
  is_free: boolean;
  tags: string[];
  rating?: number;
  total_ratings?: number;
  features?: string[];
}

interface OfferingsListProps {
  offerings?: Offering[];
}

const mockOfferings: Offering[] = [
  {
    _id: "1",
    title: "Consultation",
    description: "Discovery Call on the topic of Future Investments",
    type: "consultation",
    price: { amount: 800, currency: "INR" },
    is_free: true,
    when: new Date("2025-06-25"),
    duration: 30,
    tags: [],
    features: [
      "Personalized study strategies",
      "Time management techniques", 
      "Academic stress management",
      "Goal setting and planning",
      "Career guidance"
    ]
  },
  {
    _id: "2", 
    title: "Webinar",
    description: "Discovery Call on the topic of Future Investments",
    type: "webinar",
    price: { amount: 1500, currency: "INR" },
    discounted_price: "1000",
    is_free: false,
    when: new Date("2025-06-25"),
    duration: 30,
    tags: [],
    features: [
      "Personalized study strategies",
      "Time management techniques",
      "Academic stress management", 
      "Goal setting and planning",
      "Career guidance"
    ]
  },
  {
    _id: "3",
    title: "Package", 
    description: "Discovery Call on the topic of Future Investments",
    type: "package",
    price: { amount: 800, currency: "INR" },
    is_free: true,
    when: new Date("2025-06-25"),
    duration: 30,
    tags: [],
    features: [
      "Personalized study strategies",
      "Time management techniques",
      "Academic stress management",
      "Goal setting and planning", 
      "Career guidance"
    ]
  },
  {
    _id: "4",
    title: "Class",
    description: "Discovery Call on the topic of Future Investments", 
    type: "class",
    price: { amount: 800, currency: "INR" },
    is_free: true,
    when: new Date("2025-06-25"),
    duration: 30,
    tags: [],
    features: [
      "Personalized study strategies",
      "Time management techniques",
      "Academic stress management",
      "Goal setting and planning",
      "Career guidance"
    ]
  },
  {
    _id: "5",
    title: "Webinar",
    description: "Discovery Call on the topic of Future Investments",
    type: "webinar", 
    price: { amount: 1500, currency: "INR" },
    discounted_price: "1000",
    is_free: false,
    when: new Date("2025-06-25"),
    duration: 30,
    tags: [],
    features: [
      "Personalized study strategies",
      "Time management techniques",
      "Academic stress management",
      "Goal setting and planning",
      "Career guidance"
    ]
  },
  {
    _id: "6",
    title: "Package",
    description: "Discovery Call on the topic of Future Investments",
    type: "package",
    price: { amount: 800, currency: "INR" },
    is_free: true,
    when: new Date("2025-06-25"),
    duration: 30,
    tags: [],
    features: [
      "Personalized study strategies",
      "Time management techniques", 
      "Academic stress management",
      "Goal setting and planning",
      "Career guidance"
    ]
  }
];

const getOfferingIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'consultation':
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      );
    case 'webinar':
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5l-1 2v1h8v-1l-1-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-10 2.5V7c0 .55-.45 1-1 1s-1-.45-1-1V5.5c0-.55.45-1 1-1s1 .45 1 1zm0 4V11c0 .55-.45 1-1 1s-1-.45-1-1V9.5c0-.55.45-1 1-1s1 .45 1 1z"/>
          </svg>
        </div>
      );
    case 'package':
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7.5 7.5V6c0-1.1.9-2 2-2h5c1.1 0 2 .9 2 2v1.5h2.5c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-13c-.83 0-1.5-.67-1.5-1.5V9c0-.83.67-1.5 1.5-1.5H7.5z"/>
          </svg>
        </div>
      );
    case 'class':
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      );
  }
};

export function OfferingsList({ offerings = mockOfferings }: OfferingsListProps) {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Offerings</h2>
        <h3 className="text-3xl font-bold text-blue-600 mb-6">Choose your Transformation Journey</h3>
      </div>

      {/* Offerings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offerings.map((offering) => (
          <div key={offering._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            {/* Header with Icon and Type */}
            <div className="flex items-center gap-3 mb-4">
              {getOfferingIcon(offering.type)}
              <div>
                <h4 className="text-xl font-bold text-gray-800 capitalize">{offering.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-blue-600">
                    ₹ {offering.is_free ? 'Free' : (offering.discounted_price || offering.price.amount)}
                  </span>
                  {offering.discounted_price && !offering.is_free && (
                    <span className="text-sm text-gray-500 line-through">
                      {offering.price.amount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              {offering.description}
            </p>

            {/* What's Included */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-800 mb-3">What&apos;s included:</h5>
              <div className="space-y-2">
                {offering.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Date and Duration */}
            <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created date</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Duration</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6 text-sm">
              <span className="font-medium">June 25, 2025</span>
              <span className="font-medium">{offering.duration} mins</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex-1 text-sm">
                <Share className="w-4 h-4" />
                Share Link
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1 text-sm">
                <Phone className="w-4 h-4" />
                Quick Explore Call
              </button>
            </div>

            {/* Badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
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
        ))}
      </div>
    </div>
  );
} 