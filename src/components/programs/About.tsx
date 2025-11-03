"use client";

import React from "react";
import type { ProgramConfig } from "@/app/programs/config";

interface AboutProps {
  config: ProgramConfig;
}

export default function About({ config }: AboutProps) {
  // Use about field if available, otherwise fallback to description
  const content = config.about || config.description;

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
          What is the {config.title} about?
        </h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif", color: "#334155" }}>
            {content}
          </p>
        </div>
      </div>
    </section>
  );
}

