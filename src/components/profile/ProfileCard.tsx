"use client";

import React, { use, useCallback, useEffect, useRef, useState } from "react";
import type { RootState } from "@/redux/store";
import axios from "axios";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import numbro from "numbro";
import { StringConstants } from "../common/CommonText";
import Loader from "../Loader";
import { setIsBankAdded, setIsCalendarConnected } from "@/redux/userSlice";
import { ChatSupportButton } from "../chat/ChatSupportButton";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AddOfferingDialog } from "./AddOfferingdialog";
import { BookingDialog } from "../booking/Bookingdialog";
import { EditCommunityModal } from "../form/editCommunity";
import EditOfferingModal from "./UpdateOffering";
import Testimonials from "../testimonial/Testimonial";
import { Stepper } from "./Steeper";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import { ArrowRight, Edit, Trash2, Pencil, Share } from "lucide-react";
import { HiMiniUserGroup } from "react-icons/hi2";
import { GrInstagram, GrUserManager, GrYoga } from "react-icons/gr";
import { BsCalendarCheck, BsYoutube } from "react-icons/bs";
import { MdOutlineClass, MdOutlineRssFeed, MdPeopleAlt } from "react-icons/md";
import { FaLinkedinIn, FaRegShareFromSquare } from "react-icons/fa6";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { ref, push, update } from "firebase/database";
import database from "../../../firebase";
import { removeSpecialCharacters } from "../utils/StringUtils";
import { FcClock } from "react-icons/fc";
import { useParams } from "next/navigation";
import { HiOutlineUserGroup, HiOutlineVideoCamera } from "react-icons/hi";
import TestimonialsSection from "../clientSays/ClientSays";
import { WebinarOfferBanner } from "../webinarHolding/WebinarHoldingSection";
import { primary, white, black } from "@/app/colours";
import { useRouter } from "next/navigation";
import { WHATSAPP_NUMBER_DIGITS } from "@/config/constants";
import { usePrograms } from "@/lib/fetching/usePrograms";
import Link from "next/link";

interface CommunityProfile {
  user: {
    user_name: string;
    user_email: string;
    user_avatar: string;
    about: string;
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
    youtube_followers: string;
    instagram_followers: string;
    linkedin_followers: string;
  };
}

interface ProfileCardProps {
  communityId: string;
  initialProfile?: CommunityProfile | null;
  initialOfferings?: Offering[];
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

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

interface CardProps {
  item: Testimonial;
}

function Card({ item }: CardProps) {
  return (
    <div className="flex w-[300px] flex-col gap-2 rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <Image
          src={item.avatar || "/placeholder.svg"}
          alt={item.name}
          width={48}
          height={48}
          className="rounded-full"
          unoptimized
        />
        <div>
          <h3 className="font-medium text-foreground">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.role}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{item.content}</p>
      <div className="flex items-center">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <svg
              key={i}
              className={`h-4 w-4 ${
                i < item.rating ? "text-yellow-400" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-.181h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
      </div>
    </div>
  );
}

// Programs Section Component
function ProgramsSection() {
  const { data, isLoading, isError } = usePrograms();

  if (isLoading || isError || !data || data.length === 0) return null;

  return (
    <section aria-labelledby="programs-title" className="py-12 sm:py-16 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 id="programs-title" className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Our Programs
          </h2>
          <p className="text-gray-600 mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Choose a path and begin your journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((p) => (
            <Link 
              key={p.id} 
              href={`/programs/${p.id}`} 
              className="relative group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 bg-white"
              style={{ 
                boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.1)',
                border: `2px solid ${primary}20`
              }}
            >
              {/* Outer glow effect */}
              <div 
                className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
                style={{
                  background: `radial-gradient(circle, ${primary}30 0%, transparent 70%)`,
                  zIndex: -1
                }}
              />
              
              {/* Animated border glow */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  border: `2px solid ${primary}40`,
                  boxShadow: `0 0 0 2px ${primary}20, 0 0 20px -5px ${primary}40`,
                  borderRadius: '1rem'
                }}
              />
              
              {/* Inner content */}
              <div className="relative bg-white rounded-2xl">
                <div className="aspect-[4/3] bg-white flex items-center justify-center relative overflow-hidden">
                  {/* Subtle gradient overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${primary}05 0%, transparent 100%)`
                    }}
                  />
                  
                  {p.illustration ? (
                    <img 
                      src={p.illustration} 
                      alt={p.title} 
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110" 
                    />
                  ) : (
                    <div 
                      className="w-56 h-56 sm:w-64 sm:h-64 rounded-xl relative z-10" 
                      style={{ backgroundColor: `${primary}10` }} 
                    />
                  )}
                </div>
                
                <div className="p-5 relative">
                  <h3 
                    className="text-xl font-semibold transition-colors duration-300 group-hover:text-primary" 
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {p.title}
                  </h3>
                  {p.subtitle && (
                    <p className="text-gray-600 mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{p.subtitle}</p>
                  )}
                  <div className="mt-4">
                    <span 
                      className="inline-block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group-hover:scale-105 group-hover:shadow-md" 
                      style={{ 
                        backgroundColor: primary, 
                        color: white, 
                        fontFamily: "'Poppins', sans-serif",
                        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      Explore
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Animated corner accent */}
              <div 
                className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${primary}20 0%, transparent 50%)`,
                  borderRadius: '0 2rem 0 2rem',
                  clipPath: 'polygon(100% 0, 100% 50%, 50% 100%, 0 100%, 0 0)'
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Join Program CTA Banner Component
function JoinProgramCTABanner() {
  const whatsappMessage = encodeURIComponent(`Hi!, I'd like to know more about Guildup's program`);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER_DIGITS}?text=${whatsappMessage}`;

  return (
    <section className="relative w-full overflow-hidden py-16 mt-8" style={{ backgroundColor: primary }} aria-labelledby="join-program-cta-title">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
        <h2 id="join-program-cta-title" className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: white, fontFamily: "'Poppins', sans-serif" }}>
          Ready to Join Our Program?
        </h2>
        <p className="text-white/90 max-w-3xl mx-auto mb-8" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Get started on your wellness journey today. Chat with us on WhatsApp to learn more about our programs and find the right fit for you.
        </p>
        <button
          onClick={() => window.open(whatsappUrl, '_blank')}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Join Our Program
        </button>
      </div>
    </section>
  );
}

export function ProfileCard({ communityId, initialProfile: serverProfile, initialOfferings: serverOfferings }: ProfileCardProps) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
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
  // console.log("communityIdFromParam", communityIdFromParam);

  const cleanedCommunityName =
    communityName ||
    "".replace(/\s+/g, "-").replace(/\|/g, "-").replace(/-+/g, "-");
  const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
  const communityParams = `${encodedCommunityName}-${communityIdFromParam}`;
  const userFollowedCommunities = useSelector(
    (state: RootState) => state.user.userFollowedCommunities
  );
  const user = useSelector((state: RootState) => state.user.user);
  const community = useSelector((state: RootState) => state.community);
  const memberDetails = useSelector(
    (state: RootState) => state.member.memberDetails
  );

  // Local state
  const [avatarImgUrl, setAvatarImgUrl] = useState("");
  const [bgImgUrl, setBgImgUrl] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOfferingModal, setSelectedOfferingModal] = useState<any>(null);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(
    null
  );
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const [BookingCount, setBookingCount] = useState(0);
  const [hasTestimonials, setHasTestimonials] = useState(false);

  const activeCommunityId = communityId || community?.communityId;
  
  console.log("ProfileCard Debug:");
  console.log("- communityId prop:", communityId);
  console.log("- community?.communityId:", community?.communityId);
  console.log("- activeCommunityId:", activeCommunityId);

  // Add this ref and effect for the infinite scroll animation
  const testimonialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = testimonialRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let startTime: number | null = null;
    const duration = 30000; // 30 seconds for one complete scroll

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % duration) / duration;

      if (scrollContainer) {
        const totalWidth =
          scrollContainer.scrollWidth - scrollContainer.clientWidth;
        scrollContainer.scrollLeft = totalWidth * progress;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const isOwner =
    memberDetails &&
    memberDetails.is_owner === true &&
    memberDetails.community_id === communityIdFromParam;
  console.log(">>>>>>>>>>>>>>>isOwner", isOwner);

  // Fetch community profile data - use server-rendered data as initial data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["communityProfile", activeCommunityId],
    queryFn: async () => {
      // Check if NEXT_PUBLIC_BACKEND_BASE_URL is undefined
      if (!process.env.NEXT_PUBLIC_BACKEND_BASE_URL) {
        // Fallback to communities.json
        try {
          const jsonResponse = await fetch("/data/communities.json", { cache: "no-store" });
          if (!jsonResponse.ok) {
            throw new Error("Failed to fetch communities.json");
          }
          const jsonData = await jsonResponse.json();
          
          // Find the community by ID
          const communityData = jsonData.communities?.find(
            (item: any) => item.community?._id === activeCommunityId
          );

          if (!communityData) {
            throw new Error(`Community not found in JSON: ${activeCommunityId}`);
          }

          // Transform JSON data to match API response format
          const transformedData = {
            community: communityData.community,
            user: {
              _id: communityData.community.user_id?._id || communityData.community.user_id,
              user_name: communityData.community.user_id?.name || communityData.community.owner_name,
              user_avatar: communityData.community.image,
              user_session_conducted: communityData.community.user_id?.session_conducted || communityData.community.owner_sessions || 0,
              user_year_of_experience: communityData.community.user_id?.year_of_experience || communityData.community.owner_experience || 0,
              user_languages: communityData.community.user_id?.languages || communityData.community.owner_languages || [],
              user_isBankDetailsAdded: false,
              user_iscalendarConnected: false,
            },
          };

          // Store in localStorage
          try {
            localStorage.setItem(
              "sessionConducted",
              JSON.stringify(transformedData.user.user_session_conducted)
            );
            localStorage.setItem(
              "yearOfExperience",
              JSON.stringify(transformedData.user.user_year_of_experience)
            );
            localStorage.setItem(
              "isBankAdded",
              JSON.stringify(transformedData.user.user_isBankDetailsAdded)
            );
            localStorage.setItem(
              "isCalendarConnected",
              JSON.stringify(transformedData.user.user_iscalendarConnected)
            );
          } catch (error) {
            console.warn(
              "Failed to store communityProfile in localStorage",
              error
            );
          }

          // Set avatar and background images
          if (transformedData.community.image) {
            setAvatarImgUrl(transformedData.community.image);
          } else {
            setAvatarImgUrl(
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${transformedData.user.user_name}`
            );
          }

          if (transformedData.community.background_image) {
            setBgImgUrl(transformedData.community.background_image);
          } else {
            setBgImgUrl(
              "https://random-image-pepebigotes.vercel.app/api/random-image"
            );
          }

          return transformedData;
        } catch (error) {
          console.error("Error fetching community from JSON:", error);
          throw error;
        }
      }

      // Use API if NEXT_PUBLIC_BACKEND_BASE_URL is defined
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
        {
          communityId: activeCommunityId,
        }
      );

      if (response.data.r) {
        try {
          localStorage.setItem(
            "sessionConducted",
            JSON.stringify(response?.data?.data?.user?.user_session_conducted)
          );
          localStorage.setItem(
            "yearOfExperience",
            JSON.stringify(response?.data?.data?.user?.user_year_of_experience)
          );
          localStorage.setItem(
            "isBankAdded",
            JSON.stringify(response?.data?.data?.user?.user_isBankDetailsAdded)
          );
          localStorage.setItem(
            "isCalendarConnected",
            JSON.stringify(response?.data?.data?.user?.user_iscalendarConnected)
          );
          // localStorage.setItem("Date-Time",JSON.stringify(response?.data))
        } catch (error) {
          console.warn(
            "Failed to store communityProfile in localStorage",
            error
          );
        }
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
    enabled: !!activeCommunityId,
    initialData: serverProfile || undefined, // Use server-rendered data as initial data
  });

  // Fetch user's followed communities
  const { data: followedCommunitiesData } = useQuery({
    queryKey: ["userFollowedCommunities"],
    queryFn: async () => {
      if (!user?._id) return [];
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user/follow`,
        {
          userId: user._id,
        }
      );
      return response.data.data;
    },
    enabled: !!user?._id,
  });

  // Check if the current community is followed by the user
  const isCommunityFollowed = React.useMemo(() => {
    if (followedCommunitiesData) {
      return (followedCommunitiesData as any).some(
        (c: any) => c?._id === activeCommunityId
      );
    }
    return userFollowedCommunities.some((c) => c?._id === activeCommunityId);
  }, [followedCommunitiesData, userFollowedCommunities, activeCommunityId]);

  // Update profile data when it changes (use displayProfile to include server-rendered data)
  useEffect(() => {
    const currentProfile = profile || serverProfile;
    if (currentProfile?.community) {
      setAvatarImgUrl(
        currentProfile.community.image ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentProfile.user?.user_name}`
      );
      setBgImgUrl(
        currentProfile.community.background_image ||
          "https://random-image-pepebigotes.vercel.app/api/random-image"
      );
    }
  }, [profile?.community, serverProfile?.community]);

  useEffect(() => {
    const fetchBookingCount = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/bookings-count?communityId=${communityIdFromParam}`
        );
        const data = await res.json();
        setBookingCount(data.data.bookingsCount);
        console.log("Fetched data:", data.data.bookingsCount);
      } catch (err) {
        console.error("Error fetching booking count:", err);
      }
    };

    if (communityIdFromParam) {
      fetchBookingCount();
    }
  }, [communityIdFromParam]);

  // Update Redux state with user bank and calendar status
  useEffect(() => {
    if (profile?.user) {
      dispatch(setIsBankAdded(profile.user.user_isBankDetailsAdded));
      dispatch(setIsCalendarConnected(profile.user.user_iscalendarConnected));
    }
  }, [profile?.user, dispatch]);

  // Initialize offerings with server-rendered data
  useEffect(() => {
    if (serverOfferings && serverOfferings.length > 0) {
      setOfferings(serverOfferings);
    }
  }, [serverOfferings]);

  // Fetch offerings for the community
  const fetchOfferings = useCallback(async () => {
    console.log("fetchOfferings called with activeCommunityId:", activeCommunityId);
    if (!activeCommunityId) {
      console.log("No activeCommunityId, returning early");
      return;
    }

    try {
      // Check if NEXT_PUBLIC_BACKEND_BASE_URL is undefined
      if (!process.env.NEXT_PUBLIC_BACKEND_BASE_URL) {
        // Fallback to communities.json
        try {
          const jsonResponse = await fetch("/data/communities.json", { cache: "no-store" });
          if (!jsonResponse.ok) {
            throw new Error("Failed to fetch communities.json");
          }
          const jsonData = await jsonResponse.json();
          
          // Find the community by ID
          const communityData = jsonData.communities?.find(
            (item: any) => item.community?._id === activeCommunityId
          );

          if (communityData) {
            const fetchedOfferings = communityData.offerings || [];
            console.log("Fetched offerings from JSON:", fetchedOfferings);
            console.log("Number of offerings:", fetchedOfferings.length);
            setOfferings(fetchedOfferings);
            return;
          }
        } catch (jsonError) {
          console.error("Error fetching offerings from JSON:", jsonError);
          // Continue to API call if JSON fetch fails
        }
      }

      // Use API if NEXT_PUBLIC_BACKEND_BASE_URL is defined
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/community/${activeCommunityId}`
      );

      if (response.data.r === "s") {
        const fetchedOfferings = Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data];
        
        console.log("API Response:", response.data);
        console.log("Fetched offerings:", fetchedOfferings);
        console.log("Number of offerings:", fetchedOfferings.length);
        
        setOfferings(fetchedOfferings);
      }
    } catch (error) {
      console.error("Error fetching offerings:", error);
    }
  }, [activeCommunityId]);

  useEffect(() => {
    // Only fetch if we don't have server-rendered data
    if (!serverOfferings || serverOfferings.length === 0) {
      fetchOfferings();
    }
  }, [activeCommunityId, fetchOfferings, serverOfferings]);

  // Check if testimonials exist
  useEffect(() => {
    const checkTestimonials = async () => {
      if (!activeCommunityId) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/testimonials/${activeCommunityId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setHasTestimonials((data.data || []).length > 0);
        }
      } catch (error) {
        console.error("Error checking testimonials:", error);
        setHasTestimonials(false);
      }
    };

    checkTestimonials();
  }, [activeCommunityId]);

  // Mutation for unfollowing a community
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/leave`,
        {
          userId: user._id,
          communityId: activeCommunityId,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.r === "s") {
        toast.success("Successfully left the community!");
        // Update the cache to remove the unfollowed community
        queryClient.setQueryData(
          ["userFollowedCommunities"],
          (oldData: any) => {
            if (!oldData) return [];
            return oldData.filter((c: any) => c?._id !== activeCommunityId);
          }
        );
        // Invalidate the query to refetch the data
        queryClient.invalidateQueries({
          queryKey: ["userFollowedCommunities"],
        });
      }
    },
    onError: (error) => {
      console.error("Error leaving community:", error);
      toast.error("Failed to leave the community. Please try again.");
    },
  });


  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/join`,
        {
          userId: user._id,
          communityId: activeCommunityId,
        }
      );
      return response.data;
    },
    onSuccess: async (data) => {
      if (data.r === "s") {
        toast.success("Successfully joined the community!");
        console.log("data upon follow", data);
        // Update the cache to reflect the new followed community
        queryClient.setQueryData(
          ["userFollowedCommunities"],
          (oldData: any) => {
            if (!oldData) return [{ _id: activeCommunityId }];
            return [...oldData, { _id: activeCommunityId }];
          }
        );
        // Invalidate the query to refetch the data
        queryClient.invalidateQueries({
          queryKey: ["userFollowedCommunities"],
        });

        // Send notification to community owner (wrapped in try-catch to prevent join failure)
        try {
          console.log("data upon follow", data);
          console.log("current user", user);
          console.log("profile data", profile);
          console.log("profile email", profile?.user?.user_email);

          const email = removeSpecialCharacters(profile?.user?.user_email);

          if (data.data?.user_id) {
            const notificationsRef = ref(database, `notification/${email}`);
            const newNotificationRef = push(notificationsRef);
            console.log("new notification ref", newNotificationRef);
            await update(newNotificationRef, {
              type: "community_follow",
              message: `${user.name} started following your community`,
              read: false,
              createdAt: new Date().toISOString(),
              data: {
                communityId: activeCommunityId,
                userId: user._id,
                userName: user.name,
                userImage: user.image,
              },
            });
            console.log("Notification sent successfully");
          }
        } catch (notificationError) {
          console.warn(
            "Failed to send notification, but community join was successful:",
            notificationError
          );
          // Don't throw the error - community join should still succeed
        }
      }
    },
    onError: (error) => {
      console.error("Error joining community:", error);
      toast.error("Failed to join the community. Please try again.");
    },
  });

  // Handle avatar image upload
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();

      // Add the new image file
      formData.append("image", file);

      // Add all existing profile data
      formData.append("communityId", activeCommunityId || "");
      formData.append("userId", user._id);
      formData.append("name", profile?.community?.name || "");
      formData.append("description", profile?.community?.description || "");
      formData.append("tags", JSON.stringify(profile?.community?.tags || []));
      formData.append(
        "is_locked",
        String(profile?.community?.is_locked || false)
      );
      formData.append(
        "instagram_followers",
        String(profile?.community?.instagram_followers || "")
      );
      formData.append(
        "youtube_followers",
        String(profile?.community?.youtube_followers || "")
      );
      formData.append(
        "linkedin_followers",
        String(profile?.community?.linkedin_followers || "")
      );

      // Keep existing background image
      if (profile?.community?.background_image) {
        formData.append(
          "background_image_url",
          profile.community.background_image
        );
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/edit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.r === "s") {
        setAvatarImgUrl(
          response.data.data.image || response.data.data.community?.image
        );
        toast.success("Profile image updated successfully!");
        queryClient.invalidateQueries({
          queryKey: ["communityProfile", activeCommunityId],
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to update profile image");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle background image upload
  const handleBackgroundUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingBackground(true);
    try {
      const formData = new FormData();

      // Add the new background image file
      formData.append("background_image", file);

      // Add all existing profile data
      formData.append("communityId", activeCommunityId || "");
      formData.append("userId", user._id);
      formData.append("name", profile?.community?.name || "");
      formData.append("description", profile?.community?.description || "");
      formData.append("tags", JSON.stringify(profile?.community?.tags || []));
      formData.append(
        "is_locked",
        String(profile?.community?.is_locked || false)
      );
      formData.append(
        "instagram_followers",
        String(profile?.community?.instagram_followers || "")
      );
      formData.append(
        "youtube_followers",
        String(profile?.community?.youtube_followers || "")
      );
      formData.append(
        "linkedin_followers",
        String(profile?.community?.linkedin_followers || "")
      );

      // Keep existing profile image
      if (profile?.community?.image) {
        formData.append("image_url", profile.community.image);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/edit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.r === "s") {
        setBgImgUrl(
          response.data.data.background_image ||
            response.data.data.community?.background_image
        );
        toast.success("Background image updated successfully!");
        queryClient.invalidateQueries({
          queryKey: ["communityProfile", activeCommunityId],
        });
      }
    } catch (error) {
      console.error("Error uploading background:", error);
      toast.error("Failed to update background image");
    } finally {
      setIsUploadingBackground(false);
    }
  };

  // Event handlers
  const handleLeaveCommunity = () => {
    if (!user?._id || !activeCommunityId) return;
    unfollowMutation.mutate();
  };

  const handleJoinCommunity = () => {
    if (!user?._id || !activeCommunityId) return;
    followMutation.mutate();
  };

  const handleDeleteOffering = async (offeringId: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/delete/${offeringId}`,
        {
          data: {
            userId: user._id,
            communityId: activeCommunityId,
          },
        }
      );
      toast.success("Offering deleted successfully");
      setOfferings(offerings.filter((offering) => offering._id !== offeringId));
    } catch (error) {
      console.error("Error deleting offering:", error);
      toast.error("Failed to delete offering");
    }
  };

  const handleEditClick = (offering: any) => {
    setSelectedOfferingModal(offering);
    setIsEditModalOpen(true);
  };

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

  const handleOfferingShareClick = async (offeringID: string) => {
    try {
      const shareUrl = `${window.location.origin}/offering/` + offeringID;

      const baseLink = process.env.NEXT_PUBLIC_BACKEND_BASE_URL_BOOKING;
      const response = await axios.post(`${baseLink}/shorten`, {
        longUrl: shareUrl,
      });

      if (response.data.r === "s") {
        console.log("response.data.shortUrl", response.data.shortUrl);
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

  // Helper functions
  const formatNumber = (num: any) => {
    if (!num) return 0;
    if (num < 1000) return num;
    return numbro(num).format({ average: true, mantissa: 1 }).toUpperCase();
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-.181h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ));
  };

  // Use server-rendered profile if available, otherwise use client-fetched profile
  const displayProfile = profile || serverProfile;

  // Loading state - only show loader if we have no data at all (neither server nor client)
  if (isLoading && !serverProfile && !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  // No profile data
  if (!displayProfile)
    return (
      <div className="flex h-screen items-center justify-center text-2xl font-semibold">
        {StringConstants.NO_PROFILE_DATA}
      </div>
    );

  const isBankConnected = displayProfile?.user?.user_isBankDetailsAdded;
  const isCalendarConnected = displayProfile?.user?.user_iscalendarConnected;

  const typeToIcon: Record<
    string,
    { icon: React.ReactElement; label: string }
  > = {
    consultation: {
      icon: <HiOutlineUserGroup className="text-blue-600 w-6 h-6" />,
      label: "Consultation",
    },
    webinar: {
      icon: <HiOutlineVideoCamera className="text-purple-600 w-6 h-6" />,
      label: "Webinar",
    },
    package: {
      icon: <MdOutlineClass className="text-orange-600 w-6 h-6" />,
      label: "Package",
    },
    class: {
      icon: <GrYoga className="text-green-600 w-6 h-6" />,
      label: "Class",
    },
    "discovery-call": {
      icon: <GrUserManager className="text-green-600 w-6 h-6" />,
      label: "Discovery Call",
    },
  };
  // Get tagline from description (first line or first sentence)
  const getTagline = () => {
    if (!displayProfile?.community?.description) return "";
    const firstLine = displayProfile.community.description.split("\n")[0];
    const firstSentence = firstLine.split(".")[0];
    return firstSentence || firstLine || "";
  };

  // Get role title from tags or use a default
  const getRoleTitle = () => {
    if (displayProfile?.community?.tags && displayProfile.community.tags.length > 0) {
      return displayProfile.community.tags.slice(0, 2).join(" / ");
    }
    return "Wellness Guide";
  };

  // Calculate average rating from testimonials (if available)
  const getClientHappinessIndex = () => {
    // This could be calculated from testimonials if available
    // For now, returning a placeholder value
    return "4.8"; // This should come from actual testimonials data
  };

  return (
    <div className="w-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Stepper for onboarding (only shown to owners) */}
      {isOwner && (!isCalendarConnected || !isBankConnected) && (
        <Stepper
          steps={[
            {
              label: "Build Guild",
              completed: true,
            },
            {
              label: "Complete Profile",
              completed: true,
            },
            {
              label: "Create Offering",
              completed: offerings && offerings.length > 0,
              active: offerings && offerings.length === 0,
            },
            {
              label: "Link Calendar",
              completed: isCalendarConnected,
              active: offerings && offerings.length > 0 && !isCalendarConnected,
            },
            {
              label: "Add Bank",
              completed: isBankConnected,
              active:
                offerings &&
                offerings.length > 0 &&
                isCalendarConnected &&
                !isBankConnected,
              href: "/payments",
            },
          ]}
        />
      )}

      <div className="w-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {/* Section 1: Profile Header */}
        <div 
          className="rounded-xl p-8 mb-8 bg-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Side: Photo */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                  <Image
                    src={
                      displayProfile?.community?.image ||
                      avatarImgUrl ||
                      "/guildup-logo.png"
                    }
                    alt={displayProfile?.community?.name || "Community Avatar"}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                {isOwner && (
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-2 right-2 rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/70 disabled:opacity-50"
                    title="Change profile image"
                  >
                    {isUploadingAvatar ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Pencil className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>

              {/* Name under the image */}
              <div className="mt-4 text-center w-full">
                <div className="flex items-center justify-center gap-2">
                    <h2 
                    className="text-2xl md:text-3xl font-bold text-foreground"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {displayProfile?.community?.name || displayProfile?.user?.user_name}
                  </h2>
                  {isBankConnected && (
                    <RiVerifiedBadgeFill className="text-primary h-7 w-7" />
                  )}
                </div>
                <p 
                  className="text-lg text-muted-foreground mt-2"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {getRoleTitle()}
                </p>
              </div>
            </div>

            {/* Right Side: Quote and Button */}
            <div className="flex flex-col justify-between h-full">
              <div className="flex items-start gap-4 mb-6">
                <span className="text-6xl md:text-8xl font-bold text-gray-300 leading-none mt-2 flex-shrink-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  &apos;
                </span>
                <p 
                  className="text-2xl md:text-3xl font-semibold text-foreground flex-1 pt-2"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {getTagline() || "Helping you find calm in chaos."}
                </p>
              </div>

              {/* Book a Session Button under quote - Right side */}
              {!isOwner && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full max-w-md transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{ backgroundColor: primary, color: white, fontFamily: "'Poppins', sans-serif" }}
                    onClick={() => {
                      const communityOwnerName = displayProfile?.community?.name || "the expert";
                      const whatsappMessage = encodeURIComponent(`I would like to book a session with ${communityOwnerName}`);
                      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER_DIGITS}?text=${whatsappMessage}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    Book a Session
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashed Separator */}
        <div className="border-t border-dashed border-gray-300 mb-8"></div>

        {isOwner && (
          <div className="my-6">
            <WebinarOfferBanner
              isBankAdded={isBankConnected}
              isCalendarConnected={isCalendarConnected}
              offerings={offerings}
              totalBookings={BookingCount}
            />
          </div>
        )}

        {/* Section 2: Expertise and Know the Expert Combined */}
        <div className="mt-8 mb-8 rounded-xl p-6 bg-white">
              {/* Know the Expert Section */}
              <div>
                <h2 
                  className="text-2xl font-semibold mb-4"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Know the Expert
                </h2>
                  <p 
                  className="whitespace-pre-line text-muted-foreground leading-relaxed mb-6"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {displayProfile?.community?.description || "Short Bio (2-3 lines) → I'm Aanya, a certified wellness guide helping individuals build mindful habits, reduce anxiety, and reconnect with their bodies."}
                </p>
              </div>

              {/* Horizontal Divider */}
              <div className="border-t border-dashed border-gray-300 my-6"></div>

              {/* Expertise Section */}
              {(displayProfile?.community?.tags && displayProfile.community.tags.length > 0) && (
                <>
                  <h4 
                    className="text-lg font-semibold text-left mb-6 tracking-wide"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Expertise
                  </h4>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {displayProfile.community.tags.map((tag: any, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-4 py-2 text-base"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {/* Languages Spoken */}
              {displayProfile?.user?.user_languages && displayProfile.user.user_languages.length > 0 && (
                <>
                  <div className="border-t border-gray-300 border-dashed my-6"></div>
                  
                  <div>
                    <h4 
                      className="text-lg font-semibold mb-4"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      Languages Spoken
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {displayProfile.user.user_languages.map((lang: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-4 py-2 text-base"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Chat Support Button */}
              {!isOwner && activeCommunityId && isBankConnected && displayProfile?.user?.user_email !== user?.email && (
                <div className="mt-6 pt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full transition-all duration-300 border-black"
                    style={{ 
                      backgroundColor: white, 
                      color: black, 
                      fontFamily: "'Poppins', sans-serif",
                      borderColor: black
                    }}
                    onClick={() => {
                      const searchParams = new URLSearchParams({
                        expertEmail: displayProfile?.user?.user_email || "",
                        expertName: displayProfile?.user?.user_name || "Expert",
                        expertImage: displayProfile?.user?.user_avatar || "",
                      });
                      router.push(`/chat?${searchParams.toString()}`);
                    }}
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Chat with Expert
                  </Button>
                </div>
              )}
        </div>

        {/* Section 4: Offerings - Commented out */}
        {/* <div className="mt-8 rounded-xl p-6 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-2xl font-semibold text-foreground"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Offerings
                </h2>
              </div>

          {offerings.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">
                {StringConstants.NO_OFFERINGS}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(() => {
                console.log("Rendering offerings:", offerings);
                console.log("Offerings length in render:", offerings.length);
                return offerings.map((offering, index) => {
                // Hide webinars with past dates, show everything else
                const shouldShow = offering.type !== "webinar" || 
                                 !offering.when || 
                                 new Date(offering.when) > new Date();
                
                if (!shouldShow) return null;
                
                return (
                    <div
                      key={offering._id || `${offering.title}-${index}`}
                      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-blue-100 hover:shadow-md"
                    >
                          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-80" />

                          <div className="flex gap-4 items-start">
                            <div className="flex flex-col items-center gap-2">
                              <div className="rounded-lg border border-blue-100 bg-blue-50 p-2.5 transition-colors group-hover:bg-blue-100">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  x="0px"
                                  y="0px"
                                  width="36"
                                  height="36"
                                  viewBox="0 0 48 48"
                                >
                                  <rect
                                    width="10"
                                    height="10"
                                    x="12"
                                    y="16"
                                    fill="#fff"
                                    transform="rotate(-90 20 24)"
                                  ></rect>
                                  <polygon
                                    fill="#1e88e5"
                                    points="3,17 3,31 8,32 13,31 13,17 8,16"
                                  ></polygon>
                                  <path
                                    fill="#4caf50"
                                    d="M37,24v14c0,1.657-1.343,3-3,3H13l-1-5l1-5h14v-7l5-1L37,24z"
                                  ></path>
                                  <path
                                    fill="#fbc02d"
                                    d="M37,10v14H27v-7H13l-1-5l1-5h21C35.657,7,37,8.343,37,10z"
                                  ></path>
                                  <path
                                    fill="#1565c0"
                                    d="M13,31v10H6c-1.657,0-3-1.343-3-3v-7H13z"
                                  ></path>
                                  <polygon
                                    fill="#e53935"
                                    points="13,7 13,17 3,17"
                                  ></polygon>
                                  <polygon
                                    fill="#2e7d32"
                                    points="38,24 37,32.45 27,24 37,15.55"
                                  ></polygon>
                                  <path
                                    fill="#4caf50"
                                    d="M46,10.11v27.78c0,0.84-0.98,1.31-1.63,0.78L37,32.45v-16.9l7.37-6.22C45.02,8.8,46,9.27,46,10.11z"
                                  ></path>
                                </svg>
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                                  {offering.title}
                                </h3>

                                {offering.is_free ||
                                Number(offering.price?.amount) === 0 ? (
                                  <Badge
                                    variant="outline"
                                    className="border-green-200 bg-green-50 text-green-700"
                                  >
                                    Free
                                  </Badge>
                                ) : (
                                  <span className="font-semibold text-gray-900">
                                    ₹{offering.price?.amount}
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                                {offering.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-4 space-x-3 w-full bg-gray-100 px-4 py-2 rounded-md shadow-sm">
                            <div className="flex items-center gap-2">
                              <FcClock
                                size={28}
                                className="text-primary-foreground"
                              />
                              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                <span className="text-base font-semibold text-gray-700">
                                  Duration:
                                </span>
                                <span className="text-base text-gray-600">
                                  {offering.duration} min
                                </span>
                              </div>
                            </div>
                            <div>
                              {offering?.type && typeToIcon[offering.type] && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  {typeToIcon[offering.type].icon}
                                  <span>{typeToIcon[offering.type].label}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {offering.type === "webinar" &&
                            offering.when &&
                            new Date(offering.when) > new Date() && (
                              <div className="flex justify-between items-center mt-4 w-full bg-blue-100 px-4 py-2 rounded-md shadow-sm">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <BsCalendarCheck className="h-5 w-5 text-blue-500" />
                                  <span>
                                    {new Date(offering.when).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}
                                  </span>
                                </div>

                                <div className="text-sm text-gray-700">
                                  {new Date(offering.when).toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </div>
                              </div>
                            )}

                          <div className="mt-5 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                            {isOwner ? (
                              <div className="mr-auto flex justify-between w-full gap-2">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-1.5 rounded-lg border-gray-200 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                                    onClick={() => handleEditClick(offering)}
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                    <span>{StringConstants.EDIT}</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-1.5 rounded-lg border-red-200 px-3 py-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                                    onClick={() =>
                                      handleDeleteOffering(offering._id)
                                    }
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>{StringConstants.DELETE}</span>
                                  </Button>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1.5 rounded-lg border-blue-200 px-3 py-1.5 text-blue-500 hover:bg-blue-50 hover:text-blue-700"
                                  onClick={() =>
                                    handleOfferingShareClick(offering._id)
                                  }
                                  title="Share Offering"
                                >
                                  <Share className="h-3.5 w-3.5" />
                                  <span>{StringConstants.SHARE}</span>
                                </Button>
                              </div>
                            ) : (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="w-full">
                                      <Button
                                        disabled={
                                          !offering.is_free &&
                                          !isBankConnected &&
                                          !isCalendarConnected
                                        }
                                        className={`flex items-center w-full gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-400 ${
                                          !isOwner
                                            ? "cursor-pointer"
                                            : "cursor-not-allowed opacity-50"
                                        }`}
                                        onClick={() => {
                                          if (!isOwner)
                                            setSelectedOffering(offering);
                                        }}
                                      >
                                        <span>Book Now</span>
                                        <ArrowRight className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex w-full my-2 items-center gap-1.5 rounded-lg border-blue-200 px-3 py-1.5 text-blue-500 hover:bg-blue-50 hover:text-blue-700"
                                        onClick={() =>
                                          handleOfferingShareClick(offering._id)
                                        }
                                        title="Share Offering"
                                      >
                                        <Share className="h-3.5 w-3.5" />
                                        <span>{StringConstants.SHARE}</span>
                                      </Button>
                                    </div>
                                  </TooltipTrigger>
                                  {!offering.is_free && !isBankConnected && (
                                    <TooltipContent className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-2 text-black shadow-lg">
                                      <svg
                                        className="h-4 w-4 text-blue-500"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          fill="white"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M12 16v-4m0-4h.01"
                                        />
                                      </svg>
                                      <span>
                                        The expert is not accepting bookings at
                                        the moment
                                      </span>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                    );
                    });
                  })()}
                </div>
              )}
        </div> */}

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


        {/* Section 5: Stories of Change - Only show if testimonials exist */}
        {hasTestimonials && (
          <div className="mt-8 mb-8 rounded-xl p-6 bg-white">
            <h2 
              className="text-2xl font-semibold mb-6"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Stories of Change
            </h2>
            {/* @ts-ignore */}
            <Testimonials communityId={activeCommunityId || undefined} />
          </div>
        )}

        {/* Dashed Separator at Bottom */}
        {hasTestimonials && (
          <div className="border-t border-dashed border-gray-300 mb-8"></div>
        )}

        {/* Modals */}
        {isEditOpen && displayProfile && (
          <EditCommunityModal
            profile={displayProfile}
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
          />
        )}
        {isEditModalOpen && selectedOfferingModal && (
          <EditOfferingModal
            offering={selectedOfferingModal}
            userId={user?._id}
            communityId={activeCommunityId}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={fetchOfferings}
          />
        )}
      </div>

      {/* Programs Section - Before Footer */}
      <ProgramsSection />

      {/* CTA Banner - Join Program */}
      <JoinProgramCTABanner />

      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
      <input
        ref={backgroundInputRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundUpload}
        className="hidden"
      />
    </div>
  );
}
