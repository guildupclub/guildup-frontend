"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, addDays, isToday, isTomorrow, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import Loader from "../Loader";
import { ChatSupportButton } from "../chat/ChatSupportButton";

// Icons
import { Edit, Phone, Calendar, Users, BarChart3, Target, Globe, Loader2 } from "lucide-react";
import { GrInstagram } from "react-icons/gr";
import { FaLinkedinIn, FaTwitter, FaFacebook } from "react-icons/fa6";
import { useParams } from "next/navigation";
import { AboutExpert } from "./AboutExpert";
import { OfferingsList } from "./OfferingsList";
import { CallToActionBanner } from "./CallToActionBanner";
import { ContentFeed } from "./ContentFeed";
import { TestimonialSection } from "./TestimonialSection";
import { ProfileSectionLeftHero } from "./ProfileSectionLeftHero";

interface TimeSlot {
  start: string;
  end: string;
}

interface Offering {
  _id: string;
  title: string;
  duration: number;
  type: string;
}

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
  const [availableSlots, setAvailableSlots] = useState<{ [date: string]: TimeSlot[] }>({});
  const [nextAvailableSlot, setNextAvailableSlot] = useState<{ date: string; slot: TimeSlot } | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

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

  // Fetch community offerings
  const { data: offerings } = useQuery({
    queryKey: ["communityOfferings", communityIdFromParam],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/community/${communityIdFromParam}`
      );
      if (response.data.r === "s") {
        return response.data.data;
      }
      throw new Error("Failed to fetch community offerings");
    },
    enabled: !!communityIdFromParam,
  });

  // Fetch available slots for the next 7 days
  const fetchAvailableSlots = async () => {
    if (!offerings || offerings.length === 0) {
      console.log("No offerings available for this community");
      return;
    }
    
    setIsLoadingSlots(true);
    const slotsData: { [date: string]: TimeSlot[] } = {};
    let nextSlot: { date: string; slot: TimeSlot } | null = null;

    try {
      // Get the next 7 days
      const today = new Date();
      const next7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

      // Fetch slots for each offering and each day
      for (const offering of offerings) {
        for (const date of next7Days) {
          const formattedDate = format(date, "yyyy-MM-dd");
          
          try {
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING}/calendar/booking/available-slots`,
              {
                params: {
                  offering_id: offering._id,
                  date: formattedDate,
                },
                timeout: 5000,
              }
            );

            if (response.data && response.data.slots && Array.isArray(response.data.slots)) {
              if (!slotsData[formattedDate]) {
                slotsData[formattedDate] = [];
              }
              slotsData[formattedDate].push(...response.data.slots);

              // Find the next available slot
              if (!nextSlot && response.data.slots.length > 0) {
                nextSlot = {
                  date: formattedDate,
                  slot: response.data.slots[0]
                };
              }
            } else if (response.data && Array.isArray(response.data)) {
              // Handle case where response.data is directly an array of slots
              if (!slotsData[formattedDate]) {
                slotsData[formattedDate] = [];
              }
              slotsData[formattedDate].push(...response.data);

              // Find the next available slot
              if (!nextSlot && response.data.length > 0) {
                nextSlot = {
                  date: formattedDate,
                  slot: response.data[0]
                };
              }
            }
          } catch (error) {
            // Silently handle errors for individual slot requests
            console.log(`No slots available for ${offering.title} on ${formattedDate}`);
          }
        }
      }

      setAvailableSlots(slotsData);
      setNextAvailableSlot(nextSlot);
    } catch (error) {
      console.error("Error fetching available slots:", error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Fetch slots when offerings are loaded
  useEffect(() => {
    if (offerings && offerings.length > 0) {
      fetchAvailableSlots();
    }
  }, [offerings]);

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

  // Generate calendar days from tomorrow until end of current month
  const generateCalendarDays = () => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
    const days = [];
    
    let currentDate = tomorrow;
    while (currentDate <= endOfMonth) {
      const formattedDate = format(currentDate, "yyyy-MM-dd");
      const dayNumber = currentDate.getDate();
      const isTodayDate = isToday(currentDate);
      const hasSlot = availableSlots[formattedDate] && availableSlots[formattedDate].length > 0;
      
      days.push({
        day: dayNumber,
        date: formattedDate,
        isToday: isTodayDate,
        hasSlot,
      });
      
      currentDate = addDays(currentDate, 1);
    }
    
    return days;
  };

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), "HH:mm");
  };

  const formatNextSlotDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return "Today";
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    } else {
      return format(date, "MMM dd");
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

  const calendarDays = generateCalendarDays();

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
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Available Slots</h3>
                  {!profile.user.user_iscalendarConnected && (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                      Calendar not connected
                    </span>
                  )}
                  {offerings && offerings.length === 0 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      No offerings
                    </span>
                  )}
                </div>
                <button 
                  className="text-blue-600 hover:text-blue-700"
                  onClick={fetchAvailableSlots}
                  disabled={isLoadingSlots || !offerings || offerings.length === 0 || !profile.user.user_iscalendarConnected}
                >
                  {isLoadingSlots ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="flex justify-between items-end">
                                 {/* Calendar Grid */}
                 <div className="flex-1">
                   {/* Month name */}
                   <div className="text-center text-sm font-semibold text-gray-700 mb-2">
                     {format(new Date(), "MMMM yyyy")}
                   </div>
                   <div className="grid grid-cols-7 gap-1 mb-3">
                     {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                       <div key={index} className="text-center text-xs text-gray-500 font-medium py-1">
                         {day}
                       </div>
                     ))}
                    
                    {/* Calendar days */}
                    {calendarDays.map((dayData, index) => (
                      <div
                        key={index}
                        className={`text-center text-xs p-2 cursor-pointer rounded relative ${
                          dayData.isToday
                            ? "bg-primary text-white font-bold"
                            : dayData.hasSlot
                            ? "text-gray-700"
                            : "text-gray-400"
                        }`}
                      >
                        {dayData.day}
                        {dayData.hasSlot && !dayData.isToday && (
                          <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next available slot */}
                <div className="flex items-center gap-2 text-xs text-gray-600 ml-6">
                  <Calendar size={14} className="text-blue-600" />
                  <div>
                    <span className="block text-gray-500">Next available slot</span>
                    {nextAvailableSlot ? (
                      <span className="font-bold text-gray-900">
                        {formatNextSlotDate(nextAvailableSlot.date)}, {formatTime(nextAvailableSlot.slot.start)}
                      </span>
                    ) : (
                      <span className="font-bold text-gray-900">
                        {isLoadingSlots ? "Loading..." : 
                         !offerings || offerings.length === 0 ? "No offerings available" :
                         !profile.user.user_iscalendarConnected ? "Calendar not connected" :
                         "No slots available"}
                      </span>
                    )}
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
