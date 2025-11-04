"use client";
import React, { useMemo } from "react";
import { primary, black, white } from "@/app/colours";
import { Star } from "lucide-react";

const Testimonials: React.FC = () => {
  const testimonials = useMemo(
    () => [
      {
        quote:
          "I was 26 years old when I had my first panic attack. Just like any Indian family, my parents were not amused by the fact their son would be going for therapy. While I got care finally, I still see a significant level of stigma against mental health. I wish there was an easier way to access this.",
        author: "Rahul S.",
        location: "Mumbai, Maharashtra",
        rating: 5,
        date: "2 weeks ago",
        program: "Stress & Anxiety",
        verified: true,
      },
      {
        quote:
          "I remember the first time I went for a routine checkup. The doctor asked me if I was married. Honestly, it took me a while to realise what she meant was if I was sexually active. GuildUp provides a safe space for these conversations.",
        author: "Priya M.",
        location: "Delhi, NCR",
        rating: 5,
        date: "1 month ago",
        program: "PCOS",
        verified: true,
      },
      {
        quote:
          "I am subjected to intrusive questions about my mental health issues from everyone at the store. GuildUp offers privacy and understanding, which helped me stay consistent with my sessions.",
        author: "Ankit K.",
        location: "Bangalore, Karnataka",
        rating: 5,
        date: "3 weeks ago",
        program: "Stress & Anxiety",
        verified: true,
      },
      {
        quote:
          "The relationship counseling program transformed our communication. We learned to express our feelings without judgment and rebuild trust. Our expert was patient and understanding throughout the journey.",
        author: "Neha R.",
        location: "Pune, Maharashtra",
        rating: 5,
        date: "3 weeks ago",
        program: "Relationship",
        verified: true,
      },
      {
        quote:
          "Managing PCOS was overwhelming until I found GuildUp. The personalized approach and expert guidance helped me understand my body better. I feel more in control now.",
        author: "Sneha P.",
        location: "Chennai, Tamil Nadu",
        rating: 5,
        date: "1 month ago",
        program: "PCOS",
        verified: true,
      },
      {
        quote:
          "I found the guidance extremely helpful and tailored to my needs. Highly recommend! The privacy and quality of care here is unmatched.",
        author: "Vikram J.",
        location: "Hyderabad, Telangana",
        rating: 5,
        date: "2 weeks ago",
        program: "Stress & Anxiety",
        verified: true,
      },
      {
        quote:
          "After months of struggling with anxiety, I finally found a platform that respects my privacy and provides genuine care. The sessions have been life-changing.",
        author: "Meera T.",
        location: "Kolkata, West Bengal",
        rating: 5,
        date: "4 weeks ago",
        program: "Stress & Anxiety",
        verified: true,
      },
      {
        quote:
          "The program helped me navigate through a difficult phase in my relationship. The expert was compassionate and provided practical solutions. Thank you GuildUp!",
        author: "Arjun M.",
        location: "Ahmedabad, Gujarat",
        rating: 5,
        date: "2 months ago",
        program: "Relationship",
        verified: true,
      },
    ],
    []
  );

  return (
    <section aria-labelledby="testimonials-title" className="py-16" style={{ backgroundColor: white }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="testimonials-title" className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: black }}>
            What Our Users Say
          </h2>
          <p className="text-gray-600 mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Real stories from people who found their path to wellness with GuildUp
          </p>
        </div>

        {/* Grid of Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => {
            // Get initials for avatar
            const initials = t.author
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <article
                key={i}
                className="rounded-xl border bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ 
                  borderColor: "#E5E7EB",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                }}
              >
                <div className="p-6">
                  {/* Header with profile and info */}
                  <div className="flex items-start gap-3 mb-4">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
                      style={{
                        backgroundColor: primary,
                        fontFamily: "'Poppins', sans-serif"
                      }}
                    >
                      {initials}
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4
                          className="font-semibold text-sm"
                          style={{ fontFamily: "'Poppins', sans-serif", color: "#111827" }}
                        >
                          {t.author}
                        </h4>
                        {t.verified && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${primary}15`,
                              color: primary,
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: 600
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Star rating */}
                      <div className="flex items-center gap-0.5 mb-2">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            size={14}
                            fill={idx < t.rating ? "#FBBF24" : "#D1D5DB"}
                            stroke={idx < t.rating ? "#FBBF24" : "#D1D5DB"}
                            className="flex-shrink-0"
                          />
                        ))}
                      </div>

                      {/* Location and date */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        <span>{t.location}</span>
                        <span>•</span>
                        <span>{t.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Program badge */}
                  <div className="mb-3">
                    <span 
                      className="inline-block text-xs px-2 py-1 rounded-md font-medium"
                      style={{ 
                        backgroundColor: `${primary}10`,
                        color: primary,
                        fontFamily: "'Poppins', sans-serif"
                      }}
                    >
                      {t.program}
                    </span>
                  </div>

                  {/* Review text */}
                  <blockquote
                    className="text-sm leading-relaxed"
                    style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}
                  >
                    &quot;{t.quote}&quot;
                  </blockquote>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;


