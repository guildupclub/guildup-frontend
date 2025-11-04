"use client";
import React from "react";
import { useTopExperts } from "@/lib/fetching/useTopExperts";
import { primary } from "@/app/colours";

const ExpertsGrid: React.FC = () => {
  const { data, isLoading, isError } = useTopExperts(18);
  if (isLoading) return null;
  if (isError || !data || data.length === 0) return null;

  return (
    <section aria-labelledby="experts-title" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 id="experts-title" className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>Top Experts</h2>
          <p className="text-gray-600 mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Handpicked professionals to guide you</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.map((e) => (
            <div key={e.id} className="rounded-xl border p-4 text-center bg-white shadow-sm" style={{ borderColor: `${primary}20` }}>
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 bg-gray-100">
                {e.avatarUrl ? (
                  <img src={e.avatarUrl} alt={e.name} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="text-sm font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>{e.name}</div>
              {e.title && <div className="text-xs text-gray-600 mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{e.title}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpertsGrid;


