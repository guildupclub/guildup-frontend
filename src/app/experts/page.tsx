"use client";

import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/Loader";
import MemoizedCommunityCard from "@/components/explore/MemoizedCommunityCard";
import { Brain, Dumbbell, Apple, Heart, Sparkles, Users, Filter } from "lucide-react";
import { primary, black, white } from "../colours";
import { WHATSAPP_NUMBER_DIGITS } from "@/config/constants";

interface Community {
  _id: string;
  name: string;
  image?: string;
  background_image?: string;
  user_id?: string;
  tags?: string[];
  min_offering_id?: string;
}

function ExpertsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "All Experts", icon: Users },
    { id: "mental-health", name: "Mental Health", icon: Brain },
    { id: "fitness", name: "Fitness", icon: Dumbbell },
    { id: "nutrition", name: "Nutrition", icon: Apple },
    { id: "relationship", name: "Relationship", icon: Heart },
    { id: "healing", name: "Healing", icon: Sparkles },
  ];

  useEffect(() => {
    const categoryParam = searchParams?.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setIsLoading(true);
        let url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/all?page=0&limit=24`;
        
        // Add category filter if not "all"
        if (selectedCategory !== "all") {
          url += `&category=${selectedCategory}`;
        }

        const res = await axios.get(url);
        if (res?.data?.r === "s" && Array.isArray(res.data.data)) {
          setCommunities(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch experts", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunities();
  }, [selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = categories.find(cat => cat.id === categoryId);
    
    // Update URL
    if (categoryId === "all") {
      router.push("/experts", { scroll: false });
    } else {
      router.push(`/experts?category=${categoryId}`, { scroll: false });
    }
  };

  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  return (
    <div style={{ backgroundColor: white }}>
      {/* Premium Header Section */}
      <section className="relative pt-1 pb-12 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full opacity-5 blur-3xl" style={{ backgroundColor: primary }}></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-3 blur-3xl" style={{ backgroundColor: primary }}></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Category Badge */}
            {currentCategory && currentCategory.id !== "all" && (
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border shadow-sm" style={{ 
                backgroundColor: `${primary}08`, 
                borderColor: `${primary}20`,
                color: primary
              }}>
                <currentCategory.icon className="w-4 h-4" />
                <span className="text-sm font-medium" style={{ fontFamily: 'Garamond, serif', fontWeight: '600' }}>
                  {currentCategory.name} Specialists
          </span>
              </div>
            )}
            
            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ 
              color: black, 
              fontFamily: 'Garamond, serif', 
              fontWeight: '700' 
            }}>
              {currentCategory && currentCategory.id !== "all" 
                ? `${currentCategory.name} Experts`
                : 'Expert Wellness Professionals'
              }
          </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-8 leading-relaxed" style={{ 
              color: `${black}CC`, 
              fontFamily: 'Garamond, serif', 
              fontWeight: '400' 
            }}>
              {currentCategory && currentCategory.id !== "all"
                ? `Connect with verified ${currentCategory.name.toLowerCase()} specialists who understand your unique needs and provide personalized care.`
                : 'Connect with verified professionals across all wellness categories for comprehensive, personalized care.'
              }
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm" style={{ color: `${black}80` }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }}></div>
                <span style={{ fontFamily: 'Garamond, serif', fontWeight: '500' }}>Licensed Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }}></div>
                <span style={{ fontFamily: 'Garamond, serif', fontWeight: '500' }}>Verified Credentials</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }}></div>
                <span style={{ fontFamily: 'Garamond, serif', fontWeight: '500' }}>Confidential Care</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Filter Section */}
      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filter Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primary}10` }}>
                  <Filter className="w-4 h-4" style={{ color: primary }} />
                </div>
                <h2 className="text-xl font-semibold" style={{ 
                  color: black, 
                  fontFamily: 'Garamond, serif', 
                  fontWeight: '600' 
                }}>
                  Explore by Specialty
                </h2>
              </div>
              <div className="text-sm" style={{ color: `${black}60`, fontFamily: 'Garamond, serif' }}>
                {communities.length} {communities.length === 1 ? 'expert' : 'experts'} available
              </div>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
            <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className="group relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{
                    backgroundColor: isSelected ? primary : white,
                    borderColor: isSelected ? primary : `${primary}20`,
                    color: isSelected ? white : black,
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg transition-colors duration-300 ${isSelected ? 'bg-white/20' : ''}`} 
                         style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${primary}10` }}>
                      <category.icon 
                        className="w-5 h-5" 
                        style={{ color: isSelected ? white : primary }} 
                      />
                    </div>
                    <span className="text-sm font-medium text-center" style={{ 
                      fontFamily: 'Garamond, serif', 
                      fontWeight: isSelected ? '600' : '500',
                      lineHeight: '1.2'
                    }}>
                      {category.name}
                    </span>
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ backgroundColor: white }}>
                      <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: primary }}>
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: white }}></div>
                      </div>
                    </div>
                  )}
            </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium Experts Grid */}
      <section className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ 
                  color: black, 
                  fontFamily: 'Garamond, serif', 
                  fontWeight: '700' 
                }}>
                  {isLoading ? 'Finding Experts...' : 
                   selectedCategory === "all" ? 'All Available Experts' : 
                   `${currentCategory?.name} Specialists`
                  }
                </h2>
                <p className="text-base" style={{ 
                  color: `${black}80`, 
                  fontFamily: 'Garamond, serif', 
                  fontWeight: '400' 
                }}>
                  {isLoading ? 'Please wait while we gather the best professionals for you' :
                   `${communities.length} verified professional${communities.length !== 1 ? 's' : ''} ready to help you`
                  }
                </p>
              </div>
              
              {/* Results Count Badge */}
              {!isLoading && (
                <div className="px-4 py-2 rounded-lg border" style={{ 
                  backgroundColor: `${primary}08`, 
                  borderColor: `${primary}20`,
                  color: primary
                }}>
                  <span className="text-sm font-medium" style={{ fontFamily: 'Garamond, serif' }}>
                    {communities.length} Result{communities.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            
            {/* Divider */}
            <div className="h-px w-full" style={{ backgroundColor: `${black}10` }}></div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
              <Loader />
                <p className="mt-4 text-sm" style={{ color: `${black}60`, fontFamily: 'Garamond, serif' }}>
                  Curating the perfect matches for you...
                </p>
              </div>
            </div>
          ) : (
            <>
              
              {communities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 w-full">
                  {communities.map((c, index) => {
                const id = c?._id;
                const cleanedName = (c?.name || "expert")
                  .replace(/\s+/g, "-")
                  .replace(/\|/g, "-")
                  .replace(/-+/g, "-");
                const href = id
                  ? `/community/${encodeURIComponent(cleanedName)}-${id}/profile`
                  : "/community";
                return (
                      <div 
                        key={id} 
                        className="flex items-stretch"
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <div className="w-full">
                          <MemoizedCommunityCard
                            community={c as any}
                            onClick={() => router.push(href)}
                          />
                        </div>
                      </div>
                );
              })}
            </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" 
                         style={{ backgroundColor: `${primary}08` }}>
                      {currentCategory?.icon && (
                        <currentCategory.icon className="w-10 h-10" style={{ color: primary }} />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-3" style={{ 
                      color: black, 
                      fontFamily: 'Garamond, serif', 
                      fontWeight: '700' 
                    }}>
                      Growing Our {currentCategory?.name} Network
                    </h3>
                    <p className="mb-6 leading-relaxed" style={{ 
                      color: `${black}80`, 
                      fontFamily: 'Garamond, serif', 
                      fontWeight: '400' 
                    }}>
                      We&apos;re actively recruiting top-tier {currentCategory?.name.toLowerCase()} professionals. 
                      Meanwhile, explore our other specialties or get personalized recommendations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => handleCategoryChange("all")}
                        className="px-6 py-3 rounded-lg border-2 transition-all duration-200 hover:scale-105"
                        style={{
                          borderColor: primary,
                          color: primary,
                          fontFamily: 'Garamond, serif',
                          fontWeight: '600'
                        }}
                      >
                        View All Experts
                      </button>
                      <button
                        onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER_DIGITS}?text=Hi! I would like a recommendation for an expert on GuildUp.`, "_blank")}
                        className="px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: primary,
                          color: white,
                          fontFamily: 'Garamond, serif',
                          fontWeight: '600'
                        }}
                      >
                        Get Recommendations
                      </button>
                    </div>
                  </div>
            </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ backgroundColor: primary }}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/20 blur-xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-white/20 blur-xl"></div>
            </div>
            
            <div className="relative p-8 sm:p-12 lg:p-16">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left max-w-2xl">
                  <h3 className="text-3xl sm:text-4xl font-bold mb-4" style={{ 
                    color: white, 
                    fontFamily: 'Garamond, serif', 
                    fontWeight: '700' 
                  }}>
                    Not sure which expert is right for you?
                  </h3>
                  <p className="text-lg mb-6 leading-relaxed" style={{ 
                    color: `${white}E6`, 
                    fontFamily: 'Garamond, serif', 
                    fontWeight: '400' 
                  }}>
                    Our wellness advisors will match you with the perfect specialist based on your unique needs, 
                    preferences, and goals. Get personalized recommendations in just minutes.
                  </p>
                  
                  {/* Trust Points */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm" style={{ color: `${white}CC` }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: white }}></div>
                      <span style={{ fontFamily: 'Garamond, serif', fontWeight: '500' }}>Free consultation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: white }}></div>
                      <span style={{ fontFamily: 'Garamond, serif', fontWeight: '500' }}>Expert matching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: white }}></div>
                      <span style={{ fontFamily: 'Garamond, serif', fontWeight: '500' }}>Instant response</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 min-w-fit">
            <button
                    className="px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{ 
                      backgroundColor: white, 
                      color: primary, 
                      fontFamily: 'Garamond, serif', 
                      fontWeight: '600' 
                    }}
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER_DIGITS}?text=Hi! I would like a recommendation for an expert on GuildUp.`, "_blank")}
            >
                    💬 Get Expert Recommendations
            </button>
                  <p className="text-xs text-center" style={{ color: `${white}99`, fontFamily: 'Garamond, serif' }}>
                    Usually responds within 5 minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function ExpertsLandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: white }}>
        <Loader />
      </div>
    }>
      <ExpertsContent />
    </Suspense>
  );
}


