"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  User,
  Calendar,
  Trophy,
  Star,
  Target,
  Zap,
  Plus,
  Share2,
} from "lucide-react";
import { AddOfferingDialog } from "../profile/AddOfferingdialog";
import { useCallback, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Share } from "next/font/google";
import { StringConstants } from "../common/CommonText";
import { toast } from "sonner";
import { FaRegShareFromSquare } from "react-icons/fa6";

interface WebinarOfferBannerProps {
  isBankAdded: boolean;
  isCalendarConnected: boolean;
  offerings: Array<{ type: string; _id: string }>;
  totalBookings: number;
  className?: string;
}
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

export function WebinarOfferBanner({
  isBankAdded,
  isCalendarConnected,
  offerings = [],
  totalBookings,
  className = "",
}: WebinarOfferBannerProps) {
  const step1Complete = isBankAdded && isCalendarConnected;
  const step2Complete =
    step1Complete &&
    offerings.some((o) => o?.type?.toLowerCase() === "consultation");
  const step3Complete = step2Complete && totalBookings >= 3;

  const completedSteps = [step1Complete, step2Complete, step3Complete].filter(
    Boolean
  ).length;
  const stepsRemaining = 3 - completedSteps;
  const isEligible = totalBookings >= 3;
  const [offering, setOffering] = useState<Offering[]>([]);
  const memberDetails = useSelector(
    (state: RootState) => state.member.memberDetails
  );

  const params = useParams();
  const communityParam = params?.["community-Id"] as string;
  const lastHyphenIndex = communityParam ? communityParam.lastIndexOf("-") : -1;
  const activeCommunityId =
    lastHyphenIndex !== -1
      ? communityParam.substring(lastHyphenIndex + 1)
      : null;

  const isOwner =
    memberDetails &&
    memberDetails.is_owner === true &&
    memberDetails.community_id === activeCommunityId;

  const communityName =
    lastHyphenIndex !== -1
      ? communityParam.substring(0, lastHyphenIndex)
      : null;
  const communityIdFromParam =
    lastHyphenIndex !== -1
      ? communityParam.substring(lastHyphenIndex + 1)
      : null;
  const cleanedCommunityName =
    communityName ||
    "".replace(/\s+/g, "-").replace(/\|/g, "-").replace(/-+/g, "-");
  const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
  const communityParams = `${encodedCommunityName}-${communityIdFromParam}`;

  const fetchOfferings = useCallback(async () => {
    if (!activeCommunityId) return;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/community/${activeCommunityId}`
      );

      if (response.data.r === "s") {
        setOffering(
          Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data]
        );
      }
    } catch (error) {
      console.error("Error fetching offerings:", error);
    }
  }, [activeCommunityId]);

  if (isEligible) {
    return (
      <Card
        className={`border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 ${className}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-800 font-semibold text-sm">
                Campaign Eligible
              </span>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
              Qualified
            </Badge>
          </div>
          <div className="text-center py-4">
            <h2 className="text-xl font-bold text-green-800 mb-2">
              🎉 Now you are eligible for campaign!
            </h2>
            <p className="text-green-700 text-sm mb-4">
              You&apos;ve reached {totalBookings} bookings and qualified for our
              campaign benefits.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  const handleShareClick = async () => {
    try {
      const shareUrl = `${window.location.origin}/community/${communityParams}/profile`;

      const baseLink = process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING;
      console.log("baseLink", baseLink);
      const response = await axios.post(`${baseLink}/shorten`, {
        longUrl: shareUrl,
      });
      if (response.data.r === "s") {
        const shortenedUrl = response.data.shortUrl;
        await navigator.clipboard.writeText(shortenedUrl);
        toast.success("Link copied to clipboard!");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error shortening URL:", error);
      toast.error("Failed to copy link. Please try again.");
    }
  };
  return (
    <Card className={`border-gray-200 bg-white shadow-sm ${className}`}>
      <CardContent className="p-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-blue-600 mb-1 flex items-center gap-1.5">
            🔥 You&apos;re Just {stepsRemaining} Step
            {stepsRemaining !== 1 ? "s" : ""} Away from Being Spotlight on
            Guildup!
          </h1>
          <p className="text-gray-600 text-sm">
            20,000+ users will visit Guildup this month. Only 25 experts will be
            spotlighted - make sure you&apos;re one of them.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-100">
            <Star className="h-4 w-4 text-blue-600" />
            <div>
              <div className="font-semibold text-blue-800 text-xs">
                Homepage Spotlight
              </div>
              <div className="text-[10px] text-gray-600">
                Top-of-feed feature
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-md border border-orange-100">
            <Target className="h-4 w-4 text-orange-600" />
            <div>
              <div className="font-semibold text-orange-800 text-xs">
                Reels + Ads
              </div>
              <div className="text-[10px] text-gray-600">Reach thousands</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md border border-green-100">
            <Zap className="h-4 w-4 text-green-600" />
            <div>
              <div className="font-semibold text-green-800 text-xs">
                0% Commission
              </div>
              <div className="text-[10px] text-gray-600">Keep all earnings</div>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="relative flex justify-between items-center mb-6 px-4">
          {/* Progress Line */}
          <div className="absolute top-5 left-16 right-16 h-1 bg-gray-200 z-0">
            <div
              className="h-1 bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min((completedSteps / 2) * 100, 100)}%` }}
            />
          </div>

          {/* Step 1 - Left */}
          <div className="flex flex-col items-center text-center w-20 z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${
                step1Complete ? "bg-blue-500" : "bg-blue-100"
              }`}
            >
              {step1Complete ? (
                <CheckCircle className="h-5 w-5 text-white" />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div
              className={`font-semibold text-xs ${
                step1Complete ? "text-blue-800" : "text-gray-600"
              }`}
            >
              Profile
            </div>
            <div className="text-[10px] text-gray-500">Add details</div>
          </div>

          {/* Step 2 - Middle */}
          <div className="flex flex-col items-center text-center w-24 z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${
                step2Complete
                  ? "bg-blue-500"
                  : !step1Complete
                  ? "bg-gray-200"
                  : "bg-blue-500"
              }`}
            >
              {step2Complete ? (
                <CheckCircle className="h-5 w-5 text-white" />
              ) : (
                <Calendar
                  className={`h-5 w-5 ${
                    !step1Complete ? "text-gray-400" : "text-white"
                  }`}
                />
              )}
            </div>
            <div
              className={`font-semibold text-xs whitespace-nowrap   ${
                step2Complete
                  ? "text-blue-800 py-3"
                  : !step1Complete
                  ? "text-gray-500"
                  : "text-blue-800"
              }`}
            >
              Add Discovery Call
            </div>
            {/* Add Call Button - Show only if step 2 is incomplete */}
            {step1Complete && !step2Complete && isOwner && (
              <AddOfferingDialog onOfferingAdded={fetchOfferings} />
            )}
          </div>

          {/* Step 3 - Right */}
          <div className="flex flex-col items-center text-center w-20 z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${
                step3Complete
                  ? "bg-blue-500"
                  : !step2Complete
                  ? "bg-gray-200"
                  : "bg-blue-100"
              }`}
            >
              {step3Complete ? (
                <CheckCircle className="h-5 w-5 text-white" />
              ) : (
                <Trophy
                  className={`h-5 w-5 ${
                    !step2Complete ? "text-gray-400" : "text-blue-600"
                  }`}
                />
              )}
            </div>

            <div
              className={`font-semibold text-xs whitespace-nowrap ${
                step3Complete
                  ? "text-blue-800"
                  : !step2Complete
                  ? "text-gray-500"
                  : "text-gray-600"
              }`}
            >
              Get 3 Bookings -{" "}
              <span className="font-bold">
                {" "}
                {totalBookings >= 3
                  ? `${totalBookings}/3 ✓`
                  : `${totalBookings}/3`}
              </span>
            </div>
            {/* <div className="text-[10px] text-gray-500">
              {totalBookings >= 3
                ? `${totalBookings}/3 ✓`
                : `${totalBookings}/3`}
            </div> */}
            {step1Complete && step2Complete && !step3Complete && isOwner && (
              <Button
                size="sm"
                variant="default"
                className="flex items-center rounded-lg border-blue-200 px-3  text-white"
                onClick={handleShareClick}
                title="Share Offering"
              >
                Share Profile
                <FaRegShareFromSquare className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="text-center text-blue-600 text-sm mb-4">
          Share your GuildUp link to get booked and earn 100%.
        </div>
      </CardContent>
    </Card>
  );
}
