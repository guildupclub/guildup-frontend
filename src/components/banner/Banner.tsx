"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { FaArrowRightArrowLeft, FaArrowRightLong } from "react-icons/fa6";
import { Button } from "../ui/button";

export default function WelcomeBanner() {
  const { data: session, status } = useSession();
  const user = useSelector((state: RootState) => state.user);
  const isCreator = user?.user?.is_creator ? true : false;
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem("hasSeenWelcomeBanner");
    const heroParam = searchParams.get("hero");

    // Reset banner visibility after sign-in with hero=1 or hero=2
    if (
      status === "authenticated" &&
      (heroParam === "1" || heroParam === "2") &&
      !isCreator
    ) {
      localStorage.removeItem("hasSeenWelcomeBanner");
      router.replace(window.location.pathname); // Clean up URL
    }

    // Show banner if not seen and user is not a creator
    if (!hasSeenBanner && !isCreator) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [status, searchParams, isCreator, router]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hasSeenWelcomeBanner", "true");
  };

  const handleGoToProfile = () => {
    handleClose();
    if (status === "unauthenticated") {
      signIn(undefined, {
        callbackUrl: `${window.location.origin}?hero=2`,
      });
    } else {
      router.push("/profile");
    }
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

        <div className=" relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-300 p-2 lg:p-4 shadow-2xl">
          {/* <div className="mb-2 flex items-center justify-between hidden lg:block">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-800"></div>
              <span className=" font-bold text-white">WELCOME TO GUILDUP</span>
            </div>
            <div className="text-lg font-bold text-gray-800">GuildUp</div>
          </div> */}

          <div className="mb-2 lg:mb-4">
            {/* <h2 className="mb-2 text-2xl font-bold text-gray-800 leading-tight">
              Discover Trusted Coaches & Experts
            </h2> */}
            {/* <p className="text-gray-700 text-sm">
              Connect with professionals who can guide your journey to success
            </p> */}
          </div>
          <div className="relative h-[500px] w-full mb-2 lg:mb-4">
            <Image
              src="https://res.cloudinary.com/dzvdh7yez/image/upload/v1750171742/WhatsApp_Image_2025-06-17_at_20.16.45_400e029e_n4eh1y.jpg"
              alt="Welcome banner"
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>

          {/* Action button */}
          <Button
            onClick={handleGoToProfile}
            className="bg-gray-800 hover:bg-gray-700 w-full px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center animate-arrow-bounce hover:scale-100 lg:hover:scale-x-105 transition-transform duration-300 cursor-pointer"
          >
            Book Your Spot <FaArrowRightLong />
          </Button>
        </div>
      </div>
    </div>
  );
}
