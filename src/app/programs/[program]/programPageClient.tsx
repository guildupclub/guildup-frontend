"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { PROGRAMS, type ProgramKey } from "../config";
import { primary, white } from "@/app/colours";
import ProgramCommunities from "@/components/community/ProgramCommunities";
import LeadFormModal from "@/components/programs/LeadFormModal";
import Footer from "@/components/layout/Footer";
import About from "@/components/programs/About";
import Symptoms from "@/components/programs/Symptoms";
import Approach from "@/components/programs/Approach";
import FAQ from "@/components/programs/FAQ";
import ProgramTestimonials from "@/components/programs/ProgramTestimonials";

export default function ProgramPageClient({ programKey }: { programKey: ProgramKey }) {
  const cfg = useMemo(() => PROGRAMS[programKey], [programKey]);
  const router = useRouter();
  // Map slug to GIF under public/programs. stress-anxiety -> stress.gif
  const mappedSlug = cfg.slug === "stress-anxiety" ? "stress" : cfg.slug;
  const gifPath = `programs/${mappedSlug}.gif`;

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ backgroundColor: white }}>
      {/* 1. Hero section */}
      <section className="pt-0 sm:pt-6 pb-4 sm:pb-6 w-full">
        <div className="w-full overflow-visible sm:overflow-hidden px-0 sm:px-6" style={{ width: '100vw', maxWidth: '100vw' }}>
          <img
            src={`/${gifPath}`}
            alt={`${cfg.title} banner`}
            className="sm:h-[320px] md:h-[400px] lg:h-[480px] sm:object-cover sm:object-top sm:rounded-2xl"
            style={{ 
              height: '240px',
              width: '100vw',
              maxWidth: '100vw',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>
      </section>

      {/* 2. What is the Program about */}
      <About config={cfg} />

      {/* 3. Symptoms (Images and illustrations) */}
      <Symptoms programKey={cfg.slug} />

      {/* 4. Our approach */}
      <Approach config={cfg} />

      {/* 5. CTA banner */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-2xl p-10 sm:p-16 banner-animated" style={{ backgroundColor: primary, minHeight: 180 }}>
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-2xl sm:text-3xl font-semibold" style={{ fontFamily: "'Poppins', sans-serif", color: "#FFFFFF" }}>Get a personalized roadmap</h3>
                <p className="text-sm sm:text-base mt-1" style={{ fontFamily: "'Poppins', sans-serif", color: "#EAEAFF" }}>
                  Talk to a program advisor and start your journey today.
                </p>
              </div>
              <div>
                <div className="shiver">
                  <LeadFormModal program={cfg.slug} triggerLabel="Talk to Advisor" appearance="white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <ProgramTestimonials programTag={cfg.tag} />

      {/* 7. Our experts for this program */}
      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Our experts for this program</h2>
          <ProgramCommunities tag={cfg.tag} />
        </div>
      </section>

      {/* 8. FAQ Section */}
      {cfg.faqs && cfg.faqs.length > 0 && <FAQ faqs={cfg.faqs} />}

      {/* 9. Footer */}
      <Footer />

      <style jsx>{`
        @keyframes shiver {
          0% { transform: translateX(0); }
          20% { transform: translateX(-1px) rotate(-0.5deg); }
          40% { transform: translateX(1px) rotate(0.5deg); }
          60% { transform: translateX(-1px) rotate(-0.5deg); }
          80% { transform: translateX(1px) rotate(0.5deg); }
          100% { transform: translateX(0); }
        }
        .shiver:hover { animation: shiver 0.6s ease-in-out infinite; }

        /* Subtle moving sheen across the banner for attention */
        .banner-animated { position: relative; overflow: hidden; }
        .banner-animated:before {
          content: "";
          position: absolute;
          top: 0; left: -60%;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.18), transparent);
          transform: skewX(-15deg);
          animation: sheen 5.5s linear infinite;
        }
        @keyframes sheen {
          0% { left: -60%; }
          60% { left: 120%; }
          100% { left: 120%; }
        }
        /* Gentle breathing effect */
        .banner-animated { animation: breathe 8s ease-in-out infinite; }
        @keyframes breathe {
          0%, 100% { box-shadow: 0 10px 40px rgba(59,71,249,0.18); }
          50% { box-shadow: 0 16px 60px rgba(59,71,249,0.28); }
        }
      `}</style>
    </div>
  );
}

// Footer
// Ensures consistent layout across program pages


