"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { IoVideocam } from "react-icons/io5";
import { Button } from "../ui/button";
import { ImUsers } from "react-icons/im";

import { toast } from "sonner";
import { GrInstagram } from "react-icons/gr";
import { BsYoutube } from "react-icons/bs";
import { FaLinkedinIn, FaBriefcase, FaBullseye } from "react-icons/fa";
import numbro from "numbro";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCommunityData } from "../../redux/communitySlice";
import { setActiveCommunity } from "../../redux/channelSlice";

interface MemoizedCommunityCardProps {
  community: any;
  onClick: () => void;
}

const MemoizedCommunityCard = React.memo<MemoizedCommunityCardProps>(
  ({ community, onClick }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const communityDetails = community?.community || community;

    const handleCardClick = useCallback(() => {
      if (!communityDetails || !communityDetails._id) {
        console.error("Invalid community data:", communityDetails);
        return;
      }

      // Create URL-friendly community name
      const cleanedCommunityName = communityDetails.name
        .replace(/\s+/g, "-")
        .replace(/\|/g, "-")
        .replace(/-+/g, "-");
      const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
      const communityParams = `${encodedCommunityName}-${communityDetails._id}`;

      // Update Redux state
      dispatch(
        setCommunityData({
          communityId: communityDetails._id,
          userId: communityDetails.user_id,
        })
      );

      dispatch(
        setActiveCommunity({
          id: communityDetails._id,
          name: communityDetails.name,
          image: "",
          background_image: "",
          user_isBankDetailsAdded: false,
          user_iscalendarConnected: false,
        })
      );

      // Navigate to community profile page
      router.push(`/community/${communityParams}/profile`);
    }, [communityDetails, dispatch, router]);

    const handleViewProfile = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (!communityDetails || !communityDetails._id) {
        console.error("Invalid community data:", communityDetails);
        return;
      }

      // Create URL-friendly community name
      const cleanedCommunityName = communityDetails.name
        .replace(/\s+/g, "-")
        .replace(/\|/g, "-")
        .replace(/-+/g, "-");
      const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
      const communityParams = `${encodedCommunityName}-${communityDetails._id}`;

      // Update Redux state
      dispatch(
        setCommunityData({
          communityId: communityDetails._id,
          userId: communityDetails.user_id,
        })
      );

      dispatch(
        setActiveCommunity({
          id: communityDetails._id,
          name: communityDetails.name,
          image: "",
          background_image: "",
          user_isBankDetailsAdded: false,
          user_iscalendarConnected: false,
        })
      );

      // Navigate to community profile page
      router.push(`/community/${communityParams}/profile`);
    }, [communityDetails, dispatch, router]);

    const handleShare = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (!communityDetails || !communityDetails._id) {
        console.error("Invalid community data:", communityDetails);
        return;
      }

      // Create URL-friendly community name
      const cleanedCommunityName = communityDetails.name
        .replace(/\s+/g, "-")
        .replace(/\|/g, "-")
        .replace(/-+/g, "-");
      const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
      const communityParams = `${encodedCommunityName}-${communityDetails._id}`;

      // Create the full URL
      const communityUrl = `${window.location.origin}/community/${communityParams}/profile`;

      // Copy to clipboard
      navigator.clipboard.writeText(communityUrl).then(() => {
        toast.success("Link copied to clipboard!", {
          description: "Share this link with others to invite them",
        });
      }).catch(() => {
        toast.error("Failed to copy link", {
          description: "Please try again or copy the link manually",
        });
      });
    }, [communityDetails]);

    const handleClaimFreeSession = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (!communityDetails?.min_offering_id) {
        console.error("No minimum offering ID available:", communityDetails);
        // toast.error("Session booking unavailable", {
        //   description: "Please try again later or contact support",
        // });
        return;
      }

      // Navigate to the offering page
      router.push(`/offering/${communityDetails.min_offering_id}`);
    }, [communityDetails, router]);

    const formatNumber = (num: number) => {
      return numbro(num).format({ average: true, mantissa: 1 });
    };

    const getTagColor = (index: number) => {
      const colors = [
        "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100",
        "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100",
        "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100",
        "bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100",
        "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100",
        "bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100"
      ];
      return colors[index % colors.length];
    };

    // Process tags from the community data
    const tags = useMemo(() => {
      if (!communityDetails?.tags || !communityDetails.tags.length) return [];
      
      let allTags: string[] = [];
      communityDetails.tags.forEach((tagItem: any) => {
        if (typeof tagItem === "string") {
          if (tagItem.includes(",")) {
            const splitTags = tagItem.split(",").map((tag: string) => tag.trim()).filter(Boolean);
            allTags = [...allTags, ...splitTags];
          } else {
            allTags.push(tagItem.trim());
          }
        } else if (Array.isArray(tagItem)) {
          tagItem.forEach((tag: any) => {
            if (typeof tag === "string") {
              if (tag.includes(",")) {
                const splitTags = tag.split(",").map((t: string) => t.trim()).filter(Boolean);
                allTags = [...allTags, ...splitTags];
              } else {
                allTags.push(tag.trim());
              }
            }
          });
        }
      });
      return [...new Set(allTags)].filter(Boolean);
    }, [communityDetails?.tags]);

    // Get avatar image URL
    const avatarImgUrl = useMemo(() => {
      if (!communityDetails) return "";
      const seedValue = communityDetails._id || 
        (communityDetails.name && `${communityDetails.name}-${communityDetails.user_id || Date.now()}`);
      
      return communityDetails.image || 
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedValue}`;
    }, [communityDetails]);

    return (
      <Card 
        className="p-0 h-[540px] sm:h-[560px] flex flex-col hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 overflow-hidden relative rounded-xl"
        onClick={handleCardClick}
        data-analytics-type="community-card"
        data-analytics-name={communityDetails?.name || "Expert"}
        data-community-id={communityDetails?._id || ""}
        data-community-name={communityDetails?.name || ""}
      >
        {/* Top Section - Profile Image */}
        <div className="w-full h-72 relative overflow-hidden bg-gray-100">
          <Image
            src={avatarImgUrl || "/placeholder.svg"}
            alt={communityDetails?.name || "Expert"}
            fill
            className="object-cover"
            style={{
              objectPosition: 'center 20%', // Focus on face area
              objectFit: 'contain'
              // Show full image within container bounds
            }}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                          onLoad={(e) => {
                // Simple face positioning without scaling
                const img = e.target as HTMLImageElement;
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                
                if (aspectRatio < 0.8) {
                  // Very tall portrait - face is likely in upper third
                  img.style.objectPosition = 'center 15%';
                } else if (aspectRatio < 1.2) {
                  // Portrait/square - face is likely in upper quarter
                  img.style.objectPosition = 'center 18%';
                } else if (aspectRatio < 1.8) {
                  // Landscape - face is likely in center-upper area
                  img.style.objectPosition = 'center 22%';
                } else {
                  // Very wide landscape - face is likely in center
                  img.style.objectPosition = 'center 25%';
                }
              }}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* Expert Info */}
          <div className="space-y-2">
            {/* Name and Rating */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {communityDetails?.name || "Expert Name"}
              </h3>
              <span className="text-sm text-gray-600">⭐ 4.9 / 5</span>
            </div>

            {/* Verified Badge and Languages */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 font-medium bg-gray-100 px-2 py-1 rounded-full">✓ Verified Expert</span>
              <span className="text-sm text-gray-600">
                {communityDetails?.languages ? communityDetails.languages.join(", ") : "English, Hindi"}
              </span>
            </div>

            {/* Experience & Sessions - Emphasized */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎓</span>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {communityDetails?.owner_experience ? `${communityDetails.owner_experience}+ years` : "5+ years"}
                    </div>
                    <div className="text-xs text-gray-500">Experience</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {communityDetails?.owner_sessions ? formatNumber(communityDetails.owner_sessions) : "200+"}
                    </div>
                    <div className="text-xs text-gray-500">Sessions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-2">
              {tags && tags.length > 0 ? (
                tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={`text-xs px-2 py-1 ${getTagColor(index)}`}
                  >
                    {tag}
                  </Badge>
                ))
              ) : (
                <>
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200">
                    Wellness
                  </Badge>
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200">
                    Nutrition
                  </Badge>
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200">
                    Fitness
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Pricing & Offer Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 line-through">₹1,000 / session</span>
                <span className="text-lg font-bold text-green-600">FREE Today</span>
              </div>
            </div>
            <p className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200">
              💎 Use coupon <span className="font-bold text-indigo-700">GUILD100</span> to claim your free session
            </p>
          </div>

          {/* CTA Button */}
          <Button
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            onClick={handleClaimFreeSession}
            data-analytics-type="community-cta"
            data-analytics-name="Claim Free Session"
            data-community-id={communityDetails?._id || ""}
            data-community-name={communityDetails?.name || ""}
          >
            🎁 Claim Free Session →
          </Button>
        </div>
      </Card>
    );
  }
);

MemoizedCommunityCard.displayName = "MemoizedCommunityCard";

export default MemoizedCommunityCard;
