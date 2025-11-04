"use client";
import React from "react";
import { primary, white } from "@/app/colours";

const CTABannerWhatsApp: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden py-16" style={{ backgroundColor: primary }} aria-labelledby="cta-wa-title">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
        <h2 id="cta-wa-title" className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: white, fontFamily: "'Poppins', sans-serif" }}>
          Confused about where to start?
        </h2>
        <p className="text-white/90 max-w-3xl mx-auto mb-8" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Chat with us on WhatsApp for a quick, free consultation. We&apos;ll guide you to the right program and expert.
        </p>
        <button
          onClick={() => window.open('https://wa.me/919220521385?text=Hi! I\'d like help choosing the right program.', '_blank')}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Chat on WhatsApp
        </button>
      </div>
    </section>
  );
};

export default CTABannerWhatsApp;


