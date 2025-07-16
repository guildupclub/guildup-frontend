"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, Star, Shield, Zap, Check, Sparkles } from "lucide-react";
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
      name: "Nikhar Matta",
      specialty: "Life Coach, Emotional Healing, Relationship Coaching, Therapy",
      rating: 4.8,
      sessions: 100,
      avatar: "/experts/nikhar.jpg",
      verified: true,
      available: true,
      url: "https://www.guildup.club/community/Bettermind-with-Nikhar-6821cae798627fbe232cc209/profile"
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
    }
  ];

  const handleCreatorButtonClick = () => {
    if (!session) {
      // localStorage.setItem("openCreatorModal", "true");
      signIn(undefined, {
        callbackUrl: `${window.location.origin}?hero=1`,
      });
      return;
    }
    setIsDialogOpen(false);
     router.push("/onboarding");

  };

  const handleBannerClick = () => {
    if(activeCommunity){
      router.push(`/community/${activeCommunity.name}-${activeCommunity.id}/profile`)
    }
    else {
      toast.info("You need to be an expert to join the campaign");
    }
  }

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

  return (
    <div className="relative min-h-[100vh] lg:h-[calc(100vh-80px)] w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
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
        <div className="pt-12 lg:pt-16 pb-8 lg:pb-16 min-w-full">
          {/* Campaign Banner - Show to all users */}
          <motion.div
            className="mb-4 lg:mb-6 -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-4 sm:px-6 text-white text-sm font-medium text-center shadow-lg">
              {/* Mobile Layout */}
              <div className="flex md:hidden items-center justify-center gap-2 pt-2 cursor-pointer hover:bg-white/10 transition-colors duration-200" onClick={handleBannerClick}>
                <span className="text-lg">🔥</span>
                <span className="font-semibold text-xs">Spotlight Campaign - Only 25 Experts!</span>
                <svg
                  className="h-3 w-3 ml-2 transition-transform duration-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-center gap-2 w-full cursor-pointer hover:bg-white/10 transition-colors duration-200" onClick={handleBannerClick}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <span className="font-semibold">GuildUp Spotlight Campaign Launching Soon — Only 25 Experts Will Be Featured!</span>
                </div>
                <div className="ml-4 flex items-center gap-2 text-xs bg-white/20 px-3 py-1 rounded-full">
                  <span>🎯</span>
                  <span>0% Commission, Homepage Spotlight & Access to 20,000+ Users</span>
                </div>
                <svg
                  className="h-4 w-4 ml-3 transition-transform duration-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            className="flex justify-center mb-6 lg:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 bg-white/90 backdrop-blur-sm border border-blue-200/60 rounded-full shadow-sm">
              <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
              <span className="text-xs lg:text-sm font-medium text-blue-700">95% see results in 4 weeks</span>
            </div>
          </motion.div>

          {/* Bifurcated Hero Layout */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">

            {/* Left Side - CTA Content */}
            <motion.div
              className="flex flex-col justify-center space-y-6 lg:space-y-8 text-center lg:text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Main Headline and Description */}
              <div className="space-y-4 lg:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 leading-tight">
                  Expert guidance for
                  <span className="block font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    meaningful growth
                  </span>
                </h1>

                <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Connect with verified professionals who deliver real results.
                </p>
              </div>

              {/* Rotating Success Stories */}
              <motion.div
                className="relative h-6 lg:h-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {successStories.map((story, index) => (
                  <motion.p
                    key={index}
                    className="absolute inset-0 text-base lg:text-lg font-medium italic text-gray-800 flex items-center justify-center lg:justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: index === currentStoryIndex ? 1 : 0,
                      y: index === currentStoryIndex ? 0 : -10
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {story}
                  </motion.p>
                ))}
              </motion.div>

              {/* CTA Actions */}
              <div className="space-y-4 lg:space-y-6">
                {/* Main CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="flex justify-center lg:justify-start"
                >
                  <Button
                    onClick={handleStartJourneyClick}
                    size="lg"
                    className="h-12 lg:h-14 px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base lg:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  >
                    <span className="flex items-center gap-2 lg:gap-3">
                      <Rocket className="h-4 w-4 lg:h-5 lg:w-5" />
                      Start your journey
                      <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Side - Featured Experts */}
            <motion.div
              className="space-y-4 lg:space-y-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="text-center lg:text-left mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-light text-gray-900 mb-2">
                  Meet our <span className="font-semibold text-blue-600">top experts</span>
                </h2>
                <p className="text-sm lg:text-base text-gray-600">Vetted professionals with proven results</p>
              </div>

              {/* GuildUp Featured Experts Carousel */}
              <div className="relative w-full max-w-[90vw] xl:max-w-[1600px] mx-auto overflow-hidden group py-6">
                <div
                  className="carousel-track flex items-stretch gap-6 group-hover:[animation-play-state:paused]"
                  style={{
                    animation: 'carousel-marquee 16s linear infinite',
                  }}
                >
                  {featuredExperts.concat(featuredExperts).map((expert, idx) => (
                    <div
                      key={expert.name + idx}
                      className="flex flex-col items-center justify-between bg-white/80 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-100 p-5 w-[90vw] max-w-xs sm:min-w-[250px] sm:w-[260px] sm:h-[320px] mx-1 transition-all duration-300 hover:shadow-2xl hover:scale-105"
                    >
                      <div className="flex flex-col items-center w-full flex-grow">
                        <div className="mb-2 w-full flex flex-col items-center justify-center">
                          <div className="w-20 h-20 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-white shadow mx-auto bg-gray-50 flex items-center justify-center">
                            <Image
                              src={expert.avatar}
                              alt={expert.name}
                              width={144}
                              height={144}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 mt-2 mb-1 text-center w-full truncate" title={expert.name}>{expert.name}</h3>
                          <div className="text-blue-700 text-xs font-medium mb-1 text-center flex flex-wrap justify-center gap-1 w-full max-w-full overflow-hidden" style={{ minHeight: '40px', maxHeight: '40px' }}>
                            {expert.specialty.split(',').slice(0,3).map((spec, i) => (
                              <span key={i} className="inline-block px-2 py-0.5 bg-blue-50 rounded-lg text-xs font-semibold max-w-[90px] truncate align-middle whitespace-nowrap overflow-hidden text-ellipsis" title={spec.trim()}>{spec.trim()}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-700 mb-1 mt-auto">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{expert.rating}</span>
                          <span className="text-gray-400">· {expert.sessions}+ sessions</span>
                        </div>
                      </div>
                      <button
                        className="mt-1 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-xs w-full"
                        onClick={() => window.open(expert.url, '_blank', 'noopener,noreferrer')}
                        style={{ marginTop: 'auto' }}
                      >
                        View Profile
                      </button>
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
                      gap: 1rem;
                    }
                  }
                `}</style>
                {/* Dedicated visible area overlay to always show 2-3 cards */}
                <div className="pointer-events-none absolute inset-0 z-10" style={{
                  background: 'linear-gradient(to right, #f8fafc 0%, rgba(248,250,252,0.7) 10%, rgba(248,250,252,0) 25%, rgba(248,250,252,0) 75%, rgba(248,250,252,0.7) 90%, #f8fafc 100%)'
                }} />
              </div>
            </motion.div>

          </div>

          {/* Mobile Expert CTA - Simple and Minimal */}
          <motion.div
            className="block lg:hidden text-center mt-8 px-4"
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