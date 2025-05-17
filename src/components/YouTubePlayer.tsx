"use client";

import { useRef, useEffect, useState } from "react";

interface YouTubePlayerProps {
  embedUrl: string;
  className?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function YouTubePlayer({
  embedUrl,
  className = "",
}: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const currentTimeRef = useRef<number>(0);
  const playerReadyRef = useRef<boolean>(false);
  const [apiLoaded, setApiLoaded] = useState(false);

  // Extract video ID from embed URL
  const getVideoId = () => {
    try {
      const url = new URL(embedUrl);
      return url.pathname.split("/").pop() || null;
    } catch (e) {
      // If URL parsing fails, try regex
      const match = embedUrl.match(/\/embed\/([^/?]+)/);
      return match ? match[1] : null;
    }
  };

  // Load YouTube API
  useEffect(() => {
    if (!document.getElementById("youtube-api")) {
      const tag = document.createElement("script");
      tag.id = "youtube-api";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // Setup the API ready callback
      window.onYouTubeIframeAPIReady = () => {
        setApiLoaded(true);
      };
    } else if (window.YT && window.YT.Player) {
      setApiLoaded(true);
    }

    return () => {
      // Save current time when component unmounts
      if (playerInstanceRef.current && playerReadyRef.current) {
        try {
          currentTimeRef.current = playerInstanceRef.current.getCurrentTime();
        } catch (e) {
          console.error("Error saving video time:", e);
        }
      }
    };
  }, []);

  // Initialize the player when API is loaded
  useEffect(() => {
    if (!apiLoaded || !playerRef.current) return;

    const videoId = getVideoId();
    if (!videoId) return;

    try {
      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
        },
        events: {
          onReady: (event: any) => {
            playerReadyRef.current = true;
            // Restore the previous playback position if available
            if (currentTimeRef.current > 0) {
              event.target.seekTo(currentTimeRef.current);
            }
          },
          onStateChange: (event: any) => {
            // Save current time periodically when playing
            if (event.data === 1) {
              // 1 = playing
              const saveInterval = setInterval(() => {
                if (playerInstanceRef.current && playerReadyRef.current) {
                  try {
                    currentTimeRef.current =
                      playerInstanceRef.current.getCurrentTime();
                  } catch (e) {
                    clearInterval(saveInterval);
                  }
                } else {
                  clearInterval(saveInterval);
                }
              }, 1000);

              // Clear interval when video pauses or ends
              const clearSaveInterval = () => {
                if (event.data !== 1) {
                  // Not playing
                  clearInterval(saveInterval);
                }
              };

              // Add event listener for state changes
              playerInstanceRef.current.addEventListener(
                "onStateChange",
                clearSaveInterval
              );

              // Clean up
              return () => {
                clearInterval(saveInterval);
                playerInstanceRef.current?.removeEventListener(
                  "onStateChange",
                  clearSaveInterval
                );
              };
            }
          },
        },
      });
    } catch (error) {
      console.error("Error initializing YouTube player:", error);
    }
  }, [apiLoaded, embedUrl]);

  return (
    <div className={`youtube-embed-container ${className}`}>
      <div ref={playerRef} className="w-full h-full"></div>
    </div>
  );
}
