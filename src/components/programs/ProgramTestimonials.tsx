"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Testimonial {
  _id: string;
  name?: string;
  comment: string;
  rating?: number;
  program?: string;
  avatar?: string;
  userId?: string;
  userName?: string;
}

interface ProgramTestimonialsProps {
  programTag: string;
}

export default function ProgramTestimonials({ programTag }: ProgramTestimonialsProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch testimonials/feedbacks for the program
    // Try program-specific endpoint first, then fallback to all testimonials
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);
        let filteredTestimonials: Testimonial[] = [];
        
        // Try program-specific endpoint first (if available)
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/feedback?program=${programTag}`
          );
          
          if (response.ok) {
            const data = await response.json();
              if (data?.data?.feedbacks) {
                filteredTestimonials = data.data.feedbacks.map((fb: any) => ({
                  _id: fb._id || fb.id || Math.random().toString(),
                  name: fb.userName || fb.name || fb.user?.name || "Anonymous",
                  comment: fb.comment || fb.feedback || "",
                  rating: fb.rating,
                  program: fb.program || fb.programTag,
                  avatar: fb.avatar || fb.user?.avatar,
                  userId: fb.userId || fb.user?._id,
                }));
              } else if (Array.isArray(data?.data)) {
                filteredTestimonials = data.data.map((fb: any) => ({
                  _id: fb._id || fb.id || Math.random().toString(),
                  name: fb.userName || fb.name || fb.user?.name || "Anonymous",
                  comment: fb.comment || fb.feedback || "",
                  rating: fb.rating,
                  program: fb.program || fb.programTag,
                  avatar: fb.avatar || fb.user?.avatar,
                  userId: fb.userId || fb.user?._id,
                }));
              }
          }
        } catch (err) {
          // Fallback: Try to fetch all testimonials
          console.log("Program-specific endpoint not available, fetching all testimonials");
        }
        
        // If no program-specific testimonials, try to fetch all and filter
        if (filteredTestimonials.length === 0) {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/feedback/all`
            );
            
            if (response.ok) {
              const data = await response.json();
              let allTestimonials: Testimonial[] = [];
              
              if (data?.data?.feedbacks) {
                allTestimonials = data.data.feedbacks;
              } else if (Array.isArray(data?.data)) {
                allTestimonials = data.data;
              }
              
              // Filter by program tag if available in the testimonial data
              filteredTestimonials = allTestimonials
                .map((fb: any) => ({
                  _id: fb._id || fb.id || Math.random().toString(),
                  name: fb.userName || fb.name || fb.user?.name || "Anonymous",
                  comment: fb.comment || fb.feedback || "",
                  rating: fb.rating,
                  program: fb.program || fb.programTag,
                  avatar: fb.avatar || fb.user?.avatar,
                  userId: fb.userId || fb.user?._id,
                }))
                .filter((t: Testimonial) => {
                  return t.program === programTag || t.program === programTag || !t.program;
                });
            }
          } catch (err) {
            console.error("Error fetching all testimonials:", err);
          }
        }
        
        setTestimonials(filteredTestimonials.slice(0, 6)); // Limit to 6 testimonials
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setError("Unable to load testimonials");
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, [programTag]);

  const testimonialsPerView = 3;
  const maxIndex = Math.max(0, testimonials.length - testimonialsPerView);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev));
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + testimonialsPerView
  );

  if (isLoading) {
    return (
      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Testimonials
          </h2>
          <div className="text-center py-12">
            <p className="text-base text-gray-500" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Loading testimonials...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error || testimonials.length === 0) {
    return (
      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Testimonials
          </h2>
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-base text-gray-500" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Testimonials will be displayed here once available.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Testimonials
        </h2>
        
        <div className="relative">
          <div className="flex justify-between items-start gap-4">
            {/* Navigation Button - Left */}
            {currentIndex > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full h-10 w-10 -ml-5"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            {/* Testimonials Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleTestimonials.map((testimonial) => (
                <Card
                  key={testimonial._id}
                  className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    {/* Rating Stars */}
                    {testimonial.rating && (
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < testimonial.rating!
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Testimonial Text */}
                    <p
                      className="text-gray-700 mb-6 leading-relaxed"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {testimonial.comment || "No comment available"}
                    </p>

                    {/* User Info */}
                    <div className="flex items-center">
                      {testimonial.avatar ? (
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name || "User"}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full mr-3 bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {testimonial.name && testimonial.name.length > 0
                              ? testimonial.name.charAt(0).toUpperCase()
                              : "U"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p
                          className="font-semibold text-sm"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {testimonial.name || "Anonymous"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Navigation Button - Right */}
            {currentIndex < maxIndex && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full h-10 w-10 -mr-5"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

