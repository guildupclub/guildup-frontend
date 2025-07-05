"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: number;
  name: string;
  feedback: string;
  image: string;
  location?: string;
}

// Hardcoded testimonial data (structured for API integration later)
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Allen Griffin",
    feedback:
      "I've been working with these guys for a long time and I can say that my house is in the perfect hands.",
    image: "/placeholder.svg?height=60&width=60",
    location: "New York",
  },
  {
    id: 2,
    name: "Clay Washington",
    feedback:
      "Working with Sentry Oak is just great, every problem in my house is solved in a matter of days.",
    image: "/placeholder.svg?height=60&width=60",
    location: "California",
  },
  {
    id: 3,
    name: "Nancy Stone",
    feedback:
      "Once a pipe burst in my kitchen and an hour later it was already repaired, thanks to Sentry Oak.",
    image: "/placeholder.svg?height=60&width=60",
    location: "Texas",
  },
  {
    id: 4,
    name: "Michael Johnson",
    feedback:
      "Professional service and excellent quality work. They transformed our home beyond our expectations.",
    image: "/placeholder.svg?height=60&width=60",
    location: "Florida",
  },
  {
    id: 5,
    name: "Sarah Davis",
    feedback:
      "Reliable, efficient, and trustworthy. I wouldn't hesitate to recommend them to anyone.",
    image: "/placeholder.svg?height=60&width=60",
    location: "Arizona",
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calculate how many testimonials to show (responsive)
  const testimonialsPerView = 3;
  const maxIndex = Math.max(0, testimonials.length - testimonialsPerView);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + testimonialsPerView
  );

  return (
    <section className="py-16 px-4 ">
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
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
              {visibleTestimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    {/* Quote Icon */}
                    {/* <div className="mb-4">
                      <svg
                        className="w-8 h-8 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div> */}

                    {/* Feedback Text */}
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {testimonial.feedback}
                    </p>

                    {/* User Info */}
                    <div className="flex items-center">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {testimonial.name}
                        </h4>
                        {testimonial.location && (
                          <p className="text-sm text-gray-500">
                            {testimonial.location}
                          </p>
                        )}
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
