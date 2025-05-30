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
    "Weight Management"
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
      {/* Optimized background with fewer animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Simplified animated geometric shapes - reduced from 3 to 2 */}
        <motion.div 
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-indigo-100/15 rounded-full blur-3xl will-change-transform"
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 20, 0]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-violet-100/15 to-purple-100/10 rounded-full blur-2xl will-change-transform"
          animate={{ 
            scale: [1, 1.2, 1],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 5
          }}
        />
        
        {/* Optimized grid pattern - single layer */}
        <div 
          className="absolute inset-0 opacity-[0.25] animate-pulse"
          style={{
            backgroundImage: `
              radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.4) 2px, transparent 0)
            `,
            backgroundSize: '40px 40px',
            animation: 'gridMove 20s ease-in-out infinite'
          }}
        />
        
        {/* Reduced floating particles - from 12 to 4 */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full will-change-transform ${
              i % 2 === 0 ? 'bg-blue-300/30' : 'bg-indigo-300/30'
            }`}
            style={{
              left: `${20 + (i * 20)}%`,
              top: `${30 + (i * 15)}%`,
            }}
            animate={{ 
              y: [0, -15, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 6 + (i * 1), 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
        
        {/* Simplified gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/2 to-white/5" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-16">
        <div className="text-center max-w-5xl mx-auto">
          
          {/* Simplified badge animation */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            Level up with experts
          </motion.div>

          {/* Optimized heading animation */}
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Book Experts{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Buy Services
            </span>
          </motion.h1>

          {/* Simplified subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Connect with expert coaches and mentors who'll guide your personal and professional growth journey
          </motion.p>

          {/* Simplified benefits */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 md:gap-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center gap-2 text-gray-700">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium">Accelerate Growth</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">1:1 Guidance</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Achieve Goals</span>
            </div>
          </motion.div>

          {/* Search bar with minimal animation */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <SearchBar />
          </motion.div>

          {/* Optimized suggestion buttons */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
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
          </motion.div>

          {/* Creator CTA for mobile */}
          {!isCreator && (
            <motion.div 
              className="md:hidden mt-16 flex flex-col items-center justify-center text-center"
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
