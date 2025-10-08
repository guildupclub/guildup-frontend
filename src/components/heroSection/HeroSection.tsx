"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, Star, Shield, Zap, Check, Sparkles, Heart, Brain, Dumbbell, Users, Target, TrendingUp, Search } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Dialog } from "../ui/dialog";
import CreatorForm from "../form/CreatorForm";
import { useSession, signIn } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { toast } from "sonner";
import Image from "next/image";

export default function Hero() {
  const { data: session } = useSession();
  const user = useSelector((state: RootState) => state.user);
  const activeCommunity = useSelector((state: any) => state.channel.activeCommunity);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isCreator = user?.user?.is_creator ? true : false;
  const router = useRouter();
  const { isInstalled } = usePWAInstall();

  // Problem tags/icons for top right section with softer gradients and search integration
  const problemTags = [
    { icon: Brain, label: "Anxiety", color: "from-violet-100 to-purple-200", searchTerm: "anxiety" },
    { icon: Heart, label: "PCOS", color: "from-pink-100 to-rose-200", searchTerm: "PCOS" },
    { icon: Dumbbell, label: "Weight Loss", color: "from-emerald-100 to-teal-200", searchTerm: "weight loss" },
    { icon: Users, label: "Breakup", color: "from-orange-100 to-red-200", searchTerm: "breakup" },
    { icon: Target, label: "Confidence", color: "from-blue-100 to-indigo-200", searchTerm: "confidence" },
    { icon: TrendingUp, label: "Gut Health", color: "from-green-100 to-emerald-200", searchTerm: "gut health" }
  ];

  // Rotating success stories for confidence building
  const successStories = [
    "I finally got my sleep schedule right ✨",
    "I discovered what food actually suits my body 🥗",
    "I achieved my dream weight in just 3 months 💪",
    "I learned to manage my time like a pro ⏰",
    "I overcame my anxiety with the right guidance 🧠",
    "I built the confidence I always wanted 🌟",
    "I created healthy habits that actually stick 🎯",
    "I found peace through mindfulness practice 🧘"
  ];

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % successStories.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [successStories.length]);

  // Premium expert showcase with original blue theme
  const featuredExperts = [
    {
      name: "Amit Garg",
      specialty: "Weight training, Nutrition, Fat-Loss, Strength",
      rating: 4.9,
      sessions: 250,
      avatar: "/experts/amit.jpg",
      verified: true,
      available: true,
      url: "https://www.guildup.club/community/GetfitwithAmit-682dabd74264957c9ad90a64/profile"
    },
    {
      name: "Annie",
      specialty: "Life Coach, Emotional Healing, Relationship Coaching, Therapy",
      rating: 4.8,
      sessions: 100,
      avatar: "https://storage.googleapis.com/v0-bucket/communities/6873fd21bb8cdb102a32e33c/profile/f4d27e63-bf17-4cd2-b7a6-829e54a70f9b.jpg",
      verified: true,
      available: true,
      url: "https://www.guildup.club/community/Anahata-by-Annie-6873fd21bb8cdb102a32e33c/profile"
    },
    {
      name: "Ashlesha Bhadoria",
      specialty: "Yoga, Pranayam, PCOD, Pregnancy yoga, Fitness",
      rating: 5.0,
      sessions: 580,
      avatar: "/experts/ashlesha.jpg",
      verified: true,
      available: true,
      url: "https://www.guildup.club/community/SimpliYoga-with-Ashlesha-683f18575411ca44bde8f746/profile"
    },
    {
      name: "Khushi Tayal",
      specialty: "Anxiety, Trauma, Stress, Relationship Issues",
      rating: 5,
      sessions: 100,
      avatar: "https://storage.googleapis.com/v0-bucket/communities/685bcf2d76aa736a1c6853fe/profile/a1fff12e-dda3-4bf1-9b16-4038dc63201a.jpg",
      verified: true,
      available: true,
      url: "https://www.guildup.club/community/Khushi-Tayal-685bcf2d76aa736a1c6853fe/profile"
    },
    {
      name: "Anand Shinde",
      specialty: "Ashtanga flow, yoga, reiki, healing",
      rating: 4.8,
      sessions: 1000,
      avatar: "https://storage.googleapis.com/v0-bucket/communities/685c0e9d76aa736a1c687af9/profile/00104767-c45b-4b50-ab09-dc8ac9ff2efc.jpg",
      verified: true,
      available: true,
      url: "https://www.guildup.club/community/Anand-Shinde-685c0e9d76aa736a1c687af9/profile"
    },
    {
      name: "Shreya",
      specialty: "Relationship, Reiki",
      rating: 4.9,
      sessions: 600,
      avatar: "https://storage.googleapis.com/v0-bucket/communities/68527e2fa05733beb31e6380/profile/2218b5ee-d5f4-4eb5-ae9a-54e252007100.jpg",
      verified: true,
      available: true,
      url: "https://www.guildup.club/community/Shreya-ICF-Certified-Life-Coach-68527e2fa05733beb31e6380/profile"
    },
    {
      name: "Gurpreet",
      specialty: "Diet, PCOD",
      rating: 4.8,
      sessions: 200,
      avatar: "https://storage.googleapis.com/v0-bucket/communities/67e56d8f2f015046fc642cd8/profile/WhatsApp%20Image%202025-04-02%20at%2014.15.07.jpeg",
      verified: true,
      available: true,
      url: "https://www.guildup.club/community/Get-fit-with-Gurpreet-67e56d8f2f015046fc642cd8/profile"
    }
  ];

  const handleCreatorButtonClick = () => {
    if (!session) {
      localStorage.setItem("openCreatorModal", "true");
      signIn(undefined, {
        callbackUrl: `${window.location.origin}?hero=1`,
      });
      return;
    }
    setIsDialogOpen(true);
  };



  const handleStartJourneyClick = () => {
    // Scroll to the categories/experts section
    const categoriesSection = document.getElementById('scroll-target-border');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Handle problem tag click for search integration
  const handleProblemTagClick = (searchTerm: string) => {
    // Navigate to search page with the search term
    router.push(`/api/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="relative min-h-[100vh] lg:h-[calc(100vh-64px)] w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Sophisticated Background Elements with Original Blue Theme */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Enhanced gradient meshes with blue theme */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-indigo-100/30 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-100/30 to-pink-100/20 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Subtle blue-tinted texture */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-multiply">
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-indigo-700" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`,
          }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-4 lg:pt-6 pb-4 lg:pb-8 min-w-full">
          {/* Main Hero Content */}
          <div className="max-w-7xl mx-auto">
            {/* Centered Search Section */}
            <motion.div
              className="flex flex-col items-center justify-center space-y-6 lg:space-y-8 relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Subtle Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-indigo-50/10 rounded-3xl -z-10"></div>
              
              {/* Search Heading - Cleaner and Calmer */}
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 lg:mb-3">
                  Your Journey. Our <span className="text-blue-600">Trusted Experts</span>.
                </h1>
                <p className="text-sm lg:text-base text-gray-700 max-w-2xl mx-auto font-medium">
                  <span className="text-blue-600 font-semibold">120+ experts</span> across Therapy, Mental Health, Nutrition, and more.
                </p>
              </div>

              {/* Search Bar - Cleaner and Smaller */}
              <div className="w-full max-w-2xl lg:max-w-3xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for Therapy, Mental Health, Nutrition..."
                    className="w-full h-12 lg:h-14 px-5 lg:px-6 py-3 text-sm lg:text-base bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        if (target.value.trim()) {
                          router.push(`/api/search?q=${encodeURIComponent(target.value.trim())}`);
                        }
                      }
                    }}
                  />
                  <button
                    className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input.value.trim()) {
                        router.push(`/api/search?q=${encodeURIComponent(input.value.trim())}`);
                      }
                    }}
                  >
                    <Search className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              </div>

              {/* Search Suggestions - Cleaner and Subtle */}
              <div className="w-full max-w-2xl -mt-2">
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { text: "Therapy", icon: "💬" },
                    { text: "PCOS", icon: "🌸" },
                    { text: "Gut Health", icon: "🫀" },
                    { text: "Weight Loss", icon: "⚖️" },
                    { text: "Anxiety", icon: "😌" }
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => router.push(`/api/search?q=${encodeURIComponent(suggestion.text)}`)}
                      className="px-3 py-1.5 text-sm lg:text-base bg-white border border-gray-200 text-gray-700 rounded-full transition-all duration-200 whitespace-nowrap hover:bg-gray-50 hover:border-gray-300 flex items-center gap-1.5"
                    >
                      <span className="text-sm">{suggestion.icon}</span>
                      <span>{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Expert Cards Section - Raised Up with Increased Spacing */}
          <motion.div
            className="mt-6 lg:mt-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {/* Section Header */}
            <div className="text-center mb-3 lg:mb-4">
              <h2 className="text-xl lg:text-2xl font-light text-gray-900 mb-1">
                Meet our <span className="font-semibold text-blue-600">top experts</span>
              </h2>
              <p className="text-sm text-gray-600">Trusted professionals with proven results</p>
            </div>

            {/* Enhanced Expert Cards Carousel with Larger Images */}
            <div className="relative w-full max-w-7xl mx-auto overflow-hidden group">
              <div
                className="carousel-track flex items-stretch gap-5 group-hover:[animation-play-state:paused]"
                style={{
                  animation: 'carousel-marquee 40s linear infinite',
                }}
              >
                {featuredExperts.concat(featuredExperts).map((expert, idx) => (
                  <div
                    key={expert.name + idx}
                    className="flex flex-col items-center justify-between bg-white/90 bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-200/50 p-3 w-[220px] sm:w-[240px] h-[300px] mx-1 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-blue-300"
                  >
                    <div className="flex flex-col items-center w-full h-full">
                      <div className="w-full flex flex-col items-center justify-start h-full">
                        <div className="w-32 h-28 sm:w-36 sm:h-32 rounded-xl overflow-hidden border-3 border-white shadow-xl mx-auto bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center mb-2">
                          <Image
                            src={expert.avatar}
                            alt={expert.name}
                            width={144}
                            height={128}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        <div className="flex flex-col items-center w-full flex-grow justify-start space-y-1 mt-2">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                            {expert.name}
                          </h3>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {expert.specialty.split(',').slice(0, 2).map((specialty, tagIdx) => (
                              <span
                                key={tagIdx}
                                className="px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-xs font-medium max-w-[85px] truncate"
                                style={{ minHeight: '20px' }}
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-semibold">{expert.rating}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-500 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0 1 1 0 002 0zM16 11a4 4 0 00-4 4h2a2 2 0 012-2z" />
                              </svg>
                              {expert.sessions}+
                            </span>
                          </div>
                          <div className="flex-grow max-h-2"></div>
                          <button
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all duration-200 text-xs w-full transform hover:scale-105 mt-2"
                            onClick={() => window.open(expert.url, '_blank', 'noopener,noreferrer')}
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <style jsx>{`
                .carousel-track {
                  width: max-content;
                }
                @keyframes carousel-marquee {
                  0% { transform: translateX(-50%); }
                  100% { transform: translateX(0); }
                }
                @media (max-width: 1024px) {
                  .carousel-track {
                    gap: 1.25rem;
                  }
                }
              `}</style>
              {/* Dedicated visible area overlay to always show 4-5 cards */}
              <div className="pointer-events-none absolute inset-0 z-10" style={{
                background: 'linear-gradient(to right, #f8fafc 0%, rgba(248,250,252,0.7) 5%, rgba(248,250,252,0) 20%, rgba(248,250,252,0) 80%, rgba(248,250,252,0.7) 95%, #f8fafc 100%)'
              }} />
            </div>
          </motion.div>

          {/* Mobile Expert CTA - Simple and Minimal */}
          <motion.div
            className="block lg:hidden text-center mt-4 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <p className="text-sm text-gray-600">
              Are you an expert looking to get discovered?{" "}
              <span 
                onClick={handleCreatorButtonClick}
                className="text-blue-600 underline cursor-pointer hover:text-blue-700 transition-colors duration-200"
              >
                Join now
              </span>
            </p>
          </motion.div>

        </div>
      </div>

      {/* Creator Form Dialog */}
      <Dialog open={session ? isDialogOpen : false} onOpenChange={setIsDialogOpen}>
        {session && (
          <CreatorForm onClose={() => setIsDialogOpen(false)} />
        )}
      </Dialog>
    </div>
  );
}