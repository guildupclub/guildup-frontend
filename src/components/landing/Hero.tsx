"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { primary, black, white } from "@/app/colours";

const Hero: React.FC = () => {
  const router = useRouter();
  return (
    <section aria-labelledby="hero-title" className="relative min-h-[80vh] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-gray-200" style={{ backgroundColor: `${primary}15` }}>
              <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: primary }}></span>
              <span className="text-sm font-medium" style={{ color: primary, fontFamily: "'Poppins', sans-serif" }}>
                Trusted by 10,000+ users across India
              </span>
            </div>

            <div className="space-y-4">
              <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight" style={{ color: black, fontFamily: "'Poppins', sans-serif" }}>
                Your wellness journey
                <br />
                <span style={{ color: primary }}>starts here</span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/mind')}
                className="px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                style={{ backgroundColor: primary, color: white, fontFamily: "'Poppins', sans-serif" }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2B37E9'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = primary}
              >
                Take the 1st step
              </button>
            </div>
          </div>

          <div className="relative lg:h-[520px] flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4">
              {["/hero/hero1.jpg","/hero/hero2.jpg","/hero/hero3.jpg","/hero/hero4.jpg"].map((src, i) => (
                <div key={src} className="relative group w-full h-full max-w-[200px] max-h-[200px]">
                  <div className="absolute -inset-1 rounded-2xl blur-sm transition-all duration-300 group-hover:blur-none" style={{ background: `linear-gradient(135deg, ${primary}30, transparent)` }} />
                    <img
                      src={src}
                      alt="Wellness visual"
                      className="relative w-full h-full object-cover rounded-2xl shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                      style={{ border: `3px solid ${primary}40` }}
                    />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


