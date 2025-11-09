"use client";
import React from "react";
import type { ProgramKey, ApproachItem } from "@/app/programs/config";
import { primary } from "@/app/colours";

type ProgramConfig = {
  slug: ProgramKey;
  title: string;
  approach?: string;
  approachTitle?: string;
  approachItems?: ApproachItem[];
};

export default function Approach({ config }: { config: ProgramConfig }) {
  if (!config) return null;
  const title = config.approachTitle || "Our Approach";
  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h2>
        {config.approach && (
          <p className="text-gray-700 mb-8" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {config.approach}
          </p>
        )}
        {config.approachItems && config.approachItems.length > 0 ? (
          <div className="space-y-6">
            {config.approachItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {index + 1}. {item.title}
                </h3>
                <p className="text-gray-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {config.approach || "Personalized plan, expert guidance, and ongoing support tailored to your goals."}
          </p>
        )}
      </div>
    </section>
  );
}


