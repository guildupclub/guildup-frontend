"use client";

import React from "react";
import type { RootState } from "@/redux/store";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import axios from "axios";
import Image from "next/image";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { ArrowRight, Edit, Trash2, Pencil, User2, LockKeyhole, Link, Loader2, PencilIcon, Trash } from "lucide-react";
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
import { Stepper } from "./Steeper";
import { PlusIcon, ShoppingBag, Youtube, Instagram, Linkedin } from "lucide-react";
import { Badge } from "../ui/badge";

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
            "--num": items.length as number,
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
      return (followedCommunitiesData as any[]).some(
        (c) => c?._id === activeCommunityId
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
      <div className="relative h-64 w-full bg-primary/20">
        {profile?.community?.background_image && (
          <Image
            src={profile.community.background_image}
            alt="Background Image"
            fill
            className="object-cover rounded-b-2xl"
          />
        )}
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="absolute -top-16">
            <Avatar className="h-32 w-32 border-4 border-white">
              {profile?.community?.image ? (
                <AvatarImage src={profile.community?.image} />
              ) : (
                <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center">
                  <User2 className="h-16 w-16 text-white" />
                </div>
              )}
              <AvatarFallback>
                {profile?.community?.name?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 (left side) - Offerings with horizontal scroll */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">
                    {profile?.community?.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {profile?.community?.num_member || 0} members •{" "}
                    {profile?.community?.post_count || 0} posts
                  </p>
                </div>
                <div className="flex space-x-2">
                  {!isLoading ? (
                    isCommunityFollowed ? (
                      <Button
                        variant="outline"
                        onClick={handleLeaveCommunity}
                        className="ml-auto"
                      >
                        Unfollow
                      </Button>
                    ) : (
                      <Button className="ml-auto" onClick={handleJoinCommunity}>
                        Join Community
                      </Button>
                    )
                  ) : (
                    <Button disabled className="ml-auto">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </Button>
                  )}

                  {isOwner && (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditOpen(true)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Offerings Section with horizontal scroll */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Offerings</h3>
                {isOwner && (
                  <Link href={`/create-offering?communityId=${activeCommunityId}`}>
                    <Button size="sm" variant="outline">
                      <PlusIcon className="mr-1 h-4 w-4" /> Add Offering
                    </Button>
                  </Link>
                )}
              </div>
              
              {offerings && offerings.length > 0 ? (
                <div className="overflow-x-auto pb-4">
                  <div className="flex space-x-4" style={{ minWidth: "min-content" }}>
                    {offerings.map((offering) => (
                      <div
                        key={offering._id}
                        className="min-w-[300px] max-w-[300px] bg-white rounded-lg shadow-md p-4 border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-bold truncate flex-1">
                            {offering.title}
                          </h4>
                          {isOwner && (
                            <div className="flex space-x-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleEditClick(offering)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteOffering(offering._id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="my-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(offering.rating)}
                            <span className="text-gray-500 text-sm">
                              ({offering.total_ratings})
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 h-10">
                          {offering.description}
                        </p>
                        <div className="flex flex-wrap gap-1 my-2">
                          {offering.tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <div>
                            {offering.is_free ? (
                              <p className="font-bold text-green-600">Free</p>
                            ) : (
                              <p className="font-bold">
                                {offering.price.amount}{" "}
                                {offering.price.currency}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {offering.duration} mins
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOffering(offering);
                            }}
                          >
                            Book
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center border border-dashed border-gray-300">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-2 text-lg font-medium">
                    No Offerings Available
                  </h3>
                  <p className="mt-1 text-gray-500">
                    This community doesn't have any offerings yet.
                  </p>
                  {isOwner && (
                    <Link href={`/create-offering?communityId=${activeCommunityId}`}>
                      <Button className="mt-4" size="sm">
                        <PlusIcon className="mr-1 h-4 w-4" /> Create Offering
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Testimonials Section - Below Offerings */}
            <div className="mb-8">
              <div className="rounded-xl shadow-sm">
                <Testimonials />
              </div>
            </div>
          </div>

          {/* Column 2 (right side) - About, Tags, Social Media */}
          <div className="lg:col-span-1">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">About</h3>
              <p className="text-gray-700">
                {profile?.community?.description || "No description available."}
              </p>
            </div>

            {/* Tags Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {profile?.community?.tags && profile.community.tags.length > 0 ? (
                  profile.community.tags.map((tag: any, idx: any) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500">No tags available</p>
                )}
              </div>
            </div>

            {/* Social Media Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Social Media</h3>
              <div className="space-y-4">
                {profile?.community?.youtube_followers && (
                  <div className="flex items-center">
                    <Youtube className="h-5 w-5 text-red-600 mr-2" />
                    <div>
                      <p className="font-medium">YouTube</p>
                      <p className="text-sm text-gray-500">
                        {formatNumber(profile.community.youtube_followers)} followers
                      </p>
                    </div>
                  </div>
                )}
                {profile?.community?.instagram_followers && (
                  <div className="flex items-center">
                    <Instagram className="h-5 w-5 text-pink-600 mr-2" />
                    <div>
                      <p className="font-medium">Instagram</p>
                      <p className="text-sm text-gray-500">
                        {formatNumber(profile.community.instagram_followers)} followers
                      </p>
                    </div>
                  </div>
                )}
                {profile?.community?.linkedin_followers && (
                  <div className="flex items-center">
                    <Linkedin className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="font-medium">LinkedIn</p>
                      <p className="text-sm text-gray-500">
                        {formatNumber(profile.community.linkedin_followers)} followers
                      </p>
                    </div>
                  </div>
                )}
                {!profile?.community?.youtube_followers && 
                  !profile?.community?.instagram_followers && 
                  !profile?.community?.linkedin_followers && (
                  <p className="text-gray-500">No social media information available</p>
                )}
              </div>
            </div>
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
  );
}
