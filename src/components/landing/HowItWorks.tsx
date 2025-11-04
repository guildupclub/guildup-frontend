"use client";
import React, { useEffect, useRef, useState } from "react";
import { primary, white } from "@/app/colours";
import LeadFormModal from "@/components/programs/LeadFormModal";

const steps = [
  { 
    title: "Join a program", 
    desc: "Pick the program that fits your goals.",
    image: "/how-it-works/step-1.svg",
    gradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)"
  },
  { 
    title: "Find the right expert", 
    desc: "We match you to vetted professionals.",
    image: "/how-it-works/step-2.svg",
    gradient: "linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 50%, #a78bfa 100%)"
  },
  { 
    title: "Begin your journey", 
    desc: "Book and start guided sessions.",
    image: "/how-it-works/step-3.svg",
    gradient: "linear-gradient(135deg, #bfdbfe 0%, #93c5fd 50%, #60a5fa 100%)"
  },
];

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const step3Ref = useRef<HTMLDivElement>(null);
  const programsSectionRef = useRef<HTMLElement | null>(null);

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
    // Function to check if Programs section is visible
    const checkProgramsVisibility = () => {
      const programsTitle = document.getElementById('programs-title');
      if (!programsTitle) return;
      
      const programsSection = programsTitle.closest('section');
      if (!programsSection) return;
      
      const rect = programsSection.getBoundingClientRect();
      // Show button only when Programs section is completely scrolled past (bottom is above viewport)
      // Hide button when Programs section is visible or partially visible in viewport
      const shouldShow = rect.bottom < 0;
      setShowStickyButton(shouldShow);
    };

    // Function to setup observer for Programs section
    const setupObserver = () => {
      const programsTitle = document.getElementById('programs-title');
      if (!programsTitle) return null;
      
      const programsSection = programsTitle.closest('section');
      if (!programsSection) return null;
      
      programsSectionRef.current = programsSection as HTMLElement;
      
      const obs = new IntersectionObserver(
        ([entry]) => {
          // Show button when Programs section is completely scrolled past (bottom is above viewport)
          // Hide button when Programs section is visible in viewport
          const shouldShow = entry.boundingClientRect.bottom < 0;
          setShowStickyButton(shouldShow);
        },
        { threshold: 0, rootMargin: '0px' }
      );
      
      obs.observe(programsSection);
      return obs;
    };

    // Setup observer
    let observer = setupObserver();
    
    // Also check on scroll for more reliable detection
    const handleScroll = () => {
      checkProgramsVisibility();
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    checkProgramsVisibility();
    
    // If observer not found, retry after delay
    if (!observer) {
      const timeoutId = setTimeout(() => {
        observer = setupObserver();
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', handleScroll);
        if (observer) {
          observer.disconnect();
        }
      };
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observer) {
        observer.disconnect();
      }
    };
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
                    <div 
                      className="w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden relative"
                      style={{ 
                        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)`,
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: `1px solid rgba(255, 255, 255, 0.3)`,
                        boxShadow: isActive 
                          ? `0 20px 60px -15px rgba(59, 71, 249, 0.3), 
                             0 0 0 1px rgba(255, 255, 255, 0.4) inset,
                             0 1px 2px rgba(0, 0, 0, 0.1)`
                          : `0 10px 30px -10px rgba(59, 71, 249, 0.2),
                             0 0 0 1px rgba(255, 255, 255, 0.3) inset`,
                        transition: 'box-shadow 700ms ease-out, transform 700ms cubic-bezier(0.22, 1, 0.36, 1), border-color 700ms ease-out',
                        transform: isActive ? 'scale(1)' : 'scale(0.98)',
                        borderColor: isActive ? `rgba(59, 71, 249, 0.3)` : `rgba(59, 71, 249, 0.2)`,
                      }}
                    >
                      {/* Glass reflection overlay */}
                      <div 
                        className="absolute inset-0 opacity-60"
                        style={{
                          background: `linear-gradient(135deg, 
                            rgba(255, 255, 255, 0.4) 0%, 
                            transparent 40%,
                            transparent 60%,
                            rgba(59, 71, 249, 0.1) 100%)`,
                          borderRadius: '1rem'
                        }}
                      />
                      
                      {/* Primary color accent gradient */}
                      <div 
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: `linear-gradient(135deg, ${primary}20 0%, transparent 50%)`,
                          borderRadius: '1rem'
                        }}
                      />
                      
                      {/* Decorative glass circles */}
                      <div 
                        className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-40 blur-xl"
                        style={{ 
                          background: `radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, ${primary}20 100%)`,
                        }}
                      />
                      <div 
                        className="absolute bottom-4 left-4 w-16 h-16 rounded-full opacity-30 blur-lg"
                        style={{ 
                          background: `radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, ${primary}15 100%)`,
                        }}
                      />
                      
                      {/* Subtle border highlight */}
                      <div 
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          border: `1px solid rgba(255, 255, 255, 0.5)`,
                          borderRadius: '1rem',
                          pointerEvents: 'none',
                          boxShadow: `0 0 20px -5px ${primary}30 inset`
                        }}
                      />
                      
                      {/* Image container with padding */}
                      <div className="relative w-full h-full p-6 sm:p-8 md:p-10 flex items-center justify-center z-10">
                        <img 
                          src={s.image} 
                          alt={s.title} 
                          className="w-full h-full object-contain relative drop-shadow-lg"
                          style={{
                            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))',
                          }}
                        />
                      </div>
                      
                      {/* Bottom shine effect */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1/3 opacity-50"
                        style={{
                          background: `linear-gradient(to top, ${primary}20 0%, transparent 100%)`,
                          borderRadius: '0 0 1rem 1rem'
                        }}
                      />
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

      {/* Fixed floating button after step 3 */}
      <div 
        className="fixed bottom-4 left-0 right-0 z-40 px-4 md:px-6 pointer-events-none"
        style={{ 
          paddingBottom: 'env(safe-area-inset-bottom)',
          opacity: showStickyButton ? 1 : 0,
          transform: showStickyButton ? 'translateY(0)' : 'translateY(100px)',
          transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: showStickyButton ? 'auto' : 'none'
        }}
      >
        <div className="max-w-md mx-auto">
          <LeadFormModal 
            program="landing-page" 
            triggerLabel="Get started today!"
            variant="primary"
            appearance="default"
            triggerClassName="w-full py-4 rounded-xl shadow-xl font-semibold transition-all duration-300 hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;


