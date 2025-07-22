import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  VideoIcon,
  UsersIcon,
  BookOpenCheckIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingDialog } from "../booking/Bookingdialog";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { signIn, useSession } from "next-auth/react";
import { FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa6";
import numbro from "numbro";

interface Offering {
  _id: string;
  title: string;
  description: string;
  type: string;
  price: {
    amount: number;
    currency: string;
  };
  discounted_price: string;
  when: Date;
  duration: number;
  is_free: boolean;
  tags: string[];
  rating: number;
  total_ratings: number;
}

export default function OfferingDetails({
  offeringId,
}: Readonly<{
  offeringId: string;
}>) {
  const [userId, setUserId] = useState<string | null>(null);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [avatarImgUrl, setAvatarImgUrl] = useState("");
  const [bgImgUrl, setBgImgUrl] = useState("");
  const [communityDetails, setCommunityDetails] = useState<any>(null);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(
    null
  );
  const session = useSession();

  // Fetch offering data
  const { data: offeringData, isLoading: loadingOffering } = useQuery({
    queryKey: ["offering-data", offeringId],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/${offeringId}`
      );
      const providerId = res.data?.data?.provider_id?._id;
      const community = res.data?.data?.community_id;
      if (providerId) setUserId(providerId);
      if (community) setCommunityId(community);
      return res.data;
    },
    enabled: !!offeringId,
  });

  // Fetch user profile data
  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/profile`,
        {
          userId,
        }
      );
      return res.data;
    },
    enabled: !!userId,
  });

  // Fetch community details
  const { data: communityData, isLoading: loadingCommunity } = useQuery({
    queryKey: ["community-details", communityId],
    queryFn: async () => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/view`,
        {
          communityId,
        }
      );
      return res.data;
    },
    enabled: !!communityId,
  });

  // Fetch community profile (moved above the early return)
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["communityProfile", communityId],
    queryFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
        {
          communityId: communityId,
        }
      );

      if (response.data.r) {
        setCommunityDetails(response.data.data.community);
        if (response?.data?.data?.community?.image) {
          setAvatarImgUrl(response.data.data.community.image);
        } else {
          setAvatarImgUrl(
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.data.user.user_name}`
          );
        }

        if (response.data.data.community.background_image) {
          setBgImgUrl(response.data.data.community.background_image);
        } else {
          setBgImgUrl(
            "https://random-image-pepebigotes.vercel.app/api/random-image"
          );
        }

        return response.data.data;
      }
      throw new Error("Failed to fetch community profile");
    },
    enabled: !!communityId,
  });

  // Early return for loading state
  if (loadingOffering || loadingUser || loadingCommunity || isLoadingProfile) {
    return <Skeleton className="w-full h-96" />;
  }

  const offering = offeringData?.data;
  const user = userData?.data;
  const community = communityData?.data;

  const fullName = user?.name || "";
  const price = offering?.price?.amount || 0;
  const duration = offering?.duration || 60;
  const sessionCount = offering?.number_of_sessions || 1;
  const description = offering?.description || "";
  const title = offering?.title || "";
  const tags = offering?.tags || [];
  const languageList = user?.languages || [];
  const experience = user?.year_of_experience || 0;
  const sessionConduct = user?.session_conducted || 0;
  const isBankAdded = user?.isBankDetailsAdded;
  const sessionsTaken = user?.session_conducted || 0;
  const avatar = user?.image;
  const education = user?.education || "";
  const testimonials = community?.testimonials || [];

  const handleBookNow = async () => {
    setSelectedOffering(offering);
  };
  const formatNumber = (num: any) => {
    if (!num) return 0;
    if (num < 1000) return num;
    return numbro(num).format({ average: true, mantissa: 1 }).toUpperCase();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-6 sm:py-10 space-y-0">
      {/* Responsive flex card: horizontal on md+, vertical on mobile */}
      <div className="bg-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center md:items-stretch md:gap-8 p-4 sm:p-6 mb-0 relative z-0">
        {/* Avatar section */}
        <div className="flex flex-col items-center md:items-start justify-center md:justify-start md:w-1/4">
          <img
            src={avatarImgUrl || "/avatar-placeholder.png"}
            alt={fullName}
            className="w-40 h-40 sm:w-48 sm:h-48 object-cover border-4 border-white shadow rounded-full"
          />
        </div>
        {/* Info section */}
        <div className="flex-1 flex flex-col justify-center md:justify-start md:pl-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-center md:text-left mb-2 md:mb-3">{fullName}</h3>
          {/* Info grid: 2 columns on mobile, 3+ on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-700 mb-2">
            {experience > 0 && (
              <div className="flex items-center gap-1">
                <span role="img" aria-label="exp">🎓</span>
                <span className="font-semibold">{experience}+</span>
                <span>Years</span>
              </div>
            )}
            {sessionsTaken > 0 && (
              <div className="flex items-center gap-1">
                <span role="img" aria-label="clients">👥</span>
                <span className="font-semibold">{sessionsTaken}+</span>
                <span>Clients</span>
              </div>
            )}
            {languageList?.length > 0 && (
              <div className="flex items-center gap-1 col-span-2 md:col-span-1">
                <span role="img" aria-label="lang">🗣️</span>
                <span className="font-semibold">{languageList.join(", ")}</span>
              </div>
            )}
          </div>
          {/* Social stats and badges section (above session details) */}
          <div className="flex flex-col gap-2 mt-2">
            {/* Social stats row */}
            <div className="flex flex-row gap-4 justify-center md:justify-start items-center">
              {/* YouTube, Instagram, LinkedIn icons and follower counts */}
              {communityDetails?.youtube_followers > 0 && (
                <div className="flex items-center gap-1">
                  <FaYoutube className="text-red-600" />
                  <span className="font-semibold">{formatNumber(communityDetails?.youtube_followers)}+</span>
                </div>
              )}
              {communityDetails?.instagram_followers > 0 && (
                <div className="flex items-center gap-1">
                  <FaInstagram className="text-pink-600" />
                  <span className="font-semibold">{formatNumber(communityDetails?.instagram_followers)}+</span>
                </div>
              )}
              {communityDetails?.linkedin_followers > 0 && (
                <div className="flex items-center gap-1">
                  <FaLinkedin className="text-blue-600" />
                  <span className="font-semibold">{formatNumber(communityDetails?.linkedin_followers)}+</span>
                </div>
              )}
            </div>
            {/* Badges/tags row */}
            <div className="flex flex-row gap-2 justify-center md:justify-start items-center mt-1">
              {/* ...existing badges/tags code... */}
              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded">Most Popular</span>
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">1:1 Online</span>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">Flexible Slots</span>
            </div>
          </div>
          {/* Session details at the bottom of the card */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 py-2 md:py-3 w-full border-t border-gray-100 mt-3">
            <div className="flex flex-col items-center text-xs text-gray-700">
              <span className="font-semibold">Duration</span>
              <span>{duration ? `${duration} min` : '—'}</span>
            </div>
            <div className="flex flex-col items-center text-xs text-gray-700">
              <span className="font-semibold">Format</span>
              <span>Video Call</span>
            </div>
            <div className="flex flex-col items-center text-xs text-gray-700">
              <span className="font-semibold">Type</span>
              <span>1:1 Session</span>
            </div>
            <div className="flex flex-col items-center text-xs text-gray-700">
              <span className="font-semibold">Sessions</span>
              <span>{sessionCount || '—'}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Explicit margin to match info card spacing */}
      <div className="mt-2 sm:mt-4" />
      {/* Invisible divider for consistent spacing */}
      <div className="h-2 sm:h-4" aria-hidden="true"></div>
      {/* Title and description card */}
      <div className="bg-card rounded-xl border border-border/5 p-8 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">{title}</h2>
        <p className="whitespace-pre-line text-muted-foreground mb-0">{description}</p>
      </div>
      {/* Invisible divider for consistent spacing before info cards */}
      <div className="h-2 sm:h-4" aria-hidden="true"></div>
      {/* Details section with amount and book button at the top (desktop only) */}
      <div className="p-0 sm:p-0 md:col-span-2">
        {/* Desktop: amount and book button side by side */}
        <div className="hidden md:flex items-center justify-between gap-2 mb-2">
          <div className="text-lg sm:text-xl font-semibold">₹{price?.toLocaleString("en-IN")}</div>
          <Button onClick={handleBookNow} className="w-auto px-6 py-2 text-sm">Book Your Session</Button>
        </div>
        {/* Mobile: sticky book button at bottom */}
        <div className="block md:hidden h-16"></div>
        {/* What to Expect: only show on md+ screens */}
        <div className="hidden md:block bg-gray-50 border-l-4 border-green-200 px-3 py-2 sm:px-4 sm:py-3 rounded-md mt-3">
          <h4 className="font-medium text-xs sm:text-sm text-gray-800 mb-1 sm:mb-2">✅ What to Expect</h4>
          <ul className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 text-gray-700 pl-2">
            <li>Tailored guidance designed around your unique goals and challenges</li>
            <li>Proven tools & expert techniques to help you make lasting progress</li>
            <li>A safe and supportive space to grow with clarity, compassion, and accountability</li>
          </ul>
          <h4 className="font-medium text-xs sm:text-sm text-gray-800 mt-2 sm:mt-5">🎯 How It Works</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-2">
          <div className="p-4 rounded-xl bg-gray-50 text-center">
            <p className="font-medium text-sm mb-1">
              📅 Choose a Time That Suits You
            </p>
            <p className="text-xs text-gray-600">
              Browse flexible slots and book a session that fits your schedule
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 text-center">
            <p className="font-medium text-sm mb-1">
              🎥 Join Securely on Google Meet
            </p>
            <p className="text-xs text-gray-600">
              You&apos;ll receive a private, secure link — no setup or app
              needed
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 text-center">
            <p className="font-medium text-sm mb-1">
              🔄 Reflect, Apply, Grow
            </p>
            <p className="text-xs text-gray-600">
              Take your learnings into real life. Reflect on the shifts,
              celebrate the small wins.
            </p>
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
          communityId={communityId || ""}
        />
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 justify-center">
        <span>✅ 100% Refund Policy</span>
        <span>🔁 Easy Reschedule</span>
        <span>🔒 Secure & Private</span>
      </div>
    {/* Sticky Book Button for mobile */}
    <div className="block md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3 flex flex-row items-center justify-between shadow-lg">
      <div className="text-2xl font-extrabold text-gray-900">
        ₹{price?.toLocaleString("en-IN")}
      </div>
      <Button onClick={handleBookNow} className="ml-4 flex-1 max-w-xs text-base py-3 font-semibold">Book Your Session</Button>
    </div>
    <div className="-mt-4"></div>
  </div>
  );
}
