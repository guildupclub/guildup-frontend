"use client";
import React from "react";
import Link from "next/link";
import { usePrograms } from "@/lib/fetching/usePrograms";
import { primary, white } from "@/app/colours";

const ProgramsGrid: React.FC = () => {
  const { data, isLoading, isError } = usePrograms();

  if (isLoading) return null;
  if (isError || !data || data.length === 0) return null;

  return (
    <section aria-labelledby="programs-title" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 id="programs-title" className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Our Programs
          </h2>
          <p className="text-gray-600 mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Choose a path and begin your journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((p) => (
            <Link 
              key={p.id} 
              href={`/programs/${p.id}`} 
              className="relative group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 bg-white"
              style={{ 
                boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.1)',
                border: `2px solid ${primary}20`
              }}
            >
              {/* Outer glow effect */}
              <div 
                className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
                style={{
                  background: `radial-gradient(circle, ${primary}30 0%, transparent 70%)`,
                  zIndex: -1
                }}
              />
              
              {/* Animated border glow */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  border: `2px solid ${primary}40`,
                  boxShadow: `0 0 0 2px ${primary}20, 0 0 20px -5px ${primary}40`,
                  borderRadius: '1rem'
                }}
              />
              
              {/* Inner content */}
              <div className="relative bg-white rounded-2xl">
                <div className="aspect-[4/3] bg-white flex items-center justify-center relative overflow-hidden">
                  {/* Subtle gradient overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${primary}05 0%, transparent 100%)`
                    }}
                  />
                  
                  {p.illustration ? (
                    <img 
                      src={p.illustration} 
                      alt={p.title} 
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110" 
                    />
                  ) : (
                    <div 
                      className="w-56 h-56 sm:w-64 sm:h-64 rounded-xl relative z-10" 
                      style={{ backgroundColor: `${primary}10` }} 
                    />
                  )}
                </div>
                
                <div className="p-5 relative">
                  <h3 
                    className="text-xl font-semibold transition-colors duration-300 group-hover:text-primary" 
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {p.title}
                  </h3>
                  {p.subtitle && (
                    <p className="text-gray-600 mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{p.subtitle}</p>
                  )}
                  <div className="mt-4">
                    <span 
                      className="inline-block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group-hover:scale-105 group-hover:shadow-md" 
                      style={{ 
                        backgroundColor: primary, 
                        color: white, 
                        fontFamily: "'Poppins', sans-serif",
                        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      Explore
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Animated corner accent */}
              <div 
                className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${primary}20 0%, transparent 50%)`,
                  borderRadius: '0 2rem 0 2rem',
                  clipPath: 'polygon(100% 0, 100% 50%, 50% 100%, 0 100%, 0 0)'
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsGrid;


