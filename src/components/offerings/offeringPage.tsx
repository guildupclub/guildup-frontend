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
    <div className="w-full max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-3xl shadow-xl grid md:grid-cols-3 overflow-hidden">
        <div className="bg-gray-50 p-6 lg:py-10 flex flex-col items-center text-center border-r">
          <div
            className="w-full h-40 bg-cover bg-center rounded-t-3xl"
            style={{ backgroundImage: `url(${bgImgUrl})` }}
          ></div>

          <div className="relative flex justify-center -mt-16">
            <div className="relative">
              <img
                src={avatarImgUrl || "/avatar-placeholder.png"}
                alt={fullName}
                className="w-40 h-40 object-cover border-4 border-white shadow"
              />
              {isBankAdded && (
                <RiVerifiedBadgeFill className="absolute -right-1 top-3/4 transform -translate-y-1/2 translate-x-1/2 h-12 w-12 lg:mt-4 text-primary drop-shadow-md bg-white rounded-full" />
              )}
            </div>
          </div>

          <h3 className="text-2xl font-semibold mt-4">{fullName}</h3>
          <div className="mt-4 space-y-2 text-sm text-gray-700 text-left">
            {experience > 0 && (
              <p>
                🎓{" "}
                <span className="text-base font-semibold">{experience}+</span>{" "}
                Years Experience
              </p>
            )}

            {sessionsTaken > 0 && (
              <p>
                👥{" "}
                <span className="text-base font-semibold">
                  {sessionsTaken}+
                </span>{" "}
                Clients helped
              </p>
            )}

            {communityDetails?.youtube_followers > 0 && (
              <p className="flex items-center gap-1">
                <FaYoutube className="text-red-600" />
                <span className="text-base font-semibold">
                  {formatNumber(communityDetails?.youtube_followers)}+
                </span>{" "}
                Followers
              </p>
            )}

            {communityDetails?.instagram_followers > 0 && (
              <p className="flex items-center gap-1">
                <FaInstagram className="text-pink-600" />
                <span className="text-base font-semibold">
                  {formatNumber(communityDetails?.instagram_followers)}+
                </span>{" "}
                Followers
              </p>
            )}

            {communityDetails?.linkedin_followers > 0 && (
              <p className="flex items-center gap-1">
                <FaLinkedin className="text-blue-600" />
                <span className="text-base font-semibold">
                  {formatNumber(communityDetails?.linkedin_followers)}+
                </span>{" "}
                Followers
              </p>
            )}

            {languageList?.length > 0 && (
              <p>
                🗣️{" "}
                <span className="text-base font-semibold">
                  {languageList.join(", ")}
                </span>
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 md:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded">
              Most Popular
            </span>
            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
              Next Available: Tomorrow
            </span>
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
              1:1 Online
            </span>
            <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded">
              Flexible Slots
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <p className="text-gray-600 text-sm">{description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-500" />
              <span>Duration: {duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <VideoIcon className="w-4 h-4 text-gray-500" />
              <span>Format: Video Call</span>
            </div>
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-gray-500" />
              <span>Type: 1:1 Session</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpenCheckIcon className="w-4 h-4 text-gray-500" />
              <span>Sessions: {sessionCount}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl mt-6">
            <h4 className="font-medium text-sm text-gray-800 mb-2">
              ✅ What to Expect
            </h4>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>
                Tailored guidance designed around your unique goals and
                challenges
              </li>
              <li>
                Proven tools & expert techniques to help you make lasting
                progress
              </li>
              <li>
                A safe and supportive space to grow with clarity, compassion,
                and accountability
              </li>
            </ul>

            <h4 className="font-medium text-sm text-gray-800 mt-5">
              🎯 How It Works
            </h4>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
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
                You'll receive a private, secure link — no setup or app needed
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

          <div className="p-6 bg-white rounded-2xl shadow flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-xl font-semibold">
              ₹{price?.toLocaleString("en-IN")}{" "}
              <span className="text-sm font-normal">per session</span>
            </div>
            <Button
              onClick={handleBookNow}
              className="mt-4 md:mt-0 w-full md:w-auto"
            >
              Book Your Session
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
          communityId={communityId}
        />
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 justify-center">
        <span>✅ 100% Refund Policy</span>
        <span>🔁 Easy Reschedule</span>
        <span>🔒 Secure & Private</span>
      </div>
    </div>
  );
}
