"use client";
import React, { useEffect, useRef, useState } from "react";
import { primary, white } from "@/app/colours";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const steps = [
  { 
    title: "Join a program", 
    desc: "Pick the program that fits your goals.",
    image: "/how-it-works/step-1.svg"
  },
  { 
    title: "Find the right expert", 
    desc: "We match you to vetted professionals.",
    image: "/how-it-works/step-2.svg"
  },
  { 
    title: "Begin your journey", 
    desc: "Book and start guided sessions.",
    image: "/how-it-works/step-3.svg"
  },
];

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const step3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observers = stepRefs.current.map((ref, index) => {
      if (!ref) return null;
      return new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStep((prev) => Math.max(prev, index));
          }
        },
        { threshold: 0.2 }
      );
    }).filter(Boolean) as IntersectionObserver[];

    stepRefs.current.forEach((ref, index) => {
      if (ref && observers[index]) {
        observers[index].observe(ref);
      }
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  useEffect(() => {
    if (!step3Ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setShowPopup(true);
        }
      },
      { threshold: 0 }
    );
    obs.observe(step3Ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section aria-labelledby="how-title" className="py-16" style={{ backgroundColor: white }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="how-title" className="text-5xl sm:text-5xl font-extrabold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif", color: "#111827" }}>
            “<span style={{ color: primary }}>HEAL IN</span> Three”
          </h2>
          <p className="text-gray-600 mt-2 text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>Three simple steps to get started</p>
        </div>

        <div className="space-y-16 md:space-y-24">
          {steps.map((s, idx) => {
            const isLeftImage = idx % 2 === 0;
            const isActive = activeStep >= idx;
            const imgInitialX = isLeftImage ? -40 : 40;
            const textInitialX = isLeftImage ? 40 : -40;
            return (
              <div key={s.title}>
                <div
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                    if (idx === 2) step3Ref.current = el;
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 items-center gap-10"
                >
                  {/* Image side */}
                  <div
                    className={`${isLeftImage ? '' : 'md:order-2'}`}
                    style={{
                      transform: `translateX(${isActive ? 0 : imgInitialX}px)`,
                      opacity: isActive ? 1 : 0.85,
                      transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease-out',
                    }}
                  >
                    <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-white border" style={{ borderColor: `${primary}20` }}>
                      <img src={s.image} alt={s.title} className="w-full h-full object-contain" />
                    </div>
                  </div>

                  {/* Text side */}
                  <div
                    className={`${isLeftImage ? '' : 'md:order-1'}`}
                    style={{
                      transform: `translateX(${isActive ? 0 : textInitialX}px)`,
                      opacity: isActive ? 1 : 0.9,
                      transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1) 100ms, opacity 700ms ease-out 100ms',
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="hidden md:block mt-2 w-3 h-3 rounded-full" style={{ backgroundColor: primary }}></div>
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-semibold mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {s.title}
                        </h3>
                        <p className="text-gray-600 text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flow arrow between steps */}
                {idx < steps.length - 1 && (
                  <div className="flex justify-center my-6">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3v16" />
                      <path d="M6 15l6 6 6-6" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup after step 3 */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primary}10` }}>
              <svg className="w-8 h-8" style={{ color: primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Ready to begin?</h3>
            <p className="text-gray-600 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
              You&apos;ve seen how it works. Now let&apos;s find the right program for you.
            </p>
            <button
              onClick={() => {
                setShowPopup(false);
                window.location.href = '/';
              }}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg w-full"
              style={{ backgroundColor: primary, color: white, fontFamily: "'Poppins', sans-serif" }}
            >
              Get Started
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile sticky CTA after step 3 */}
      {showPopup && (
        <div className="fixed md:hidden bottom-3 left-0 right-0 z-40 px-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <button
            onClick={() => { setShowPopup(false); window.location.href = '/'; }}
            className="w-full px-6 py-4 rounded-xl font-semibold shadow-xl"
            style={{ backgroundColor: primary, color: white, fontFamily: "'Poppins', sans-serif" }}
          >
            Get Started
          </button>
        </div>
      )}
    </section>
  );
};

export default HowItWorks;


