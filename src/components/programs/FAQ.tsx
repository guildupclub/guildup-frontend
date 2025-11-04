"use client";
import React from "react";
import type { FAQItem } from "@/app/programs/config";
import { primary } from "@/app/colours";

export default function FAQ({ faqs }: { faqs: FAQItem[] }) {
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className="py-8 sm:py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>FAQs</h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-xl border p-4 bg-white" style={{ borderColor: `${primary}20` }}>
              <div className="font-semibold mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{f.question}</div>
              <div className="text-sm text-gray-700" style={{ fontFamily: "'Poppins', sans-serif" }}>{f.answer}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


