"use client";

import React from "react";

interface AboutExpertProps {
  user: {
    user_name: string;
    user_email: string;
    user_avatar: string;
    about?: string;
  };
  community: {
    description: string;
    image: string;
  };
}

export function AboutExpert({ user, community }: AboutExpertProps) {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">About expert</h2>
        <h3 className="text-3xl font-bold text-blue-600 mb-6">{user.user_name}</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Description and Therapy Options */}
        <div>
          {/* Description */}
          <div className="mb-8">
            <p className="text-gray-600 leading-relaxed text-base">
              {community.description || "Egestas mattis nisl ante ut sit sed. In vitae morbi libero luctus netus. Sagittis tellus turpis etiam a erat semper. Neque scelerisque donec arcu mattis. Egestas mattis nisl ante ut sit sed Egestas mattis nisl ante ut sit sed. In vitae morbi libero luctus netus."}
            </p>
          </div>

          {/* I offer therapy for section */}
          <div>
            <h4 className="text-xl font-bold text-gray-800 mb-6">I offer therapy for</h4>
            
            {/* Therapy categories grid - 3x2 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">Weight loss</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">Diabetes</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">Cholesterol</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7s.9 2 2 2h9.5l-1.86 2.73c-.24.35-.25.8-.02 1.16.23.36.63.61 1.09.61H17c.55 0 1-.45 1-1V8.5c0-.28-.11-.53-.3-.72L17.63 5.84zM14 17h-4l1.5-2.3c.47-.72.47-1.68 0-2.4L10 10h4c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">Muscle building</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">PCOS</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">Thyroid</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Expert Image and Discovery Call */}
        <div className="flex flex-col gap-6">
          {/* Expert Video/Image */}
          <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-video">
            <img
              src={user.user_avatar || community.image || "/defaultCommunityIcon.png"}
              alt={user.user_name}
              className="w-full h-full object-cover"
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <svg className="w-6 h-6 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Discovery Call Section */}
          <div className="bg-blue-700 rounded-xl p-6 text-white">
            <h4 className="text-xl font-bold mb-2">Find Your Clarity in 15 Mins -</h4>
            <h5 className="text-lg font-semibold mb-4">Book a Discovery Call</h5>
            
            <button className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Book a Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 