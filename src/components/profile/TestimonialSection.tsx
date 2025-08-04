"use client";

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  _id: string;
  comment: string;
  rating: number;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  offering_id: {
    _id: string;
    title: string;
  };
  createdAt: string;
}

interface TestimonialSectionProps {
  expertId?: string;
  communityId?: string;
  expertName?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialSection({ 
  expertId, 
  communityId, 
  expertName = "Expert" 
}: TestimonialSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (expertId) params.append('expertId', expertId);
        if (communityId) params.append('communityId', communityId);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING || 'http://localhost:8080'}/bookings/api/testimonials?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }

        const data = await response.json();
        
        if (data.r === 's' && data.data.testimonials) {
          setTestimonials(data.data.testimonials);
        } else {
          setTestimonials([]);
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
        setTestimonials([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (expertId || communityId) {
      fetchTestimonials();
    } else {
      setIsLoading(false);
      setTestimonials([]);
    }
  }, [expertId, communityId]);

  // Don't render anything if no testimonials
  if (isLoading) {
    return null; // Don't show loading state, just don't render the section
  }

  if (error || testimonials.length === 0) {
    return null; // Don't show the section if no testimonials
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(testimonials.length - 3, prev + 1));
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3);

  return (
    <div className="max-w-7xl mx-auto px-8 py-16 bg-white">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Client's words for us</h2>
        <h3 className="text-3xl font-bold text-primary">
          {testimonials.length}+ Learners Trusted {expertName}
        </h3>
      </div>

      {/* Navigation Controls */}
      {testimonials.length > 3 && (
        <div className="flex justify-end gap-2 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-12 w-12 rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= testimonials.length - 3}
            className="h-12 w-12 rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Testimonials Layout */}
      <div className="relative h-96 max-w-6xl mx-auto">
        {/* Left floating testimonial - positioned diagonally */}
        {visibleTestimonials[0] && (
          <div className="absolute left-0 top-12 w-80 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {visibleTestimonials[0].comment}
            </p>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">
                  {visibleTestimonials[0].user_id?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">
                  {visibleTestimonials[0].user_id?.name || 'Anonymous User'}
                </h4>
                <StarRating rating={visibleTestimonials[0].rating} />
              </div>
            </div>
          </div>
        )}

        {/* Right floating testimonial - positioned diagonally */}
        {visibleTestimonials[2] && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {visibleTestimonials[2].comment}
            </p>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">
                  {visibleTestimonials[2].user_id?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">
                  {visibleTestimonials[2].user_id?.name || 'Anonymous User'}
                </h4>
                <StarRating rating={visibleTestimonials[2].rating} />
              </div>
            </div>
          </div>
        )}

        {/* Center main testimonial - elevated and prominent */}
        {visibleTestimonials[1] && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 z-20">
            <div className="bg-white rounded-2xl border-2 border-primary p-8 shadow-2xl">
              <p className="text-gray-700 leading-relaxed mb-8 text-base">
                {visibleTestimonials[1].comment}
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">
                    {visibleTestimonials[1].user_id?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg mb-2">
                    {visibleTestimonials[1].user_id?.name || 'Anonymous User'}
                  </h4>
                  <StarRating rating={visibleTestimonials[1].rating} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Testimonial Counter */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          Showing {currentIndex + 1}-{Math.min(currentIndex + 3, testimonials.length)} of {testimonials.length} testimonials
        </p>
      </div>
    </div>
  );
}
