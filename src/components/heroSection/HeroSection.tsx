"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TrendingUp, Users, Target, Sparkles } from "lucide-react";
import SearchBar from "../SearchBar";
import React, { useState } from "react";
import { Dialog } from "../ui/dialog";
import CreatorForm from "../form/CreatorForm";
import { useSession, signIn } from "next-auth/react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";

export default function Hero() {
  const { data: session } = useSession();
  const user = useSelector((state: RootState) => state.user);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isCreator = user?.user?.is_creator ? true : false;
  const router = useRouter();

  const suggestionButtons = [
    "Mental Health",
    "Anxiety",
    "Diet and Nutrition",
    "Relationship Issues",
    "Stress Management",
    "Self-Awareness",
    "Mindfulness",
    "Confidence",
    "Therapy",
    "Weight Management",
  ];

  const handleCreatorButtonClick = () => {
    if (!session) {
      toast("Sign in required", {
        action: {
          label: "Sign In",
          onClick: () =>
            signIn(undefined, {
              callbackUrl: `${window.location.origin}?hero=1`,
            }),
        },
      });
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/api/search?q=${encodeURIComponent(suggestion)}`);
  };

  return (
    <div className="min-h-[90vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background elements - restored original for desktop */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Simplified animated geometric shapes */}
        <motion.div
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-indigo-100/15 rounded-full blur-3xl will-change-transform"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-violet-100/15 to-purple-100/10 rounded-full blur-2xl will-change-transform"
          animate={{
            scale: [1, 1.2, 1],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.25] animate-pulse"
          style={{
            backgroundImage: `
              radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.4) 2px, transparent 0)
            `,
            backgroundSize: "40px 40px",
            animation: "gridMove 20s ease-in-out infinite",
          }}
        />

        {/* Floating particles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full will-change-transform ${
              i % 2 === 0 ? "bg-blue-300/30" : "bg-indigo-300/30"
            }`}
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 6 + i * 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/2 to-white/5" />
      </div>

      {/* Content - Mobile optimized, desktop preserved */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-16">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge - Enhanced for mobile only */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 md:border-gray-200/50 text-gray-700 md:text-gray-700 px-4 py-2 md:px-6 md:py-3 rounded-full text-sm font-medium mb-6 md:mb-8 shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            Real experts, real guidance
          </motion.div>

          {/* Heading - Mobile optimized spacing */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {/* Book Experts{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Buy Services
            </span> */}
            <span> Work 1-on-1 with trusted </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              coaches,
            </span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              therapists,
            </span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              nutritionists
            </span>
            <span> & more</span>
          </motion.h1>

          {/* Subtitle - Mobile optimized */}
          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 md:mb-12 max-w-2xl md:max-w-3xl mx-auto leading-relaxed px-2 md:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Connect with expert coaches and mentors who&apos;ll guide your
            <span className="hidden md:inline"> personal and professional</span>
            <span className="md:hidden font-semibold text-gray-700">
              {" "}
              personal
            </span>{" "}
            growth journey */}
            Join a growing community of over{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              2.5 lakh
            </span>{" "}
            people and connect with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 pl-1">
              60+
            </span>{" "}
            verified coaches, therapists, nutritionists, and wellness experts
          </motion.p>

          {/* Benefits - Mobile cards, desktop original */}
          <motion.div
            className="mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {/* Mobile version - Card layout */}
            <div className="md:hidden grid grid-cols-3 gap-2 max-w-sm mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-green-100 text-center">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  🌱
                </div>
                <span className="text-xs font-semibold text-gray-800">
                  Personalized Coaching
                </span>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-blue-100 text-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  🎯
                </div>
                <span className="text-xs font-semibold text-gray-800">
                  Clear Roadmaps
                </span>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-purple-100 text-center">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                   💬
                </div>
                <span className="text-xs font-semibold text-gray-800">
                  Real 
                  <br /> Conversations
                </span>
              </div>
            </div>

            {/* Desktop version - Original layout */}
            <div className="hidden md:flex flex-wrap justify-center gap-6 md:gap-8">
              <div className="flex items-center gap-2 text-gray-700">
                🌱 Personalized Coaching
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                🎯 Clear Roadmaps
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                 💬 Real Conversations
              </div>
            </div>
          </motion.div>

          {/* Search bar */}
          <motion.div
            className="mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <SearchBar />
          </motion.div>

          {/* Suggestion buttons - Mobile optimized, desktop original */}
          <motion.div
            className="mb-8 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            {/* Mobile version */}
            <div className="md:hidden">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500 font-medium">
                  Popular searches:
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
                {suggestionButtons.slice(0, 6).map((suggestion, index) => {
                  const colors = [
                    "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
                    "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
                    "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
                    "bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100",
                    "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100",
                    "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100",
                  ];

                  return (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`px-3 py-1.5 ${colors[index]} rounded-full border transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md hover:scale-105`}
                    >
                      {suggestion === "Diet and Nutrition"
                        ? "Diet & Nutrition"
                        : suggestion === "Relationship Issues"
                        ? "Relationships"
                        : suggestion === "Stress Management"
                        ? "Stress Relief"
                        : suggestion === "Self-Awareness"
                        ? "Self-Growth"
                        : suggestion}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop version - Original */}
            <div className="hidden md:flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {suggestionButtons.map((suggestion, index) => {
                const styles = [
                  "bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 border border-gray-200/60 hover:border-gray-300",
                  "bg-gradient-to-r from-gray-50 to-slate-100 hover:from-gray-100 hover:to-slate-200 text-gray-700 border border-gray-200/60",
                  "bg-white/70 hover:bg-white/90 text-gray-700 hover:text-gray-800 border border-emerald-200/60 hover:border-emerald-300/80",
                  "bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 text-gray-700 border border-rose-200/60",
                  "bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-gray-700 border border-blue-200/60",
                  "bg-white/80 hover:bg-white text-gray-700 hover:text-indigo-800 border border-indigo-200/60 hover:border-indigo-300",
                  "bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 text-gray-700 border border-teal-200/60",
                  "bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 text-gray-700 border border-amber-200/60",
                  "bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 text-gray-700 border border-purple-200/60",
                  "bg-white/80 hover:bg-white text-gray-700 hover:text-emerald-800 border border-emerald-200/60 hover:border-emerald-300",
                ];

                return (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-6 py-3 ${styles[index]} rounded-full transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md backdrop-blur-sm hover:scale-105`}
                  >
                    {suggestion}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Mobile CTA - Enhanced for mobile only */}
          {!isCreator && (
            <motion.div
              className="md:hidden mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-blue-100 max-w-sm mx-auto text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Join as Expert
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Ready to share your expertise and make an impact?
                  </p>
                </div>

                <Dialog
                  open={session ? isDialogOpen : false}
                  onOpenChange={setIsDialogOpen}
                >
                  <Button
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={handleCreatorButtonClick}
                  >
                    Start Your Journey
                  </Button>
                  {session && (
                    <CreatorForm onClose={() => setIsDialogOpen(false)} />
                  )}
                </Dialog>
              </div>
            </motion.div>
          )}

          {/* Desktop CTA - Original */}
          {!isCreator && (
            <motion.div
              className="hidden md:block mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="font-medium px-4 leading-tight text-gray-700 mb-4">
                Are you a coach or expert ready to make an impact?
              </h2>
              <Dialog
                open={session ? isDialogOpen : false}
                onOpenChange={setIsDialogOpen}
              >
                <Button
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-semibold shadow-lg"
                  onClick={handleCreatorButtonClick}
                >
                  🚀 Join as Expert
                </Button>
                {session && (
                  <CreatorForm onClose={() => setIsDialogOpen(false)} />
                )}
              </Dialog>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
