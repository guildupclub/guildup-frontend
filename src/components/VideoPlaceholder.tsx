"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";

interface VideoPlaceholderProps {
  title?: string;
  duration?: string;
  thumbnail?: string;
  videoUrl?: string;
  className?: string;
}

export default function VideoPlaceholder({
  title = "How GuildUp Transforms Your Coaching Journey",
  duration = "2:34",
  thumbnail = "https://res.cloudinary.com/dzvdh7yez/image/upload/v1749150247/Screenshot_2025-06-06_003351_t9zwvy.png",
  videoUrl = "https://www.youtube.com/watch?v=lEmW6Vyi2qg",
  className = "",
}: VideoPlaceholderProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract the YouTube video ID
  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : "";
  };

  return (
    <motion.div
      className={`relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50 shadow-2xl ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Video Container */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)
              `,
            }}
          />
        </div>

        {/* Thumbnail or iFrame */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isPlaying ? (
            <iframe
              className="w-full h-full"
              src={getYoutubeEmbedUrl(videoUrl)}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Play button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <motion.button
              onClick={() => setIsPlaying(true)}
              className="group relative w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl hover:bg-white transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Play
                className="w-8 h-8 text-gray-800 ml-1 group-hover:text-blue-600 transition-colors"
                fill="currentColor"
              />
              <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping animation-delay-75"></div>
            </motion.button>

            <motion.h3
              className="text-white text-lg font-semibold px-8 text-center mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {title}
            </motion.h3>
          </div>
        )}

        {/* Duration Badge */}
        {/* <motion.div
          className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Clock className="w-3 h-3" />
          {duration}
        </motion.div> */}
      </div>

      {/* Bottom Section */}
      <motion.div
        className="p-6 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              Discover Your Potential
            </h4>
            <p className="text-gray-600 text-sm">
              See how our coaching platform transforms lives and careers
            </p>
          </div>
          <motion.button
            onClick={() => window.open(videoUrl, "_blank")}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 w-full md:w-auto mt-4 md:mt-0 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Watch Now
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
