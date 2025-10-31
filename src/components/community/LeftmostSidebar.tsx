"use client";
import { setActiveCommunity } from "@/redux/channelSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Settings } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { FaCompass } from "react-icons/fa";
import Link from "next/link";
import CreatorForm from "../form/CreatorForm";
import { setCommunityData } from "@/redux/communitySlice";
import { setUserFollowedCommunities } from "@/redux/userSlice";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StringConstants } from "../common/CommonText";
import {
  useLeaveCommunity,
  useJoinCommunity,
} from "@/hook/queries/useCommunityMutations";
import { toast } from "sonner";
import { useParams, useRouter, usePathname } from "next/navigation";

interface Community {
  _id: string;
  title: string;
  name: string;
  description: string;
  subscription: boolean;
  subscription_price: number;
  image: string;
  background_image: string;
}

export function LeftmostSidebar() {
  const router = useRouter();
  const pathname = usePathname(); // Add usePathname to get the current URL
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const sessionId = useSelector((state: RootState) => state.user.sessionId);
  const [newChannelName, setNewChannelName] = useState("");
  const [isCreatorFormOpen, setIsCreatorFormOpen] = useState(false);

  const dispatch = useDispatch();
  const params = useParams();
  const communityParam = params["community-Id"] as string; // e.g., "Adarsh-singh-Frontend-Developer-67cf3d9ac3642510085bbf8e"
  const lastHyphenIndex = communityParam ? communityParam.lastIndexOf("-") : -1;
  const activeCommunityId =
    lastHyphenIndex !== -1
      ? communityParam.substring(lastHyphenIndex + 1)
      : null;

  const user = useSelector((state: RootState) => state.user.user);

  // Fetch communities function
  const fetchCommunities = async (): Promise<Community[]> => {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    const url = `${apiUrl}/v1/community/user/follow`;
    const payload = { userId };

    console.log("🔍 [LeftmostSidebar] Fetching user communities");
    console.log("🌐 Request URL:", url);
    console.log("👤 User ID:", userId);
    console.log("📦 Request payload:", payload);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("✅ [LeftmostSidebar] Response status:", response.status);
    console.log("✅ [LeftmostSidebar] Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [LeftmostSidebar] Response not ok:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Failed to fetch communities: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("📥 [LeftmostSidebar] Response data:", result);
    console.log("📊 [LeftmostSidebar] Response keys:", Object.keys(result || {}));
    console.log("📊 [LeftmostSidebar] Result.data type:", typeof result?.data);
    console.log("📊 [LeftmostSidebar] Result.data is array:", Array.isArray(result?.data));

    // Handle different response formats
    let communitiesData = [];
    if (result.r === "s" && Array.isArray(result.data)) {
      communitiesData = result.data;
      console.log("✅ [LeftmostSidebar] Success format, communities:", communitiesData.length);
    } else if (Array.isArray(result.data)) {
      communitiesData = result.data;
      console.log("⚠️ [LeftmostSidebar] Direct data array format, communities:", communitiesData.length);
    } else if (Array.isArray(result)) {
      communitiesData = result;
      console.log("⚠️ [LeftmostSidebar] Direct array format, communities:", communitiesData.length);
    } else {
      console.error("❌ [LeftmostSidebar] Unexpected response format:", result);
      return [];
    }

    const validCommunities = communitiesData.filter(
      (community: Community | null) => community !== null
    );

    console.log("✅ [LeftmostSidebar] Valid communities:", validCommunities.length);

    dispatch(setUserFollowedCommunities(validCommunities));

    if (validCommunities.length > 0 && !activeCommunityId) {
      dispatch(
        setActiveCommunity({
          id: validCommunities[0]._id,
          name: validCommunities[0].name,
          image: validCommunities[0].image,
          background_image: validCommunities[0].background_image,
          user_isBankDetailsAdded: false,
          user_iscalendarConnected: false,
        })
      );
    }
    return validCommunities;
  };

  // Use React Query for fetching communities
  const {
    data: communities = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userCommunities", userId],
    queryFn: fetchCommunities,
    enabled: !!userId,
    staleTime: 0,
  });

  const queryClient = useQueryClient();

  // Join community mutation
  const joinCommunityMutation = useJoinCommunity();

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await joinCommunityMutation.mutateAsync({
        userId: userId!,
        communityId,
      });

      toast.success("Successfully joined the community");
    } catch (error) {
      toast.error("Failed to join community");
      console.error("Error joining community:", error);
    }
  };

  const handleCreateChannel = () => {
    if (newChannelName.trim()) {
      setNewChannelName("");
    }
  };

  // Function to get initials from page name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };


  const handleNavigation = (community: { _id: string; name: string }) => {
    const cleanedCommunityName = community.name
      .replace(/\s+/g, "-") 
      .replace(/\|/g, "-") 
      .replace(/-+/g, "-"); 
    const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
    const targetCommunityParam = `${encodedCommunityName}-${community._id}`;

    const pathSegments = pathname.split("/");
    const currentPage = pathSegments[3] || "profile"; 

    // Construct the target URL
    const targetPath =
      currentPage === "channel"
        ? `/community/${targetCommunityParam}/profile` // Always go to profile if coming from a channel
        : `/community/${targetCommunityParam}/${currentPage}`;

    // Avoid navigating if we're already on the target path
    if (pathname === targetPath) {
      return; // Prevent infinite loop by not navigating to the same URL
    }

    router.push(targetPath);
  };

  console.log("@communityDataLeftMostSideBar", communities);
  if (error) {
    return (
      <div className="fixed left-0 h-screen w-20 bg-background flex items-center justify-center text-red-500">
        {StringConstants.ERROR_LOADING_PAGES}
      </div>
    );
  }

  return (
    <div className="hidden md:flex md:bg-card fixed left-0 h-screen w-20 flex-col items-center border-r border-background py-20 gap-3">
      <div className="flex-1 w-full overflow-auto scrollbar-none cursor-pointer">
        <div className="flex flex-col items-center space-y-4 px-2 py-5">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="w-12 h-12 rounded-lg bg-background animate-pulse"
                />
              ))}
            </div>
          ) : (
            communities.map((community: any) => (
              <Button
                key={community._id}
                variant="ghost"
                size="icon"
                className={`relative rounded-lg ${
                  activeCommunityId === community._id
                    ? "bg-blue-500/20 ring-2 ring-purple-500"
                    : "hover:bg-zinc-800"
                }`}
                onClick={() => {
                  dispatch(
                    setActiveCommunity({
                      id: community._id,
                      name: community.name,
                      image: community.image,
                      background_image: community.background_image,
                      user_isBankDetailsAdded: false,
                      user_iscalendarConnected: false,
                    })
                  );
                  dispatch(
                    setCommunityData({
                      communityId: community._id,
                      userId: user._id,
                    })
                  );
                  handleNavigation(community); // Pass the community object directly
                }}
              >
                <Avatar className="w-full h-full !rounded-lg">
                  <AvatarImage
                    src={
                      community.image && community.image !== ""
                        ? community.image
                        : ""
                    }
                    alt={community.name}
                    className="!rounded-lg"
                  />
                  <AvatarFallback className="!rounded-lg bg-primary text-white">
                    {getInitials(community.name)}
                  </AvatarFallback>
                </Avatar>
                {community.subscription && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    ⭐
                  </span>
                )}
              </Button>
            ))
          )}

          <Dialog open={isCreatorFormOpen} onOpenChange={setIsCreatorFormOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg bg-background hover:bg-zinc-300 text-zinc-300"
              >
                <Plus className="h-6 w-6 text-muted" />
              </Button>
            </DialogTrigger>
            <CreatorForm
              onClose={() => setIsCreatorFormOpen(false)}
              onSuccess={() => {
                queryClient.invalidateQueries({
                  queryKey: ["userCommunities"],
                });
              }}
            />
          </Dialog>

          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-lg bg-background hover:bg-zinc-300 text-zinc-300"
            >
              <FaCompass className="text-muted" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
