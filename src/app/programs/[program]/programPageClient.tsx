"use client";

import React, { useMemo, useEffect, useState } from "react";
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
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  
  // Map slug to GIF under public/programs. stress-anxiety -> stress.gif
  const mappedSlug = cfg.slug === "stress-anxiety" ? "stress" : cfg.slug;
  const gifPath = `programs/${mappedSlug}.gif`;

  // Show floating button after scrolling past symptoms section
  useEffect(() => {
    const checkSymptomsVisibility = () => {
      // Find the symptoms section by looking for the h4 heading
      const symptomsHeading = Array.from(document.querySelectorAll('h4')).find(
        (h4) => h4.textContent?.includes('This program will help you manage')
      );
      
      if (!symptomsHeading) return;
      
      const symptomsSection = symptomsHeading.closest('section');
      if (!symptomsSection) return;
      
      const rect = symptomsSection.getBoundingClientRect();
      // Show button when symptoms section is completely scrolled past
      const shouldShow = rect.bottom < 0;
      setShowFloatingButton(shouldShow);
    };

    const handleScroll = () => {
      checkSymptomsVisibility();
    };

    // Use a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      checkSymptomsVisibility();
      window.addEventListener('scroll', handleScroll, { passive: true });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // WhatsApp message for joining the program
  const whatsappMessage = encodeURIComponent(`Hi! I'd like to join the ${cfg.title} program.`);
  const whatsappUrl = `https://wa.me/919220521385?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ backgroundColor: white }}>
      {/* 1. Hero section */}
      <section className="pt-0 sm:pt-6 pb-4 sm:pb-6 w-full">
        <div className="w-full overflow-visible sm:overflow-hidden px-0 sm:px-6">
          <img
            src={`/${gifPath}`}
            alt={`${cfg.title} banner`}
            className="w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[650px] object-contain sm:object-cover sm:rounded-2xl"
            style={{ 
              display: 'block',
              width: '100%'
            }}
          />
        </div>
      </section>

      {/* 2. What is the Program about */}
      <About config={cfg} />

      {/* 3. Symptoms (Images and illustrations) */}
      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h4 className="text-xl sm:text-2xl font-semibold mb-6 text-left" style={{ fontFamily: "'Poppins', sans-serif" }}>
            This program will help you manage
          </h4>
          <Symptoms programKey={cfg.slug} />
        </div>
      </section>

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

      {/* Floating Join Program Button */}
      <div
        className="fixed bottom-4 left-0 right-0 z-40 px-4 md:px-6 pointer-events-none"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          opacity: showFloatingButton ? 1 : 0,
          transform: showFloatingButton ? 'translateY(0)' : 'translateY(100px)',
          transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: showFloatingButton ? 'auto' : 'none'
        }}
      >
        <div className="max-w-md mx-auto">
          <button
            onClick={() => window.open(whatsappUrl, '_blank')}
            className="w-full py-4 rounded-xl shadow-xl font-semibold transition-all duration-300 hover:scale-105 relative group overflow-hidden"
            style={{
              backgroundColor: primary,
              color: white,
              fontFamily: "'Poppins', sans-serif",
              boxShadow: `0 10px 30px -10px ${primary}40`
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 15px 40px -10px ${primary}50`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 10px 30px -10px ${primary}40`;
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Join the program
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
              }}
            />
          </button>
        </div>
      </div>

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


