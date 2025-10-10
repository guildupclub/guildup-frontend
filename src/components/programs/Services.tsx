"use client";

import React from "react";
import { primary } from "@/app/colours";
import { Users, ClipboardList, LifeBuoy, Star } from "lucide-react";

const items = [
  { icon: Users, title: "Expert Consultation", desc: "1:1 sessions with top experts and therapists" },
  { icon: ClipboardList, title: "Personalized Roadmap", desc: "Step-by-step plan tailored to your goals" },
  { icon: LifeBuoy, title: "End-to-End Support", desc: "Continuous guidance, check-ins, and accountability" },
  { icon: Star, title: "Top Coaches", desc: "Curated experts with proven outcomes" },
];

export default function Services() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="rounded-xl p-5 border bg-white shadow-sm">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${primary}15` }}>
            <Icon size={20} color={primary} />
          </div>
          <div className="text-lg font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</div>
          <div className="text-sm mt-1" style={{ fontFamily: "'Poppins', sans-serif", color: "#475569" }}>{desc}</div>
        </div>
      ))}
    </div>
  );
}



