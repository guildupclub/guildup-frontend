"use client";
import React, { useMemo, useRef } from "react";
import { primary, black, white } from "@/app/colours";

const Testimonials: React.FC = () => {
  const testimonials = useMemo(
    () => [
      {
        quote:
          "I was 26 years old when I had my first panic attack. Just like any Indian family, my parents were not amused by the fact their son would be going for therapy. While I got care finally, I still see a significant level of stigma against mental health. I wish there was an easier way to access this.",
        author: "Anonymous User",
        meta: "Verified Review",
      },
      {
        quote:
          "I remember the first time I went for a routine checkup. The doctor asked me if I was married. Honestly, it took me a while to realise what she meant was if I was sexually active. GuildUp provides a safe space for these conversations.",
        author: "Anonymous User",
        meta: "Verified Review",
      },
      {
        quote:
          "I am subjected to intrusive questions about my mental health issues from everyone at the store. GuildUp offers privacy and understanding, which helped me stay consistent with my sessions.",
        author: "Anonymous User",
        meta: "Verified Review",
      },
    ],
    []
  );

  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: number) => {
    const node = scrollerRef.current;
    if (!node) return;
    const amount = Math.round(node.clientWidth * 0.85);
    node.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section aria-labelledby="testimonials-title" className="py-16" style={{ backgroundColor: white }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 id="testimonials-title" className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: black }}>
            What Our Users Say
          </h2>
          <p className="text-gray-600 mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Real stories from people who found their path to wellness with GuildUp
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-end gap-3 mb-3">
          <button
            aria-label="Previous testimonial"
            onClick={() => scrollBy(-1)}
            className="rounded-lg px-3 py-2 border text-sm"
            style={{ borderColor: `${primary}40`, color: primary, fontFamily: "'Poppins', sans-serif" }}
          >
            Prev
          </button>
          <button
            aria-label="Next testimonial"
            onClick={() => scrollBy(1)}
            className="rounded-lg px-3 py-2 border text-sm"
            style={{ borderColor: `${primary}40`, color: primary, fontFamily: "'Poppins', sans-serif" }}
          >
            Next
          </button>
        </div>

        {/* Horizontal, manually scrollable list */}
        <div
          ref={scrollerRef}
          className="overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="flex gap-6">
            {testimonials.map((t, i) => (
              <article
                key={i}
                className="snap-center shrink-0 w-[90%] sm:w-[80%] lg:w-[60%] rounded-2xl border shadow-sm mx-auto"
                style={{ borderColor: `${primary}25`, backgroundColor: "#F9FAFB" }}
              >
                <div className="p-6 sm:p-10">
                  {/* Decorative quote mark */}
                  <div className="flex justify-center mb-4">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill={primary}><path d="M7.17 6A5.83 5.83 0 001 11.83V21h9v-9H7.17zM22 12V3h-9v9h2.83A5.83 5.83 0 0122 17.83V12z" /></svg>
                  </div>

                  <blockquote
                    className="text-xl sm:text-2xl leading-relaxed text-center"
                    style={{ color: "#1f2937", fontFamily: "'Poppins', sans-serif" }}
                  >
                    “{t.quote}”
                  </blockquote>

                  <div className="text-center mt-6">
                    <div className="text-sm font-semibold" style={{ fontFamily: "'Poppins', sans-serif", color: "#111827" }}>{t.author}</div>
                    <div className="text-xs text-gray-500" style={{ fontFamily: "'Poppins', sans-serif" }}>{t.meta}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;


