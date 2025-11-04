"use client";
import React, { useMemo } from "react";
import type { ProgramKey } from "@/app/programs/config";

export default function Symptoms({ programKey }: { programKey: ProgramKey }) {
  const imagePaths = useMemo(() => {
    const base = `/symptoms/${programKey}`;
    // known counts per current public assets
    const counts: Record<ProgramKey, number> = {
      pcos: 6,
      "stress-anxiety": 6,
      relationship: 5,
    };
    const n = counts[programKey] || 0;
    return Array.from({ length: n }, (_, i) => `${base}/${i + 1}.svg`);
  }, [programKey]);

  if (!imagePaths.length) return null;

  return (
    <section className="py-8 sm:py-12" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6">
          {imagePaths.map((src) => (
            <div key={src} className="rounded-xl overflow-hidden bg-white border" style={{ borderColor: "#e5e7eb" }}>
              <img src={src} alt="" className="w-full h-32 sm:h-36 md:h-40 object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


