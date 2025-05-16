"use client";

import { Button } from "@/components/ui/button";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ChevronDown, ArrowRight, Play } from "lucide-react";
import SearchBar from "../SearchBar";
import React, { useState } from "react";
import Image from "next/image";
import { Dialog } from "../ui/dialog";
import CreatorForm from "../form/CreatorForm";
import { StringConstants } from "../common/CommonText";
import { useSession ,signIn } from "next-auth/react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "@/redux/store";

export default function Hero() {
  const { data: session, status } = useSession();
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(true);
  const user = useSelector((state: RootState) => state.user);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const isCreator = user?.user?.is_creator ? true : false;

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });
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

  return (
    <section className="relative min-h-screen bg-white text-black flex flex-col justify-between overflow-hidden">
      <div className="container mx-auto px-6 py-16 flex flex-col lg:flex-row items-center justify-between relative z-10">
        {/* Left: Header and Content */}
        <div className="flex-1 flex flex-col justify-center items-start max-w-2xl mt-2">
          <h1 className="font-sans font-black uppercase text-zinc-900 text-[2.5rem] sm:text-6xl md:text-8xl leading-[1.05] tracking-tight mb-6 drop-shadow-lg">
            <span className="block text-zinc-900">Get Help That</span>
            <span className="block text-zinc-900">Truly Helps</span>
          </h1>
          {/* Avatars */}
          <div className="flex items-center space-x-[-12px] mb-6">
            <Image
              src="https://randomuser.me/api/portraits/women/1.jpg"
              alt="Avatar 1"
              width={48}
              height={48}
              className="rounded-full border-2 border-black"
            />
            <Image
              src="https://randomuser.me/api/portraits/women/2.jpg"
              alt="Avatar 2"
              width={48}
              height={48}
              className="rounded-full border-2 border-black"
            />
            <Image
              src="https://randomuser.me/api/portraits/men/3.jpg"
              alt="Avatar 3"
              width={48}
              height={48}
              className="rounded-full border-2 border-black"
            />
          </div>
          {/* Book Demo Call */}
          <div className="mb-6 w-full max-w-xs">
            <button
              className={`
                group relative flex items-center justify-between w-full
                bg-primary border-2 border-white
                rounded-full px-6 py-3
                font-semibold text-white text-lg
                shadow-lg
                transition-all duration-200
                hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-white/40
                before:absolute before:inset-0 before:rounded-full
                before:animate-glow before:z-[-1]
                overflow-hidden
              `}
              style={{
                boxShadow: "0 0 24px 0 rgba(255,255,255,0.15), 0 2px 8px 0 rgba(0,0,0,0.10)",
              }}
            >
              <span>Book Demo Call</span>
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black ml-2 transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-110">
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
            <style jsx>{`
              .before\\:animate-glow::before {
                content: "";
                background: linear-gradient(90deg, #fff 0%, #6366f1 50%, #fff 100%);
                opacity: 0.5;
                filter: blur(8px);
                z-index: -1;
                animation: glowPulse 2s infinite alternate;
              }
              @keyframes glowPulse {
                0% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            `}</style>
          </div>
          {/* Learn More */}
          <div className="flex items-center gap-3 mb-6">
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20">
              <Play className="w-5 h-5" />
            </button>
            <span className="text-lg">Learn More <span className="text-gray-400">about us</span></span>
          </div>
          {/* Tags */}
          {/* <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-sm">DESIGN</span>
            <span className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-sm">WEB DEVELOPMENT</span>
            <span className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-sm">UI/UX</span>
          </div> */}
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex justify-center items-center mt-12 lg:mt-0">
          <div className="relative rounded-[2.5rem] w-[350px] h-[100px] flex items-center justify-center shadow-2xl">
            <Image
              src="hero_girl.png"
              alt="Blush illustration"
              width={1200}
              height={1200}
              className="object-contain rounded-[1.5rem] drop-shadow-xl"
              priority
            />
          </div>
        </div>
      </div>

      {/* Bottom: Marketing Validators */}
      <div className="w-full flex flex-col items-end mb-6">
        <div className="flex flex-row gap-6 justify-center w-full max-w-4xl">
          <div className="rounded-2xl bg-blue-600 text-white p-6 min-w-[220px] min-h-[100px] flex flex-col justify-center items-start shadow-lg">
            <div className="font-bold text-lg mb-1">Certified Experts</div>
            <div className="text-sm opacity-80">Only the best, verified for you</div>
          </div>
          <div className="rounded-2xl bg-black text-white p-6 min-w-[220px] min-h-[100px] flex flex-col justify-center items-start shadow-lg border border-white/10">
            <div className="font-bold text-lg mb-1">One Stop Solution</div>
            <div className="text-sm opacity-80">All your needs, one platform</div>
          </div>
          <div className="rounded-2xl bg-yellow-300 text-black p-6 min-w-[220px] min-h-[100px] flex flex-col justify-center items-start shadow-lg">
            <div className="font-bold text-lg mb-1">Personalised Results</div>
            <div className="text-sm opacity-80">Tailored just for you</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketingCard({ color, label, main, icon, number }) {
  return (
    <div className={`relative rounded-2xl shadow-lg p-6 min-w-[240px] min-h-[140px] flex flex-col justify-between ${color}`}>
      {/* Tab/Notch */}
      <div className={`absolute -top-3 left-0 w-16 h-6 rounded-tl-2xl rounded-tr-lg ${color} z-10`} />
      {/* Content */}
      <div className="z-20">
        <div className="text-xs uppercase font-semibold mb-2">{label}</div>
        {main && <div className="font-bold text-lg">{main}</div>}
        {icon && <div className="text-4xl">{icon}</div>}
        {number && <div className="font-bold text-3xl">{number}</div>}
      </div>
      {/* Optional Arrow */}
      <div className="absolute top-3 right-4 text-black/60">
        {/* Replace with your arrow icon */}
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4-4 4 4"/></svg>
      </div>
    </div>
  );
}
