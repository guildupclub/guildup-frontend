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
        toast.error("Session booking unavailable", {
          description: "Please try again later or contact support",
        });
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
        className="p-0 h-[220px] sm:h-[240px] md:h-[260px] flex flex-row hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden"
        onClick={handleCardClick}
      >
        {/* Left Side - Profile Image and Buttons (same layout for mobile and desktop) */}
        <div className="w-1/3 sm:w-1/3 h-full flex flex-col items-center justify-between p-2 sm:p-4 pt-2 sm:pt-4">
          {/* Profile Image */}
          <div className="w-full h-3/4 sm:h-5/6 relative rounded-lg overflow-hidden mb-2 sm:mb-2">
            <Image
              src={avatarImgUrl || "/placeholder.svg"}
              alt={communityDetails?.name || "Expert"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            />
          </div>
          
          {/* Action Buttons - Mobile: Share button below image, Desktop: Both buttons */}
          <div className="w-full flex flex-col space-y-1">
            {/* Share Button - Visible on both mobile and desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs py-1.5 h-7 sm:h-8 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={handleShare}
            >
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              <span className="hidden sm:inline">Share</span>
            </Button>
            
            {/* View Profile Button - Hidden on mobile, visible on desktop */}
            <div className="hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs py-1.5 h-7 sm:h-8 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={handleViewProfile}
              >
                <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Content (mini version for mobile, full for desktop) */}
        <div className="flex-1 p-2 sm:p-4 flex flex-col justify-between h-full min-w-0">
          {/* Top Content - Flexible Height */}
          <div className="flex-1 flex flex-col space-y-2 sm:space-y-2 min-h-0">
            {/* Name - Fixed Height */}
            <div className="h-6 sm:h-8 flex items-center min-w-0">
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate w-full">
                {communityDetails?.name || "Expert Name"}
              </h3>
            </div>

            {/* Experience & Sessions - Fixed Height */}
            <div className="h-8 sm:h-12 flex flex-col space-y-1 sm:space-y-1">
              <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                <FaBriefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600 truncate">
                  {communityDetails?.owner_experience || "5+"} years experience
                </span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                <FaBullseye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600 truncate">
                  {formatNumber(communityDetails?.owner_sessions || 100)} sessions completed
                </span>
              </div>
            </div>

            {/* Tags - Flexible Height */}
            <div className="min-h-[24px] sm:min-h-[32px] max-h-[32px] sm:max-h-[48px] flex flex-wrap gap-1 sm:gap-2 overflow-hidden">
              {tags && tags.length > 0 ? (
                tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 max-w-[70px] sm:max-w-[80px] truncate flex-shrink-0 ${getTagColor(index)}`}
                  >
                    {tag}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary" className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-50 text-gray-600 flex-shrink-0">
                  Wellness
                </Badge>
              )}
            </div>

            {/* Social Proof - Fixed Height */}
            <div className="h-6 sm:h-8 flex items-center space-x-2 sm:space-x-3 min-w-0 overflow-hidden mb-5 sm:mb-6">
              {communityDetails?.linkedin_followers > 0 && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <FaLinkedinIn className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-blue-600" />
                  <span className="text-xs text-gray-600">{formatNumber(communityDetails.linkedin_followers)}</span>
                </div>
              )}
              {communityDetails?.instagram_followers > 0 && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <GrInstagram className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-pink-600" />
                  <span className="text-xs text-gray-600">{formatNumber(communityDetails.instagram_followers)}</span>
                </div>
              )}
              {communityDetails?.youtube_followers > 0 && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <BsYoutube className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-red-600" />
                  <span className="text-xs text-gray-600">{formatNumber(communityDetails.youtube_followers)}</span>
                </div>
              )}
              {communityDetails?.num_member > 0 && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <ImUsers className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">{formatNumber(communityDetails.num_member)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom - CTA Button */}
          <div className="h-8 sm:h-12 flex items-center min-w-0 mt-1 sm:mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs py-1.5 h-7 sm:h-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
              onClick={handleClaimFreeSession}
            >
              Claim Free Session Now →
            </Button>
          </div>
        </div>
      </Card>
    );
  }
);

MemoizedCommunityCard.displayName = "MemoizedCommunityCard";

export default MemoizedCommunityCard;
