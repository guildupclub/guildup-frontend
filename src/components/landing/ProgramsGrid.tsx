"use client";
import React from "react";
import Link from "next/link";
import { usePrograms } from "@/lib/fetching/usePrograms";
import { primary, white } from "@/app/colours";

const ProgramsGrid: React.FC = () => {
  const { data, isLoading, isError } = usePrograms();

  if (isLoading) return null;
  if (isError || !data || data.length === 0) return null;

  return (
    <section aria-labelledby="programs-title" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 id="programs-title" className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Our Programs
          </h2>
          <p className="text-gray-600 mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Choose a path and begin your journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((p) => (
            <Link key={p.id} href={`/programs/${p.id}`} className="relative group rounded-2xl overflow-hidden border shadow-sm transition-transform duration-300 hover:scale-[1.02]" style={{ borderColor: `${primary}20` }}>
              <div className="aspect-[4/3] bg-white flex items-center justify-center">
                {p.illustration ? (
                  <img src={p.illustration} alt={p.title} className="w-56 h-56 sm:w-64 sm:h-64 object-contain" />
                ) : (
                  <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-xl" style={{ backgroundColor: `${primary}10` }} />
                )}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>{p.title}</h3>
                {p.subtitle && (
                  <p className="text-gray-600 mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{p.subtitle}</p>
                )}
                <div className="mt-4">
                  <span className="inline-block px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: primary, color: white, fontFamily: "'Poppins', sans-serif" }}>
                    Explore
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsGrid;


