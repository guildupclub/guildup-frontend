"use client";
import React from "react";
import type { ProgramKey } from "@/app/programs/config";
import { primary } from "@/app/colours";

type ProgramConfig = {
  slug: ProgramKey;
  title: string;
  approach?: string;
};

export default function Approach({ config }: { config: ProgramConfig }) {
  if (!config) return null;
  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>Our approach</h2>
        <p className="text-gray-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {config.approach || "Personalized plan, expert guidance, and ongoing support tailored to your goals."}
        </p>
      </div>
    </section>
  );
}


