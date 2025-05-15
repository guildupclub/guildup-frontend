"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { RootState } from "@/redux/store";
import axios from "axios";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import numbro from "numbro";
import { motion } from "framer-motion";
import { StringConstants } from "../common/CommonText";
import Loader from "../Loader";
import { setIsBankAdded, setIsCalendarConnected } from "@/redux/userSlice";

// Components
import { Avatar } from "@radix-ui/react-avatar";
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
import { ArrowRight, Edit, Trash2, Pencil, Share2 } from "lucide-react";
import { HiMiniUserGroup } from "react-icons/hi2";
import { GrInstagram } from "react-icons/gr";
import { BsYoutube } from "react-icons/bs";
import { MdOutlineRssFeed, MdPeopleAlt } from "react-icons/md";
import { FaLinkedinIn } from "react-icons/fa6";
import { RiUserSharedFill } from "react-icons/ri";
import { FaClock, FaShareAlt } from "react-icons/fa";
import { useNotifications } from "../notifications/NotificationContext";
import { ref, push, update } from "firebase/database";
import database from "../../../firebase";
import { removeSpecialCharacters } from "../utils/StringUtils";
import { FcClock } from "react-icons/fc";
import { useParams } from "next/navigation";
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

export function ProfileCard({ communityId }: ProfileCardProps) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const params = useParams();
  const communityIdFromParam = params.id;

  // Redux state
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

  const activeCommunityId = communityId || community?.communityId;

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

  // Fetch community profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["communityProfile", activeCommunityId],
    queryFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
        {
          communityId: activeCommunityId,
        }
      );

      if (response.data.r === "s") {
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
  });

  // Fetch user's followed communities
  const { data: followedCommunitiesData } = useQuery({
    queryKey: ["userFollowedCommunities"],
    enabled: !!user?._id,
  });

  // Check if the current community is followed by the user
  const isCommunityFollowed = React.useMemo(() => {
    if (followedCommunitiesData) {
      return followedCommunitiesData.some(
        (c: any) => c?._id === activeCommunityId
      );
    }
    return userFollowedCommunities.some((c) => c?._id === activeCommunityId);
  }, [followedCommunitiesData, userFollowedCommunities, activeCommunityId]);

  // Update profile data when it changes
  useEffect(() => {
    if (profile?.community) {
      setAvatarImgUrl(
        profile.community.image ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user?.user_name}`
      );
      setBgImgUrl(
        profile.community.background_image ||
          "https://random-image-pepebigotes.vercel.app/api/random-image"
      );
    }
  }, [profile?.community]);

  // Update Redux state with user bank and calendar status
  useEffect(() => {
    if (profile?.user) {
      dispatch(setIsBankAdded(profile.user.user_isBankDetailsAdded));
      dispatch(setIsCalendarConnected(profile.user.user_iscalendarConnected));
    }
  }, [profile?.user, dispatch]);

  // Fetch offerings for the community
  const fetchOfferings = useCallback(async () => {
    if (!activeCommunityId) return;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/community/${activeCommunityId}`
      );

      if (response.data.r === "s") {
        setOfferings(
          Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data]
        );
      }
    } catch (error) {
      console.error("Error fetching offerings:", error);
    }
  }, [activeCommunityId]);

  useEffect(() => {
    fetchOfferings();
  }, [activeCommunityId, fetchOfferings]);

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

  useEffect(() => {
    fetchOfferings();
  }, [community.communityId, fetchOfferings]);

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

        // Send notification to   community owner
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
        }
      }
    },
    onError: (error) => {
      console.error("Error joining community:", error);
      toast.error("Failed to join the community. Please try again.");
    },
  });

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
    const shareUrl = `${window.location.origin}/community/${communityId}/profile`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.info("Profile link copied to clipboard!");
    } catch (error) {
      console.log("Error copying to clipboard:", error);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  // No profile data
  if (!profile)
    return (
      <div className="flex h-screen items-center justify-center text-2xl font-semibold">
        {StringConstants.NO_PROFILE_DATA}
      </div>
    );

  const isBankConnected = profile?.user?.user_isBankDetailsAdded;
  const isCalendarConnected = profile?.user?.user_iscalendarConnected;

  return (
    <div className="w-full">
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

      <div className="mx-auto max-w-6xl px-3 py-2 md:px-0">
        {/* Profile Header Card */}
        <div className="overflow-hidden rounded-xl border border-border/5 bg-card shadow-lg">
          {/* Banner Image */}
          <div className="relative">
            <div className="h-44 lg:h-48 w-full overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background">
              <Image
                src={
                  profile?.community.background_image != undefined
                    ? profile?.community.background_image
                    : bgImgUrl
                }
                alt="Profile banner"
                width={1200}
                height={250}
                className="h-full w-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Left Column - Profile Image and Key Actions */}
            <div className="w-full md:w-1/3 px-2 lg:px-6 pt-0 pb-6 relative">
              {/* Profile Avatar - Half on background, half below */}
              <div className="absolute -top-20 left-4 lg:left-10">
                <Image
                  src={profile?.community?.image || avatarImgUrl}
                  alt={profile?.community?.name || "Community Avatar"}
                  width={200}
                  height={200}
                  className="h-44 lg:h-60 w-44 lg:w-56 rounded-xl border-4 border-background bg-primary/5 object-cover transition-transform duration-300 hover:scale-105 shadow-lg"
                  unoptimized
                />
              </div>
              <div className="mt-20 hidden md:block">
                <div className="flex flex-col gap-2 pt-8 lg:pt-24 w-56 lg:ml-4">
                  {/* <h1 className="flex items-center  text-lg font-semibold text-muted">
                    {profile?.community?.name} - {profile.user.user_name}
                  </h1> */}
                  {isOwner ? (
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-indigo-600 to-indigo-400"
                      onClick={handleShareClick}
                      title="Share Profile"
                    >
                      Share Profile
                      <Share2 className="ml-2 h-5 w-5" />
                    </Button>
                  ) : isCommunityFollowed ? (
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full transition-all duration-300 shadow-sm hover:shadow-md bg-gradient-to-r from-indigo-600 to-indigo-400"
                      onClick={handleLeaveCommunity}
                    >
                      {StringConstants.FOLLOWING}
                      <HiMiniUserGroup className="ml-2 h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-indigo-600 to-indigo-400"
                      onClick={handleJoinCommunity}
                    >
                      <HiMiniUserGroup className="mr-2 h-5 w-5" />
                      {StringConstants.FOLLOW}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Community Details */}
            <div className="w-full md:w-2/3 p-6 border-t md:border-t-0 md:border-l border-border/10 pt-20 lg:pt-4 ">
              <div className="space-y-2">
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                  {profile?.community?.name}
                  {isOwner && (
                    <button
                      className="rounded-md p-1 transition hover:bg-background"
                      onClick={() => setIsEditOpen(true)}
                      aria-label="Edit community"
                    >
                      <Pencil
                        size={18}
                        className="text-muted hover:text-primary"
                      />
                    </button>
                  )}
                </h1>

                {/* Creator Info */}
                <p className="text-md text-muted-foreground mt-1 mb-4">
                  {StringConstants.CREATED_BY}{" "}
                  <span className="text-foreground">
                    {profile.user.user_name}
                  </span>
                </p>

                {/* Years of Experience */}
                {profile.user?.user_year_of_experience > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-amber-500"
                    >
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                    <span className="font-medium text-foreground">
                      {profile.user.user_year_of_experience}+
                    </span>
                    <span>Years of experience</span>
                  </div>
                )}

                {/* Sessions Conducted */}
                {profile.user?.user_session_conducted > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-violet-500"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <span className="font-medium text-foreground">
                      {profile.user.user_session_conducted}+
                    </span>
                    <span>Sessions Conducted</span>
                  </div>
                )}

                {/* Languages */}
                {profile.user?.user_languages?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-teal-500"
                    >
                      <path d="m5 8 6 6" />
                      <path d="m4 14 6-6 2-3" />
                      <path d="M2 5h12" />
                      <path d="M7 2h1" />
                      <path d="m22 22-5-10-5 10" />
                      <path d="M14 18h6" />
                    </svg>
                    <div className="flex flex-wrap gap-1">
                      {profile.user.user_languages.map((lang, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-teal-50 text-teal-700 border-teal-200"
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Community Stats */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pt-2">
                  {/* Members */}
                  <div className="flex items-center gap-1.5">
                    <MdPeopleAlt className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-foreground">
                      {profile.community.num_member.toLocaleString()}
                    </span>
                    {StringConstants.MEMBER}
                  </div>

                  <div className="h-1 w-1 rounded-full bg-border" />

                  {/* Posts */}
                  <div className="flex items-center gap-1.5">
                    <MdOutlineRssFeed className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-foreground">
                      {profile?.community?.post_count}
                    </span>
                    {StringConstants.POSTS}
                  </div>

                  {/* Instagram Followers */}
                  {profile.community?.instagram_followers > 0 && (
                    <>
                      <div className="h-1 w-1 rounded-full bg-border" />
                      <div className="flex items-center gap-1.5">
                        <GrInstagram className="h-5 w-5 text-pink-500" />
                        <span className="font-medium text-foreground">
                          {formatNumber(profile.community?.instagram_followers)}
                        </span>
                        {StringConstants.FOLLOWERS}
                      </div>
                    </>
                  )}

                  {/* YouTube Subscribers */}
                  {profile.community?.youtube_followers > 0 && (
                    <>
                      <div className="h-1 w-1 rounded-full bg-border" />
                      <div className="flex items-center gap-1.5">
                        <BsYoutube className="h-5 w-5 text-red-500" />
                        <span className="font-medium text-foreground">
                          {formatNumber(profile.community?.youtube_followers)}
                        </span>
                        {StringConstants.SUBSCRIBERS}
                      </div>
                    </>
                  )}

                  {/* LinkedIn Followers */}
                  {profile.community?.linkedin_followers > 0 && (
                    <>
                      <div className="h-1 w-1 rounded-full bg-border" />
                      <div className="flex items-center gap-1.5">
                        <FaLinkedinIn className="h-5 w-5 text-blue-800" />
                        <span className="font-medium text-foreground">
                          {formatNumber(profile.community?.linkedin_followers)}
                        </span>
                        {StringConstants.FOLLOWERS}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className=" block md:hidden mt-4 px-4">
              <div className="flex flex-col gap-2 w-full lg:ml-4">
                {/* <h1 className="flex items-center  text-lg font-semibold text-muted">
                    {profile?.community?.name} - {profile.user.user_name}
                  </h1> */}
                {isOwner ? (
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-indigo-600 to-indigo-400"
                    onClick={handleShareClick}
                    title="Share Profile"
                  >
                    Share Profile
                    <Share2 className="ml-2 h-5 w-5" />
                  </Button>
                ) : isCommunityFollowed ? (
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full transition-all duration-300 shadow-sm hover:shadow-md bg-gradient-to-r from-indigo-600 to-indigo-400"
                    onClick={handleLeaveCommunity}
                  >
                    {StringConstants.FOLLOWING}
                    <HiMiniUserGroup className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-indigo-600 to-indigo-400"
                    onClick={handleJoinCommunity}
                  >
                    <HiMiniUserGroup className="mr-2 h-5 w-5" />
                    {StringConstants.FOLLOW}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* About Section */}
          <div>
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-foreground">
              {StringConstants.ABOUT}
              {isOwner && (
                <button
                  className="mx-2 rounded-md p-1 transition hover:bg-background"
                  onClick={() => setIsEditOpen(true)}
                  aria-label="Edit about section"
                >
                  <Pencil size={18} className="text-muted hover:text-primary" />
                </button>
              )}
            </h2>
            <div className="h-auto rounded-xl border border-border/5 bg-card p-8 shadow-sm">
              <p className="whitespace-pre-line text-muted-foreground">
                {profile.community.description}
              </p>
              <div className="my-2 flex flex-wrap gap-2">
                {profile.community.tags.map((tag: any) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-primary/5 px-3 py-1 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Offerings Section */}
          <div className="rounded-xl border border-border/5 transition-all duration-300">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">
                {StringConstants.OFFERINGS}
              </h2>
              {isOwner && (
                <AddOfferingDialog onOfferingAdded={fetchOfferings} />
              )}
            </div>

            {offerings.length === 0 ? (
              <div className="rounded-xl border border-border/5 bg-card py-16 text-center">
                <p className="text-lg text-muted-foreground">
                  {StringConstants.NO_OFFERINGS}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {offerings.map((offering, index) => (
                  <div
                    key={offering._id || `${offering.title}-${index}`}
                    className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-blue-100 hover:shadow-md"
                  >
                    {/* Top gradient accent */}
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-80" />

                    <div className="flex gap-4 items-start">
                      {/* Icon and Meet badge */}
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

                      {/* Title, Price, Description */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                            {offering.title}
                          </h3>

                          {offering.is_free ||
                          offering.discounted_price === 0 ? (
                            <Badge
                              variant="outline"
                              className="border-green-200 bg-green-50 text-green-700"
                            >
                              Free
                            </Badge>
                          ) : (
                            <div className="flex flex-col items-end">
                              {offering.discounted_price !== null &&
                              offering.discounted_price !== undefined ? (
                                <>
                                  {offering.price?.amount !== null &&
                                    offering.price?.amount !== undefined && (
                                      <span className="text-xs text-gray-400 line-through">
                                        ₹{offering.price.amount}
                                      </span>
                                    )}
                                  <span className="font-semibold text-gray-900">
                                    ₹{offering.discounted_price}
                                  </span>
                                </>
                              ) : offering.price?.amount !== null &&
                                offering.price?.amount !== undefined ? (
                                <span className="font-semibold text-gray-900">
                                  ₹{offering.price.amount}
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>

                        <p className="mt-2 max-w-xl whitespace-pre-line text-sm text-gray-600">
                          {offering.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center mt-4 space-x-3 w-full bg-gray-100 px-4 py-2 rounded-md shadow-sm ml-0">
                      <FcClock size={28} className="text-primary-foreground" />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span className="text-base  font-semibold text-gray-700">
                          Duration:
                        </span>
                        <span className="text-base text-gray-600">
                          {offering.duration} min
                        </span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-5 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                      {isOwner ? (
                        <div className="mr-auto flex gap-2">
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
                            onClick={() => handleDeleteOffering(offering._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>{StringConstants.DELETE}</span>
                          </Button>
                        </div>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  size="sm"
                                  disabled={
                                    !offering.is_free && !isBankConnected
                                  }
                                  className={`flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-400 ${
                                    !isOwner
                                      ? "cursor-pointer"
                                      : "cursor-not-allowed opacity-50"
                                  }`}
                                  onClick={() => {
                                    if (!session) {
                                      signIn("google");
                                      return;
                                    }
                                    if (!isOwner) setSelectedOffering(offering);
                                  }}
                                >
                                  <span>Book Now</span>
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </span>
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
                                  <circle cx="12" cy="12" r="10" fill="white" />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 16v-4m0-4h.01"
                                  />
                                </svg>
                                <span>
                                  The expert is not accepting bookings at the
                                  moment
                                </span>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                ))}

                {/* Booking dialog */}
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
              </div>
            )}
          </div>

          {/* Testimonials Section */}
          <div className="col-span-1 mt-8 lg:col-span-2">
            <div className="rounded-xl shadow-sm">
              <Testimonials />
            </div>
          </div>

          {/* Modals */}
          {isEditOpen && (
            <EditCommunityModal
              profile={profile}
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
      </div>
    </div>
  );
}
