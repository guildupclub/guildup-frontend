"use client";
import React, { useEffect, useRef, useState } from "react";
import { primary, white, black } from "@/app/colours";
import LeadFormModal from "@/components/programs/LeadFormModal";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, Users, Calendar, ArrowDown, ArrowRight } from "lucide-react";

const steps = [
  { 
    title: "Choose the program", 
    desc: "Pick the program that fits your goals.",
    icon: CheckCircle2,
    number: "01"
  },
  { 
    title: "Find your expert", 
    desc: "We match you to vetted professionals.",
    icon: Users,
    number: "02"
  },
  { 
    title: "Begin your journey", 
    desc: "Book and start guided sessions.",
    icon: Calendar,
    number: "03"
  },
];

const StepCard = ({ step, index, ref, isInView }: { step: typeof steps[0], index: number, ref: React.RefObject<HTMLDivElement>, isInView: boolean }) => {
  const Icon = step.icon;
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex-1 flex flex-col items-center"
    >
      <div className="flex flex-col items-center gap-6 lg:gap-8 w-full">
        {/* Icon Card */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={isInView ? { scale: 1 } : { scale: 0.9 }}
          transition={{ duration: 0.5, delay: index * 0.15 + 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="relative flex-shrink-0"
        >
          <div 
            className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${primary}15 0%, ${primary}08 100%)`,
              border: `2px solid ${primary}20`,
              boxShadow: `0 8px 32px -8px ${primary}20`
            }}
          >
            {/* Decorative background circles */}
            <div 
              className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 rounded-full opacity-20 blur-2xl transition-opacity duration-300"
              style={{ background: primary }}
            />
            <div 
              className="absolute bottom-0 left-0 w-16 h-16 lg:w-20 lg:h-20 rounded-full opacity-15 blur-xl transition-opacity duration-300"
              style={{ background: primary }}
            />
            
            {/* Icon */}
            <Icon 
              className="relative z-10 transition-transform duration-300 w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20" 
              style={{ color: primary }}
              strokeWidth={2}
            />
            
            {/* Step number badge */}
            <div 
              className="absolute -top-2 -right-2 w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-xs lg:text-sm font-bold text-white shadow-lg"
              style={{ backgroundColor: primary }}
            >
              {step.number}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 text-center w-full px-2">
          <h3 
            className="text-xl md:text-2xl lg:text-3xl font-semibold mb-2 lg:mb-3"
            style={{ fontFamily: "'Poppins', sans-serif", color: black }}
          >
            {step.title}
          </h3>
          <p 
            className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {step.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const HowItWorks: React.FC = () => {
  const [showStickyButton, setShowStickyButton] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const programsSectionRef = useRef<HTMLElement | null>(null);
  
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const step1InView = useInView(step1Ref, { once: true, margin: "-50px" });
  const step2InView = useInView(step2Ref, { once: true, margin: "-50px" });
  const step3InView = useInView(step3Ref, { once: true, margin: "-50px" });
  
  const stepInViews = [step1InView, step2InView, step3InView];
  const stepRefs = [step1Ref, step2Ref, step3Ref];

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
    <section 
      ref={sectionRef}
      aria-labelledby="how-title" 
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ backgroundColor: white }}
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{ background: primary, transform: 'translate(30%, -30%)' }}
        />
        <div 
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{ background: primary, transform: 'translate(-30%, 30%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <h2 
            id="how-title" 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "'Poppins', sans-serif", color: black }}
          >
            <span style={{ color: primary }}>Start healing</span> Within
          </h2>
          <p 
            className="text-lg md:text-xl lg:text-2xl text-gray-600"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Three simple steps to start your journey
          </p>
        </motion.div>

        {/* Steps - Horizontal on desktop, vertical on mobile */}
        <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-4 xl:gap-8 lg:items-start">
          {steps.map((step, idx) => {
            const stepInView = stepInViews[idx];
            const stepRef = stepRefs[idx];
            
            return (
              <div key={step.title} className="flex flex-col lg:flex-row items-center lg:items-start flex-1">
                <StepCard step={step} index={idx} ref={stepRef} isInView={stepInView} />
                
                {/* Flow connector - Vertical on mobile, Horizontal on desktop */}
                {idx < steps.length - 1 && (
                  <>
                    {/* Mobile: Vertical connector */}
                    <motion.div 
                      className="flex justify-center my-6 lg:hidden"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={stepInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4, delay: idx * 0.15 + 0.5, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <div className="relative">
                        <motion.div
                          className="w-0.5 h-12 mx-auto rounded-full"
                          style={{ backgroundColor: primary }}
                          initial={{ height: 0 }}
                          animate={stepInView ? { height: 48 } : { height: 0 }}
                          transition={{ duration: 0.6, delay: idx * 0.15 + 0.7, ease: [0.4, 0, 0.2, 1] }}
                        />
                        <motion.div
                          initial={{ y: -10, opacity: 0 }}
                          animate={stepInView ? { y: 0, opacity: 1 } : { y: -10, opacity: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.15 + 1, ease: [0.4, 0, 0.2, 1] }}
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                        >
                          <ArrowDown size={24} style={{ color: primary }} />
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    {/* Desktop: Horizontal connector */}
                    <motion.div 
                      className="hidden lg:flex items-center justify-center flex-shrink-0 px-2 xl:px-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={stepInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4, delay: idx * 0.15 + 0.5, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <div className="relative flex items-center">
                        <motion.div
                          className="h-0.5 w-12 xl:w-16 rounded-full"
                          style={{ backgroundColor: primary }}
                          initial={{ width: 0 }}
                          animate={stepInView ? { width: 64 } : { width: 0 }}
                          transition={{ duration: 0.6, delay: idx * 0.15 + 0.7, ease: [0.4, 0, 0.2, 1] }}
                        />
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={stepInView ? { x: 0, opacity: 1 } : { x: -10, opacity: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.15 + 1, ease: [0.4, 0, 0.2, 1] }}
                          className="relative"
                        >
                          <ArrowRight 
                            size={24} 
                            style={{ color: primary }}
                          />
                        </motion.div>
                        <motion.div
                          className="h-0.5 w-12 xl:w-16 rounded-full"
                          style={{ backgroundColor: primary }}
                          initial={{ width: 0 }}
                          animate={stepInView ? { width: 64 } : { width: 0 }}
                          transition={{ duration: 0.6, delay: idx * 0.15 + 0.7, ease: [0.4, 0, 0.2, 1] }}
                        />
                      </div>
                    </motion.div>
                  </>
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


