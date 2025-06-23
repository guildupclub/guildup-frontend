"use client";
import { setActiveCommunity } from "@/redux/channelSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { FaCompass } from "react-icons/fa";
import Link from "next/link";
import CreatorForm from "../form/CreatorForm";
import { setCommunityData } from "@/redux/communitySlice";
import { setUserFollowedCommunities } from "@/redux/userSlice";
import { useQueryClient } from "@tanstack/react-query";
import { StringConstants } from "../common/CommonText";
import { useJoinCommunity } from "@/hooks/api/useCommunityQueries";
import { toast } from "sonner";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useUserCommunities } from "@/hooks/api/useCommunityQueries";
import { parseCommunityParam, createCommunityParam, getInitials } from "@/utils/helpers";
import type { Community } from "@/types/community.types";

export function LeftmostSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const user = useSelector((state: RootState) => state.user.user);
  const [isCreatorFormOpen, setIsCreatorFormOpen] = useState(false);
  
  const dispatch = useDispatch();
  const params = useParams();
  const communityParam = params["community-Id"] as string;
  const { communityId: activeCommunityId } = parseCommunityParam(communityParam || '');
  
  const queryClient = useQueryClient();

  // Use existing hook to fetch user communities
  const {
    data: communitiesData,
    isLoading,
    error,
  } = useUserCommunities(
    userId || '',
    undefined,
    !!userId
  );

  const communities = communitiesData?.data.filter((community: Community) => community !== null) || [];

  // Update Redux state when communities are loaded
  useEffect(() => {
    if (communities.length > 0) {
      // Map communities to match Redux Community interface
      const mappedCommunities = communities.map(community => ({
        id: community._id,
        name: community.name,
      }));
      dispatch(setUserFollowedCommunities(mappedCommunities));

      // Set first community as active if none is currently active
      if (!activeCommunityId) {
        dispatch(
          setActiveCommunity({
            id: communities[0]._id,
            name: communities[0].name,
            image: communities[0].image || '',
            background_image: communities[0].background_image || '',
            user_isBankDetailsAdded: false,
            user_iscalendarConnected: false,
          })
        );
      }
    }
  }, [communities, activeCommunityId, dispatch]);

  // Join community mutation
  const joinCommunityMutation = useJoinCommunity();

  const handleJoinCommunity = async (communityId: string) => {
    if (!userId) {
      toast.error("Please sign in to join communities");
      return;
    }

    try {
      await joinCommunityMutation.mutateAsync({
        communityId,
      });
      toast.success("Successfully joined the community");
    } catch (error) {
      toast.error("Failed to join community");
      console.error("Error joining community:", error);
    }
  };

  const handleNavigation = (community: Community) => {
    const targetCommunityParam = createCommunityParam(community.name, community._id);
    
    const pathSegments = pathname.split("/");
    const currentPage = pathSegments[3] || "profile";

    // Construct the target URL
    const targetPath =
      currentPage === "channel"
        ? `/community/${targetCommunityParam}/profile`
        : `/community/${targetCommunityParam}/${currentPage}`;

    // Avoid navigating if we're already on the target path
    if (pathname === targetPath) {
      return;
    }

    // Update Redux state
    dispatch(
      setActiveCommunity({
        id: community._id,
        name: community.name,
        image: community.image || '',
        background_image: community.background_image || '',
        user_isBankDetailsAdded: false,
        user_iscalendarConnected: false,
      })
    );

    if (user?._id) {
      dispatch(
        setCommunityData({
          communityId: community._id,
          userId: user._id,
        })
      );
    }

    router.push(targetPath);
  };

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
            communities.map((community: Community) => (
              <Button
                key={community?._id}
                variant="ghost"
                size="icon"
                className={`relative rounded-lg ${
                  activeCommunityId === community?._id
                    ? "bg-blue-500/20 ring-2 ring-purple-500"
                    : "hover:bg-zinc-800"
                }`}
                onClick={() => handleNavigation(community)}
              >
                <Avatar className="w-full h-full !rounded-lg">
                  <AvatarImage
                    src={community?.image || ''}
                    alt={community?.name}
                    className="!rounded-lg"
                  />
                  <AvatarFallback className="!rounded-lg bg-primary text-white">
                    {getInitials(community?.name)}
                  </AvatarFallback>
                </Avatar>
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
