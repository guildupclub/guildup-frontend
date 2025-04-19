"use client";

import { Button } from "@/components/ui/button";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SearchBar from "../SearchBar";
import { useState } from "react";
import Image from "next/image";

export default function Hero() {
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(true);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white relative flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col justify-center min-h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="mb-8 bg-gradient-to-r from-[#5b6be1] to-[#357fe0] w-fit flex gap-2 py-[6px] pl-3 pr-4 mx-auto rounded-full font-semibold text-white">
            <Image
              alt="stars icon"
              src="https://conqrr.vercel.app/_next/static/media/bi_stars.7e13c393.svg"
              width={20}
              height={20}
              className="h-5 w-5"
            />
            Level Up with Experts
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <motion.span
              className="text-primary block mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="text-foreground">Expert Advice,</span> Real
              Results.
            </motion.span>
            <motion.span
              className="text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              with StreamLine
            </motion.span>
          </h1>
          <motion.p
            className="mt-6 text-xl text-muted font-medium max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Get expert advice from those who&apos;ve successfully done it. <br />{" "}
            Level up faster with strong community support.
          </motion.p>

          <motion.div
            className="mt-10 mb-16 md:mb-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <SearchBar />
          </motion.div>
        </motion.div>
      </div>

      {/* Animated background elements with enhanced visibility */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-100/60 to-indigo-200/60 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-indigo-100/60 to-blue-200/60 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-r from-blue-200/70 to-indigo-200/70 rounded-full blur-sm"
          animate={{
            y: [0, -20, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-gradient-to-l from-indigo-200/70 to-blue-200/70 rounded-full blur-sm"
          animate={{
            y: [0, 30, 0],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 inset-x-0 mx-auto flex flex-col items-center justify-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : 20
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.p
          className="text-sm text-gray-500 font-medium text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Scroll to explore
        </motion.p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-primary flex justify-center"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.div>
    </div>
  );
}
