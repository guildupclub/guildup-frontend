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
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(
    null
  );
  const session = useSession();

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

  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/profile`, {
        userId,
      });
      return res.data;
    },
    enabled: !!userId,
  });

  const { data: communityData, isLoading: loadingCommunity } = useQuery({
    queryKey: ["community-details", communityId],
    queryFn: async () => {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/view`, {
        communityId,
      });
      return res.data;
    },
    enabled: !!communityId,
  });

  if (loadingOffering || loadingUser || loadingCommunity) {
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
    if (!session?.data?.user) {
      signIn(undefined, {
        callbackUrl: window.location.href,
      });
      return;
    }
    setSelectedOffering(offering);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-3xl shadow-xl grid md:grid-cols-3 overflow-hidden">
        <div className="bg-gray-50 p-6 lg:py-10 flex flex-col items-center text-center border-r">
          <div className="relative inline-block">
            <img
              src={avatar || "/avatar-placeholder.png"}
              alt={fullName}
              className="w-32 h-32 rounded-full object-cover"
            />
            {isBankAdded && (
              <RiVerifiedBadgeFill className="absolute -right-1 top-3/4 transform -translate-y-1/2 translate-x-1/2 h-10 w-10 text-primary drop-shadow-md bg-white rounded-full" />
            )}
          </div>

          <h3 className="text-2xl font-semibold mt-4">{fullName}</h3>
          {/* <p className="text-sm text-gray-600 mt-1">
            Clinical Psychologist & Mindfulness Expert
          </p> */}
          <div className="mt-4 space-y-2 text-sm text-gray-700 text-left">
            <p>🎓 {experience}+ Years Experience</p>
            <p>👥 {sessionsTaken}+ Clients helped</p>
            <p>🌐 {languageList.join(", ")}</p>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {tags.map(
              (
                tag:
                  | string
                  | number
                  | bigint
                  | boolean
                  | React.ReactElement<
                      unknown,
                      string | React.JSXElementConstructor<any>
                    >
                  | Iterable<React.ReactNode>
                  | React.ReactPortal
                  | Promise<
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactPortal
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | null
                      | undefined
                    >
                  | null
                  | undefined,
                i: React.Key | null | undefined
              ) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              )
            )}
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

            <h4 className="font-medium text-sm text-gray-800  mt-5">
              🎯 How It Works
            </h4>
          </div>

          <div className=" grid md:grid-cols-3 gap-4">
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

          {/* {testimonials.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <p className="text-sm italic text-gray-700 max-w-lg">
                &quot;Transformation isn&apos;t a one-time event — it&apos;s a journey
                we&apos;ll walk together, at your pace.&quot;
              </p>
            </div>
          )} */}
          <div className="p-6 bg-white rounded-2xl shadow flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-xl font-semibold">
              ₹{price?.toLocaleString("en-IN")}{" "}
              <span className="text-sm font-normal">per session</span>
            </div>
            {/* <div className="mt-2 text-sm text-gray-600">
              Next available: Tomorrow 11:00 AM
            </div> */}
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
