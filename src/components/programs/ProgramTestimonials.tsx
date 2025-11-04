"use client";
import React from "react";
import { primary } from "@/app/colours";

export default function ProgramTestimonials({ programTag }: { programTag: string }) {
  // Simple placeholder; can be replaced by real testimonials filtered by tag
  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>What people say</h2>
        <div className="rounded-2xl border p-6 bg-white" style={{ borderColor: `${primary}20` }}>
          <p className="text-gray-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
            &quot;I found the guidance extremely helpful and tailored to my needs. Highly recommend!&quot;
          </p>
        </div>
      </div>
    </section>
  );
}


