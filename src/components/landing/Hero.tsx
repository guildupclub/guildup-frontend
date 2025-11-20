"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { primary, black, white } from "@/app/colours";

const Hero: React.FC = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      ref={heroRef}
      aria-labelledby="hero-title"
      className="relative min-h-[85vh] flex items-center overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)'
      }}
    >
      {/* Subtle decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{ background: primary, transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{ background: primary, transform: 'translate(-30%, 30%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div
            className="space-y-8"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
            }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center px-5 py-2.5 rounded-full border backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
              style={{
                backgroundColor: `${primary}08`,
                borderColor: `${primary}20`,
                transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                transition: 'transform 0.8s ease-out 0.2s, opacity 0.8s ease-out 0.2s',
                opacity: isVisible ? 1 : 0
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full mr-3 animate-pulse"
                style={{ backgroundColor: primary }}
              />
              <span
                className="text-sm font-semibold tracking-wide"
                style={{ color: primary, fontFamily: "'Poppins', sans-serif" }}
              >
                Trusted by 10,000+ users across India
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-6">
              <h1
                id="hero-title"
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight"
                style={{
                  color: black,
                  fontFamily: "'Poppins', sans-serif",
                  textShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <span
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
                    display: 'block'
                  }}
                >
                  Your wellness
                </span>
                <span
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s',
                    display: 'block'
                  }}
                >
                  journey
                </span>
                <span
                  style={{
                    color: primary,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.8s ease-out 0.5s, transform 0.8s ease-out 0.5s',
                    display: 'block',
                    background: `linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  starts here
                </span>
              </h1>
            </div>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s'
              }}
            >
              <button
                onClick={() => {
                  const allExpertsSection = document.getElementById('all-experts');
                  if (allExpertsSection) {
                    const headerOffset = 145;
                    const elementPosition = allExpertsSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
                className="group relative px-10 py-4.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden"
                style={{
                  backgroundColor: primary,
                  color: white,
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 15px 40px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 30px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
                }}
              >
                <span className="relative z-10">Take the 1st step</span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
                  }}
                />
              </button>

              <button
                onClick={() => router.push('/diagnostic')}
                className="group relative px-10 py-4.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden border-2"
                style={{
                  backgroundColor: white,
                  color: primary,
                  borderColor: primary,
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)';
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = primary;
                  (e.currentTarget as HTMLButtonElement).style.color = white;
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 15px 40px -10px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = white;
                  (e.currentTarget as HTMLButtonElement).style.color = primary;
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 30px -10px rgba(0, 0, 0, 0.1)';
                }}
              >
                <span className="relative z-10">Take the test</span>
              </button>
            </div>
          </div>

          {/* Right Image Grid */}
          <div
            className="relative lg:h-[580px] flex items-center justify-center"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(30px) scale(0.95)',
              transition: 'opacity 1s ease-out 0.4s, transform 1s ease-out 0.4s'
            }}
          >
            <div className="grid grid-cols-2 gap-5 lg:gap-6 items-center justify-center">
              {["/hero/1.svg", "/hero/2.svg", "/hero/3.svg", "/hero/4.svg"].map((src, i) => {
                // Different sizes for each image to create visual interest
                // Image 1: Large, Image 2: Medium, Image 3: Medium, Image 4: Large
                const sizeClasses = [
                  'max-w-[200px] max-h-[200px] lg:max-w-[320px] lg:max-h-[320px]', // Image 1: Large
                  'max-w-[160px] max-h-[160px] lg:max-w-[240px] lg:max-h-[240px]', // Image 2: Medium
                  'max-w-[160px] max-h-[160px] lg:max-w-[240px] lg:max-h-[240px]', // Image 3: Medium
                  'max-w-[200px] max-h-[200px] lg:max-w-[320px] lg:max-h-[320px]', // Image 4: Large
                ];

                return (
                  <div
                    key={src}
                    className={`relative group w-full h-full ${sizeClasses[i]}`}
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
                      transition: `opacity 0.8s ease-out ${0.7 + i * 0.1}s, transform 0.8s ease-out ${0.7 + i * 0.1}s`
                    }}
                  >
                    {/* Layered shadow effect */}
                    <div
                      className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                      style={{
                        background: `radial-gradient(circle, ${primary}20 0%, transparent 70%)`,
                        transform: 'scale(1.1)'
                      }}
                    />
                    <div
                      className="absolute -inset-1 rounded-2xl opacity-30 group-hover:opacity-60 transition-all duration-300 blur-sm"
                      style={{
                        background: `linear-gradient(135deg, ${primary}40, transparent)`,
                        transform: 'scale(1.05)'
                      }}
                    />

                    {/* Image container */}
                    <div className="relative overflow-hidden rounded-2xl">
                      <img
                        src={src}
                        alt="Wellness visual"
                        className="relative w-full h-full object-cover rounded-2xl transition-all duration-500 group-hover:scale-110"
                        style={{
                          border: `2px solid rgba(255, 255, 255, 0.8)`,
                          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                          filter: 'brightness(1) saturate(1)'
                        }}
                      />

                      {/* Subtle overlay gradient */}
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />

                      {/* Shine effect on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-500 -translate-x-full group-hover:translate-x-full"
                        style={{
                          background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


