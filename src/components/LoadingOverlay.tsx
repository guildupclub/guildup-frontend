"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  isVisible: boolean;
}

export default function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-[9999]"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 1, originX: 1 }}
          transition={{ 
            duration: 0.3,
            ease: "easeInOut"
          }}
        />
      )}
    </AnimatePresence>
  );
} 