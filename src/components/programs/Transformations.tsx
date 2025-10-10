"use client";

import React from "react";

export default function Transformations() {
  // Placeholder static layout; images/content can be fetched later via API if available
  return (
    <div>
      <h3 className="text-xl sm:text-2xl font-semibold mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Transformations</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map((i) => (
          <div key={i} className="rounded-xl overflow-hidden border bg-white">
            <div className="aspect-[4/3] bg-gray-100" />
            <div className="p-4">
              <div className="font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Client Story {i}</div>
              <div className="text-sm mt-1" style={{ fontFamily: "'Poppins', sans-serif", color: "#475569" }}>Real results achieved with our experts.</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



