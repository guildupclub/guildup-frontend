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
import { ProfileSectionLeftHero } from "./ProfileSectionLeftHero";


interface ProfileCardProps {
  communityId: string;
}


export function ProfileCard() {
  const { data: session } = useSession();
  const params = useParams();
  const communityParam = params?.["community-Id"] as string;
  const lastHyphenIndex = communityParam ? communityParam.lastIndexOf("-") : -1;
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
          

          <ProfileSectionLeftHero
            profile={profile}
            isOwner={isOwner}
            isFollowing={isFollowing}
            followMutation={followMutation}
            setIsEditing={setIsEditing}
            scrollToOfferings={scrollToOfferings}
          />

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
