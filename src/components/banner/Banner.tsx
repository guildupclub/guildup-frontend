"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";

export default function WelcomeBanner() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem("hasSeenWelcomeBanner");

    if (!hasSeenBanner) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hasSeenWelcomeBanner", "true");
  };

  const handleGoToProfile = () => {
    handleClose();
    if (!session)
      return signIn(undefined, {
        callbackUrl: `${window.location.origin}?hero=2`,
      });
    else router.push("/profile");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 max-w-md w-full">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </button>

     
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-400 via-purple-300 to-pink-200 p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700">
                WELCOME TO GUILDUP
              </span>
            </div>
            <div className="text-lg font-bold text-gray-800">GuildUp</div>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold text-gray-800 leading-tight">
              Discover Trusted Coaches & Experts
            </h2>
            <p className="text-gray-700 text-sm">
              Connect with professionals who can guide your journey to success
            </p>
          </div>
          <div className="relative h-48 w-full mb-6">
            <Image
              src="https://static.vecteezy.com/system/resources/thumbnails/010/658/619/small/welcome-sign-letters-with-blue-sky-background-welcome-banner-greeting-card-vector.jpg"
              alt="Welcome banner"
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>

          {/* Action button */}
          <button
            onClick={handleGoToProfile}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Get Started →
          </button>
        </div>
      </div>
    </div>
  );
}
