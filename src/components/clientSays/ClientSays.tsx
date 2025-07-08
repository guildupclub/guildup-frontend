"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Feedback {
  _id: string;
  comment: string;
  rating: number;
  createdAt: string;
}

interface ApiResponse {
  r: string;
  data: {
    feedbacks: Feedback[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export default function TestimonialsSection({
  communityId,
}: {
  communityId: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(
          `https://guildup-be-dev-new-569548341732.us-central1.run.app/v1/feedback?community_id=${communityId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch testimonials");
        }
        const data: ApiResponse = await response.json();
        setFeedbacks(data.data.feedbacks);
        setIsLoading(false);
      } catch (err) {
        setError("Error loading testimonials");
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, [communityId]);

  // Calculate how many testimonials to show (responsive)
  const testimonialsPerView = 3;
  const maxIndex = Math.max(0, feedbacks.length - testimonialsPerView);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleTestimonials = feedbacks.slice(
    currentIndex,
    currentIndex + testimonialsPerView
  );

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-8xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            What our clients say about us.
          </h2>
          <p>Loading testimonials...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-8xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            What our clients say about us.
          </h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (feedbacks.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="text-center items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            What our clients say about us.
          </h2>
        </div>

        <div className="flex items-end justify-end gap-2 my-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-12 w-12 rounded-full shadow-sm hover:shadow-md transition-shadow bg-transparent border border-gray-300"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous testimonials</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className="h-12 w-12 rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next testimonials</span>
          </Button>
        </div>

        {/* Testimonials Container */}
        <div className="relative">
          <div className="flex justify-between items-start">
            {/* Testimonials Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleTestimonials.map((feedback) => (
                <Card
                  key={feedback._id}
                  className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    {/* Feedback Text */}
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {feedback.comment}
                    </p>

                    {/* User Info */}
                    <div className="flex items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Anonymous User
                        </h4>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, index) => (
                            <svg
                              key={index}
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 ${
                                index < feedback.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill={
                                index < feedback.rating
                                  ? "currentColor"
                                  : "none"
                              }
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={index < feedback.rating ? 0 : 2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.016 6.183h6.508c.969 0 1.371 1.24.588 1.81l-5.27 3.827 2.015 6.184c.3.92-.755 1.688-1.54 1.118l-5.271-3.826-5.27 3.826c-.786.57-1.841-.197-1.541-1.118l2.016-6.184-5.27-3.827c-.783-.57-.38-1.81.588-1.81h6.508l2.016-6.183z"
                              />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
