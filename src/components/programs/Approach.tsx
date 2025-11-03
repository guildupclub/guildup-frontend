"use client";

import React from "react";
import type { ProgramConfig } from "@/app/programs/config";

interface ApproachProps {
  config: ProgramConfig;
}

export default function Approach({ config }: ApproachProps) {
  // Use approach field if available, otherwise show placeholder
  const content = config.approach || "Our approach combines evidence-based practices with personalized guidance to help you achieve your wellness goals.";

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Our approach
        </h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line" style={{ fontFamily: "'Poppins', sans-serif", color: "#334155" }}>
            {content}
          </p>
        </div>
      </div>
    </section>
  );
}

