"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { FaArrowRightLong } from "react-icons/fa6";
import { Button } from "../ui/button";
import { useState, useEffect, useCallback } from "react";
import { BookingDialog } from "../booking/Bookingdialog";
import axios from "axios";

interface Offering {
  _id: string;
  title: string;
  description: string;
  type: string;
  price: {
    amount: number;
    currency: string;
  };
  discounted_price?: string;
  when: Date;
  duration: number;
  is_free: boolean;
  tags: string[];
  rating: number;
  total_ratings: number;
}

export default function WelcomeBanner() {
  const pathname = usePathname();
  const { status } = useSession();
  const user = useSelector((state: RootState) => state.user);
  const isCreator = user?.user?.is_creator ?? false;
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const activeCommunityId = "683f18575411ca44bde8f746";

  const fetchOfferings = useCallback(async () => {
    if (!activeCommunityId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/community/${activeCommunityId}`
      );
      console.log("API Response:", response.data);
      if (response.data.r === "s") {
        setOfferings(
          Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data]
        );
      }
    } catch (error) {
      console.error("Error fetching offerings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeCommunityId]);

  useEffect(() => {
    fetchOfferings();
  }, []);

  useEffect(() => {
    console.log("Session status:", status); // Debug log
    setIsVisible(true);
  }, [status]);

  useEffect(() => {
    console.log("Current offerings:", offerings); // Debug log
  }, [offerings]);

  useEffect(() => {
    console.log("Selected offering:", selectedOffering); // Debug log
  }, [selectedOffering]);

  if (pathname === "/signin" || !isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleGoToProfile = () => {
    if (status === "unauthenticated") {
      console.log("User not authenticated, triggering signIn"); // Debug log
      signIn(undefined, {
        callbackUrl: `${window.location.origin}?hero=2`,
      });
    } else if (isLoading) {
      console.log("Offerings are still loading..."); // Debug log
    } else if (offerings.length > 0) {
      console.log("Setting selected offering:", offerings[0]); // Debug log
      setSelectedOffering(offerings[0]);
    } else {
      console.log("No offerings available"); // Debug log
      // Optionally show an alert or message to the user
      alert("No offerings available at the moment. Please try again later.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative mx-4 max-w-md w-full">
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
              disabled={isLoading}
            >
              Book Your Spot <FaArrowRightLong />
            </Button>
          </div>
        </div>
      </div>
      {selectedOffering && (
        <BookingDialog
          offering={{
            ...selectedOffering,
            discounted_price: selectedOffering.discounted_price
              ? Number(selectedOffering.discounted_price)
              : 0,
          }}
          isOpen={!!selectedOffering}
          onClose={() => setSelectedOffering(null)}
        />
      )}
    </>
  );
}
