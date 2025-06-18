"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { FaArrowRightLong } from "react-icons/fa6";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";

export default function WelcomeBanner() {
  const pathname = usePathname(); // Moved inside the component
  const { status } = useSession();
  const user = useSelector((state: RootState) => state.user);
  const isCreator = user?.user?.is_creator ? true : false;
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  if (pathname === "/signin") return null;

  // Always show banner - reset visibility when session status changes
  useEffect(() => {
    setIsVisible(true);
  }, [status]);

  // Always show banner regardless of creator status
  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleGoToProfile = () => {
   
    if (status === "unauthenticated") {
      signIn(undefined, {
        callbackUrl: `${window.location.origin}?hero=2`,
      });
    } else {
      router.push(
         "https://www.guildup.club/community/SimpliYoga-with-Ashlesha-683f18575411ca44bde8f746/profile"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 max-w-md w-full">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          aria-label="Close banner"
        >
          ✕
        </button>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-300 p-2 lg:p-4 shadow-2xl">
          <div className="relative h-[500px] w-full mb-2 lg:mb-4">
            <Image
              src="https://res.cloudinary.com/dzvdh7yez/image/upload/v1750171742/WhatsApp_Image_2025-06-17_at_20.16.45_400e029e_n4eh1y.jpg"
              alt="Welcome banner"
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
          <Button
            onClick={handleGoToProfile}
            className="bg-gray-800 hover:bg-gray-700 w-full px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 animate-arrow-bounce hover:scale-100 lg:hover:scale-x-105 transition-transform duration-300 cursor-pointer"
          >
            Book Your Spot <FaArrowRightLong />
          </Button>
        </div>
      </div>
    </div>
  );
}
