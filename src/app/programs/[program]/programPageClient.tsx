"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { PROGRAMS, type ProgramKey } from "../config";
import { primary, white } from "@/app/colours";
import ProgramCommunities from "@/components/community/ProgramCommunities";
import Services from "@/components/programs/Services";
import Transformations from "@/components/programs/Transformations";
import LeadFormModal from "@/components/programs/LeadFormModal";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

export default function ProgramPageClient({ programKey }: { programKey: ProgramKey }) {
  const cfg = useMemo(() => PROGRAMS[programKey], [programKey]);
  const router = useRouter();
  const bgUmageName = `${cfg.slug}-banner.svg`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: white }}>
      <section className="pt-4 sm:pt-12 pb-6 sm:pb-8">
        <div className="max-w-6xl mx-auto pl-4 pr-0 sm:pl-6 sm:pr-0">
          <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ background: "linear-gradient(135deg, #fafbff, #ffffff)" }}>
              {bgUmageName ? (
                <div
                  className="w-full h-[320px] rounded-2xl"
                  style={{
                    backgroundImage: `url(/${bgUmageName})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              ) : (
              <div>
                <h1 className="text-3xl sm:text-5xl font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "#0f172a" }}>{cfg.title}</h1>
                <p className="mt-3 sm:mt-4 text-base sm:text-lg" style={{ fontFamily: "'Poppins', sans-serif", color: "#334155" }}>{cfg.subtitle}</p>
                <p className="mt-2 text-sm sm:text-base" style={{ fontFamily: "'Poppins', sans-serif", color: "#475569" }}>{cfg.description}</p>
                <div className="mt-6">
                  <LeadFormModal program={cfg.slug} triggerLabel="Talk to a Program Advisor" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Services />
        </div>
      </section>

      {/* Lead banner moved after services */}
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

      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Experts for this program</h2>
          <ProgramCommunities tag={cfg.tag} />
        </div>
      </section>
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

      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Transformations />
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-xl sm:text-2xl font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Ready to start?</h3>
          <p className="text-sm sm:text-base mt-2" style={{ fontFamily: "'Poppins', sans-serif", color: "#475569" }}>
            Speak with our team and get a customized roadmap for your journey.
          </p>
          <div className="mt-5">
            <LeadFormModal program={cfg.slug} triggerLabel="Get Your Plan" variant="primary" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Footer
// Ensures consistent layout across program pages


