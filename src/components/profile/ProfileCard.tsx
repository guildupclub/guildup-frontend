"use client";

import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "../Loader";
import { ChatSupportButton } from "../chat/ChatSupportButton";

// Icons
import { Edit, Phone, Calendar, Users, BarChart3, Target, Globe } from "lucide-react";
import { GrInstagram } from "react-icons/gr";
import { FaLinkedinIn, FaTwitter, FaFacebook } from "react-icons/fa6";
import { useParams } from "next/navigation";
import { AboutExpert } from "./AboutExpert";
import { OfferingsList } from "./OfferingsList";
import { CallToActionBanner } from "./CallToActionBanner";
import { ContentFeed } from "./ContentFeed";
import { TestimonialSection } from "./TestimonialSection";

interface CommunityProfile {
  user: {
    user_name: string;
    user_email: string;
    user_avatar: string;
    about?: string;
    user_isBankDetailsAdded: boolean;
    user_iscalendarConnected: boolean;
    user_year_of_experience: number;
    user_session_conducted: number;
    user_languages: string[];
  };
  community: {
    name: string;
    num_member: number;
    post_count: number;
    description: string;
    is_locked: boolean;
    tags: string[];
    image: string;
    background_image: string;
    youtube_followers: number;
    instagram_followers: number;
    linkedin_followers: number;
  };
}

interface ProfileCardProps {
  communityId: string;
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

export function ProfileCard({ communityId }: ProfileCardProps) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const params = useParams();
  const communityParam = params?.["community-Id"] as string;
  const lastHyphenIndex = communityParam ? communityParam.lastIndexOf("-") : -1;
  const communityName =
    lastHyphenIndex !== -1
      ? communityParam.substring(0, lastHyphenIndex)
      : null;
  const communityIdFromParam =
    lastHyphenIndex !== -1
      ? communityParam.substring(lastHyphenIndex + 1)
      : null;

  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch community profile data using the aboutCommunity API
  const { data: profile, isLoading } = useQuery({
    queryKey: ["communityProfile", communityIdFromParam],
    queryFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
        {
          communityId: communityIdFromParam,
        }
      );
      if (response.data.r === "s") {
        return response.data.data;
      }
      throw new Error("Failed to fetch community profile");
    },
    enabled: !!communityIdFromParam,
  });

  const isOwner = session?.user?.id === profile?.community?.user_id;

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        // Unfollow logic here
        return axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/leave`, {
          userId: session?.user?.id,
          communityId: communityIdFromParam,
        });
      } else {
        // Follow logic here
        return axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/join`, {
          userId: session?.user?.id,
          communityId: communityIdFromParam,
        });
      }
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Unfollowed successfully" : "Followed successfully");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num?.toString() || "0";
  };

  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return now.toLocaleDateString("en-US", options);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const scrollToOfferings = () => {
    const offeringsSection = document.getElementById("offerings-section");
    if (offeringsSection) {
      offeringsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  // No profile data
  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center text-2xl font-semibold">
        No profile data found
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      {/* Main Profile Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Profile Section */}
          <div className="flex flex-col items-center relative">
            {/* Share Button - Top Right */}
            <button className="absolute top-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </button>

            {/* Profile Image */}
            <div className="relative mb-3">
              <img
                src={profile.community.image || "/defaultCommunityIcon.png"}
                alt={profile.community.name}
                className="w-32 h-32 rounded-full object-cover shadow-lg bg-gray-200"
              />
            </div>

            {/* Rating Badge */}
            <div className="mb-4">
              <div className="bg-orange-400 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                <span>⭐</span>
                <span>4.8 (30 reviews)</span>
              </div>
            </div>

            {/* Name and Follow Button Section */}
            <div className="text-center mb-4 w-full">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {profile.community.name}
              </h1>
              
              {/* Community Owner Name - Under the community name */}
              <p className="text-gray-500 text-sm mb-3">
                {profile.user.user_name}
              </p>
              
              {/* Follow/Edit Button - Centered below */}
              <div className="flex justify-center">
                {!isOwner ? (
                  <button 
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs font-medium flex items-center gap-1.5"
                  >
                    <span>👤</span>
                    {followMutation.isPending ? "..." : isFollowing ? "Following" : "Follow"}
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-gray-600 text-white px-4 py-1.5 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                  >
                    <Edit size={12} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
              
            {/* Tags - Two rows layout */}
            <div className="w-full mb-6">
              {/* First row - 5 tags */}
              <div className="flex justify-center gap-2 mb-2">
                {profile.community.tags?.slice(0, 5).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Second row - 3 tags centered */}
              {profile.community.tags && profile.community.tags.length > 5 && (
                <div className="flex justify-center gap-2">
                  {profile.community.tags.slice(5, 8).map((tag: string, index: number) => (
                    <span
                      key={index + 5}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons - Side by side as shown in image */}
            <div className="w-full flex gap-2 mb-6">
              <ChatSupportButton
                expertEmail={profile.user.user_email}
                expertDetails={{
                  name: profile.user.user_name,
                  image: profile.user.user_avatar || profile.community.image,
                  email: profile.user.user_email,
                }}
                isBankConnected={profile.user.user_isBankDetailsAdded}
                className="flex-1 !px-4 !py-3 !text-xs !font-medium !min-h-[44px] !bg-green-50 !border-green-500 !text-green-600 hover:!bg-green-100 !rounded-lg"
              />
              
              <button 
                onClick={scrollToOfferings}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium min-h-[44px]"
              >
                <Phone size={14} />
                Quick Explore Call
              </button>
            </div>

            {/* Social Media - Centered */}
            <div className="flex gap-3 justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                <FaFacebook className="text-white text-sm" />
              </div>
              <div className="w-8 h-8 bg-pink-500 rounded flex items-center justify-center cursor-pointer hover:bg-pink-600 transition-colors">
                <GrInstagram className="text-white text-sm" />
              </div>
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                <FaTwitter className="text-white text-sm" />
              </div>
              <div className="w-8 h-8 bg-blue-400 rounded flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                <FaLinkedinIn className="text-white text-sm" />
              </div>
            </div>
          </div>

          {/* Right Content Section */}
          <div className="flex flex-col">
            {/* Quote Section */}
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <div className="text-pink-500 text-3xl leading-none">❝</div>
                <p className="text-base text-gray-700 leading-relaxed mt-1">
                  {profile.community.description}
                </p>
              </div>
            </div>

            {/* Stats Grid - 2x3 layout as shown in image */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Calendar className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Years of Experience</p>
                  <p className="font-bold text-sm">{profile.user.user_year_of_experience || "5+"} years</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <BarChart3 className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sessions Conducted</p>
                  <p className="font-bold text-sm">{formatNumber(profile.user.user_session_conducted || 100)}+ Sessions</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Users className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Members</p>
                  <p className="font-bold text-sm">{formatNumber(profile.community.num_member)} Members</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Target className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expertise</p>
                  <p className="font-bold text-sm">{profile.community.tags?.[0] || "Nutrition and Diet"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 col-span-2">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Globe className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Languages known</p>
                  <p className="font-bold text-sm">
                    {profile.user.user_languages?.length > 0 
                      ? profile.user.user_languages.join(", ") 
                      : "Hindi, English, Gujarati"}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <span>✓</span>
                Certified Professional
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                <span>🔒</span>
                Secure Payments
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                <span>📞</span>
                24/7 Support
              </div>
            </div>

            {/* Available Slots */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Available Slots</h3>
                <button className="text-blue-600 hover:text-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              <div className="flex justify-between items-end">
                {/* Calendar Grid */}
                <div className="flex-1">
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                      <div key={index} className="text-center text-xs text-gray-500 font-medium py-1">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {Array.from({ length: 21 }, (_, index) => {
                      const day = index + 17;
                      const isToday = day === 20;
                      const hasSlot = [19, 20, 21, 22].includes(day);
                      
                      return (
                        <div
                          key={index}
                          className={`text-center text-xs p-2 cursor-pointer rounded relative ${
                            isToday
                              ? "bg-blue-600 text-white font-bold"
                              : hasSlot && day !== 20
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        >
                          {day}
                          {hasSlot && day !== 20 && (
                            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next available slot */}
                <div className="flex items-center gap-2 text-xs text-gray-600 ml-6">
                  <Calendar size={14} className="text-blue-600" />
                  <div>
                    <span className="block text-gray-500">Next available slot</span>
                    <span className="font-bold text-gray-900">Today, 05:30 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Expert Section */}
      <AboutExpert 
        user={profile.user} 
        community={profile.community} 
      />

      {/* Offerings Section */}
      <div id="offerings-section">
        <OfferingsList />
      </div>

      {/* Call to Action Banner */}
      <CallToActionBanner onQuickExploreCall={scrollToOfferings} />

      {/* Content Feed */}
      <ContentFeed 
        communityId={communityIdFromParam || ""} 
        expertName={profile.user.user_name} 
      />

      {/* Testimonial Section */}
      <TestimonialSection />
    </div>
  );
}
