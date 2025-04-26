"use client";

import React from "react";
import type { RootState } from "@/redux/store";
import { Avatar } from "@radix-ui/react-avatar";
import axios from "axios";
import Image from "next/image";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { ArrowRight, Edit, Trash2, Pencil } from "lucide-react";
import { AddOfferingDialog } from "./AddOfferingdialog";
import { BookingDialog } from "../booking/Bookingdialog";
import { IoVideocam } from "react-icons/io5";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { HiMiniUserGroup } from "react-icons/hi2";
import { EditCommunityModal } from "../form/editCommunity";
import EditOfferingModal from "./UpdateOffering";
import { StringConstants } from "../common/CommonText";
import { GrInstagram } from "react-icons/gr";
import { BsYoutube } from "react-icons/bs";
import { MdOutlineRssFeed, MdPeopleAlt } from "react-icons/md";
import numbro from "numbro";
import { motion } from "framer-motion";
import Testimonials from "../testimonial/Testimonial";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "../Loader";
import { FaLinkedinIn } from "react-icons/fa6";
import { setIsBankAdded, setIsCalendarConnected } from "@/redux/userSlice";
import { RiUserSharedFill } from "react-icons/ri";
import { Stepper } from "./Steeper";
import { RiUserSharedFill } from "react-icons/ri";

import { FaShareAlt } from "react-icons/fa";

interface CommunityProfile {
  user: {
    user_name: string;
    user_email: string;
    user_avatar: string;
    about: string;
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
  duration: number;
  is_free: boolean;
  tags: string[];
  rating: number;
  total_ratings: number;
}

// Add this interface after the other interfaces
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
              className={`w-4 h-4 ${
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

interface InfiniteMovingCardsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: Testimonial[];
  direction: "left" | "right";
  speed: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
}

const containerVariants = {
  initial: {
    x: "100%",
  },
  animate: {
    x: "-100%",
    transition: {
      x: { repeat: Number.POSITIVE_INFINITY, duration: 13, ease: "linear" },
    },
  },
};

const itemVariants = {
  initial: {
    x: 0,
  },
  animate: {
    x: "-100%",
    transition: {
      x: { repeat: Number.POSITIVE_INFINITY, duration: 13, ease: "linear" },
    },
  },
};

const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
  ...props
}: InfiniteMovingCardsProps) => {
  const xStart = direction === "left" ? "100%" : "-100%";
  const xEnd = direction === "left" ? "-100%" : "100%";

  let duration = 13;
  if (speed === "fast") {
    duration = 8;
  }
  if (speed === "slow") {
    duration = 20;
  }

  const containerVariants = {
    initial: {
      x: xStart,
    },
    animate: {
      x: xEnd,
      transition: {
        x: {
          repeat: Number.POSITIVE_INFINITY,
          duration: duration,
          ease: "linear",
        },
      },
    },
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className="py-4">
        <motion.div
          className="flex w-max gap-6"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          style={{
            "--num": items.length,
          }}
          whileHover={pauseOnHover ? "paused" : ""}
          {...props}
        >
          {items.map((item, i) => (
            <Card key={i} item={item} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export function ProfileCard({ communityId }: ProfileCardProps) {
  const dispatch = useDispatch();
  const userFollowedCommunities = useSelector(
    (state: RootState) => state.user.userFollowedCommunities
  );
  console.log("@userFollowedCommunities", userFollowedCommunities);
  const user = useSelector((state: RootState) => state.user.user);
  const community = useSelector((state: RootState) => state.community);
  const memberDetails = useSelector(
    (state: RootState) => state.member.memberDetails
  );
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [avatarImgUrl, setAvatarImgUrl] = useState("");
  const [bgImgUrl, setBgImgUrl] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOfferingModal, setSelectedOfferingModal] = useState(null);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(
    null
  );
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const activeCommunityId = communityId || community?.communityId;

  // Add this state in ProfileCard component after other state declarations

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

  // Add this near the top of your component, after other useQuery hooks
  const { data: followedCommunitiesData } = useQuery({
    queryKey: ["userFollowedCommunities"],
    enabled: !!user?._id,
  });

  // Update the isCommunityFollowed check to use the query data
  const isCommunityFollowed = React.useMemo(() => {
    if (followedCommunitiesData) {
      return followedCommunitiesData.some(
        (c: any) => c?._id === activeCommunityId
      );
    }
    return userFollowedCommunities.some((c) => c?._id === activeCommunityId);
  }, [followedCommunitiesData, userFollowedCommunities, activeCommunityId]);

  const isOwner =
    memberDetails &&
    memberDetails.is_owner === true &&
    memberDetails.community_id === community.communityId;

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["communityProfile", activeCommunityId],
    queryFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
        {
          communityId: activeCommunityId,
        }
      );
      console.log("@responseProfilePAge", response.data.data);
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
  useEffect(() => {
    if (profile?.user) {
      dispatch(setIsBankAdded(profile.user.user_isBankDetailsAdded));
      dispatch(setIsCalendarConnected(profile.user.user_iscalendarConnected));
    }
  }, [profile?.user, dispatch]);

  console.log("@profile", profile?.community.background_image);

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

  const handleLeaveCommunity = () => {
    if (!user?._id || !activeCommunityId) return;
    unfollowMutation.mutate();
  };

  useEffect(() => {
    fetchOfferings();
  }, [community.communityId, fetchOfferings]);

  // useEffect(() => {
  //   if (!community?.communityId) return; // Ensure communityId is set before fetching

  //   const fetchProfileData = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await axios.post(
  //         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
  //         {
  //           communityId: community.communityId,
  //         }
  //       );

  //       console.log("@response", response.data.data);
  //       if (response.data.r === "s") {
  //         if (response.data.data.community.image) {
  //           setAvatarImgUrl(response.data.data.community.image);
  //         } else {
  //           setAvatarImgUrl(
  //             `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.data.user.user_name}`
  //           );
  //         }
  //         if (response.data.data.community.background_image) {
  //           setBgImgUrl(response.data.data.community.background_image);
  //         } else {
  //           setBgImgUrl(
  //             "https://random-image-pepebigotes.vercel.app/api/random-image"
  //           );
  //         }

  //         dispatch(
  //           setUserBankDetails(
  //             response.data.data.user.user_isBankDetailsAdded || false
  //           )
  //         );
  //         dispatch(
  //           setUserCalendarConnected(
  //             response.data.data.user.user_iscalendarConnected || false
  //           )
  //         );
  //       }
  //     } catch (error) {
  //       toast.error("Failed to load community profile");
  //       console.error("Error fetching profile data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProfileData();
  // }, [community?.communityId]); // Dependency array includes communityId

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
    onSuccess: (data) => {
      if (data.r === "s") {
        toast.success("Successfully joined the community!");
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
      }
    },
    onError: (error) => {
      console.error("Error joining community:", error);
      toast.error("Failed to join the community. Please try again.");
    },
  });

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
  const formatNumber = (num: any) => {
    if (num < 1000) return num;
    return numbro(num).format({ average: true, mantissa: 1 }).toUpperCase();
  };

  // Add this function to render star ratings
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-.181h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ));
  };
  const handleShareClick = async () => {
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_FRONTEND_URL}/community/${communityId}/profile`;

    try {
      await navigator.share({
        title: "Check out this profile!",
        text: "Here is a community profile I wanted to share with you.",
        url: shareUrl,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
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

  // if (loading) return <div>{StringConstants.LOADING}</div>;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }
  if (!profile)
    return (
      <div className="text-center h-screen items-center text-2xl font-semibold">
        {StringConstants.NO_PROFILE_DATA}
      </div>
    );
  // console.log("@prifle", profile.user);
  // console.log("ekjrwhjkgkje", avatarImgUrl);
  const isBankConnected = profile?.user?.user_isBankDetailsAdded;
  const isCalendarConnected = profile?.user?.user_iscalendarConnected;
  return (
    <div className="w-full">
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
            },
          ]}
        />
      )}
      <div className="max-w-6xl mx-auto py-2 px-3 md:px-0">
        <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border/5">
          <div className="relative">
            <div className="h-32 w-full overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background">
              <Image
                src={
                  profile?.community.background_image != undefined
                    ? profile?.community.background_image
                    : bgImgUrl
                }
                alt="Profile banner"
                width={1200}
                height={400}
                className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            <div className="absolute -bottom-16 left-8">
              <Avatar className="w-24 h-24 ring-4 ring-background shadow-xl">
                <Image
                  src={profile?.community?.image || avatarImgUrl}
                  alt={profile?.community?.name || "Community Avatar"}
                  width={100}
                  height={100}
                  className="w-24 h-24 rounded-full object-cover bg-primary/5 border-4 border-background transition-transform duration-300 hover:scale-105"
                  unoptimized
                />

                {/* <AvatarFallback className="text-primary text-3xl w-32 h-32 bg-primary/5">
                {profile.user.user_name[0]}
              </AvatarFallback> */}
              </Avatar>
            </div>
          </div>

          <div className="pt-16 pb-4 px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
                  {profile?.community?.name}
                  {isOwner && (
                    <button
                      className="p-1 rounded-md hover:bg-background transition"
                      onClick={() => setIsEditOpen(true)}
                    >
                      <Pencil
                        size={18}
                        className="text-muted hover:text-primary"
                      />
                    </button>
                  )}
                </h1>

                <p className="text-muted-foreground text-lg">
                  {StringConstants.CREATED_BY}{" "}
                  <span className="text-foreground">
                    {profile.user.user_name}
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground my-2">
                  <div className="flex items-center gap-1.5">
                    <MdPeopleAlt className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-foreground">
                      {profile.community.num_member.toLocaleString()}
                    </span>
                    {StringConstants.MEMBER}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5">
                    <MdOutlineRssFeed className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-foreground">
                      {profile?.community?.post_count}
                    </span>
                    {StringConstants.POSTS}
                  </div>

                  {profile.community?.instagram_followers > 0 && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <div className="flex items-center gap-1.5">
                        <GrInstagram className="h-5 w-5 text-pink-500" />
                        <span className="font-medium text-foreground">
                          {formatNumber(profile.community?.instagram_followers)}
                        </span>
                        {StringConstants.FOLLOWERS}
                      </div>
                    </>
                  )}

                  {profile.community?.youtube_followers > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <BsYoutube className="h-5 w-5 text-red-500" />
                      <span className="font-medium text-foreground">
                        {formatNumber(profile.community?.youtube_followers)}
                      </span>
                      {StringConstants.SUBSCRIBERS}
                    </div>
                  )}

                  {profile.community?.linkedin_followers > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <FaLinkedinIn className="h-5 w-5 text-blue-800" />
                      <span className="font-medium text-foreground">
                        {formatNumber(profile.community?.linkedin_followers)}
                      </span>
                      {StringConstants.FOLLOWERS}
                    </div>
                  )}
                </div>
              </div>
              {isOwner ? (
                ""
              ) : isCommunityFollowed ? (
                <Button
                  variant="destructive"
                  size="lg"

                  className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300  px-8"

                  onClick={handleLeaveCommunity}
                >
                  <HiMiniUserGroup className="h-8 w-8" />
                  {StringConstants.FOLLOWING}
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="lg"

                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300  px-8"

                  onClick={handleJoinCommunity}
                >
                  <HiMiniUserGroup className="h-8 w-8" />
                  {StringConstants.FOLLOW}
                </Button>
              )}


              {isOwner && (
                <Button onClick={handleShareClick}>
                  Share Profile
                  <RiUserSharedFill />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {StringConstants.ABOUT}
              {isOwner && (
                <button
                  className="p-1 rounded-md hover:bg-background transition mx-2"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Pencil size={18} className="text-muted hover:text-primary" />
                </button>
              )}
            </h2>
            <div className="bg-card rounded-xl p-8 shadow-sm border border-border/5 h-auto">
              <p className="text-muted-foreground  whitespace-pre-line">
                {profile.community.description}
              </p>
              <div className="flex flex-wrap gap-2 my-2">
                {profile.community.tags.map((tag: any) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-primary/5 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10 transition-colors duration-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl transition-all duration-300 border border-border/5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-foreground">
                {StringConstants.OFFERINGS}
              </h2>
              <AddOfferingDialog onOfferingAdded={fetchOfferings} />
            </div>

            {!isBankConnected || offerings.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-xl border border-border/5">
                <p className="text-lg text-muted-foreground">
                  {StringConstants.NO_OFFERINGS}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {offerings.map((offering) => (
                  <div
                    key={offering._id || Math.random()}
                    className="group bg-white rounded-lg p-6 hover:shadow-sm transition-all duration-300"
                  >
                    {/* Top Row: Icon + Title + Description */}
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <IoVideocam className="text-primary h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                          {offering.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-xl whitespace-pre-line">
                          {offering.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 px-2">
                      {/* <span className="text-xl font-semibold text-gray-900 pl-12">
                      ₹{offering.price.amount}
                    </span> */}
                      <div className="flex items-center justify-between gap-2">
                        {isOwner && (
                          <div className={`flex gap-2`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-3 py-2 rounded-lg flex items-center gap-1"
                              onClick={() => handleEditClick(offering)}
                            >
                              <Edit className="w-4 h-4" />
                              <span>{StringConstants.EDIT}</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="px-3 py-2 rounded-lg flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={() => handleDeleteOffering(offering._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>{StringConstants.DELETE}</span>
                            </Button>
                          </div>
                        )}

                        {/* Book Now button */}
                        <Button
                          size="sm"
                          disabled={isOwner ?? false}
                          className={`text-white px-6 py-2 rounded-lg flex items-center gap-2 ${
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
                          {offering.is_free ? (
                            <span>Free</span>
                          ) : offering?.discounted_price &&
                            offering?.price?.amount ? (
                            <>
                              <span className="line-through text-xs opacity-60">
                                ₹{offering.price.amount}
                              </span>
                              <span> ₹{offering.discounted_price}</span>
                            </>
                          ) : offering?.price?.amount ? (
                            <span>₹{offering.price.amount}</span>
                          ) : null}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

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
          <div className="col-span-1 lg:col-span-2 mt-8">
            <div className="rounded-xl shadow-sm ">
              <Testimonials />
            </div>
          </div>
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
