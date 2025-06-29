"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Pin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getSelectedTopic } from "@/redux/postSlice";
import { Button } from "@/components/ui/button";
import { setActiveCommunity } from "@/redux/channelSlice";
import { StringConstants } from "@/components/common/CommonText";
import { setCommunityData } from "@/redux/communitySlice";

// Import the new hooks
import { useUserCommunities } from "@/hooks/api/useCommunityQueries";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";

// Custom hook for user interests
const useUserInterests = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userInterests", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const response = await apiClient.post("/v1/category/interest", { userId });
      return response;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

type SelectedItem = {
  section: string;
  id: number | string;
};

interface Community {
  _id: string;
  name: string;
  image: string;
  background_image: string;
}

export function LeftSidebar() {
  const COMMUNITY_PROFILE_PATH = "/community/profile";
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const sessionId = useSelector((state: RootState) => state.user.sessionId);
  
  const [openSections, setOpenSections] = React.useState({
    customFeed: true,
    customTopics: true,
    followedTopics: true,
    recentFeed: true,
    communities: true,
  });

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Use the new hooks - only when userId is available
  const shouldFetchData = !!userId;
  const {
    data: userCommunitiesData,
    isLoading: isCommunitiesLoading,
    error: communitiesError,
  } = useUserCommunities(userId || "placeholder", {}, shouldFetchData);

  const {
    data: userInterestsData,
    isLoading: isInterestsLoading,
    error: interestsError,
  } = useUserInterests(userId || undefined);

  // Extract communities from the paginated response
  const communities = userCommunitiesData?.data || [];

  // State for custom feeds and topics
  const [selectedCommunities, setSelectedCommunities] = useState<any[]>([]);
  const [feedName, setFeedName] = useState("");
  const [showSelectModal, setShowSelectModal] = useState(false);

  // Topics state
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopics, setCustomTopics] = useState<
    { name: string; topicIds: string[] }[]
  >([]);
  const [topicFeedName, setTopicFeedName] = useState("");
  const [showTopicsModal, setShowTopicsModal] = useState(false);

  const [selectedItem, setSelectedItem] = React.useState<SelectedItem | null>(
    null
  );
  const [customFeeds, setCustomFeeds] = useState<
    { name: string; communityIds: string[] }[]
  >([]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Load custom feeds and topics from localStorage
  useEffect(() => {
    const storedFeeds = localStorage.getItem("customFeeds");
    if (storedFeeds) {
      setCustomFeeds(JSON.parse(storedFeeds));
    }

    const storedTopics = localStorage.getItem("customTopics");
    if (storedTopics) {
      setCustomTopics(JSON.parse(storedTopics));
    }
  }, []);

  // Save custom feeds and topics to localStorage
  useEffect(() => {
    localStorage.setItem("customFeeds", JSON.stringify(customFeeds));
  }, [customFeeds]);

  useEffect(() => {
    localStorage.setItem("customTopics", JSON.stringify(customTopics));
  }, [customTopics]);

  // Set active community when communities are loaded
  useEffect(() => {
    if (communities && communities.length > 0) {
      dispatch(
        setActiveCommunity({
          id: communities[0]?._id,
          name: communities[0]?.name,
          image: communities[0]?.image || "",
          background_image: communities[0]?.background_image || "",
          user_isBankDetailsAdded: false, // Default values
          user_iscalendarConnected: false,
        })
      );
    }
  }, [communities, dispatch]);

  // Handle item selection
  const handleItemClick = (section: string, id: number | string) => {
    setSelectedItem({ section, id });
  };

  // Helper function to check if an item is selected
  const isItemSelected = (section: string, id: number | string) => {
    return selectedItem?.section === section && selectedItem?.id === id;
  };

  const handleCommunityClick = (community: Community) => {
    dispatch(
      setActiveCommunity({
        id: community._id,
        name: community.name,
        image: community.image,
        background_image: community.background_image,
        user_isBankDetailsAdded: false, // Default values
        user_iscalendarConnected: false,
      })
    );
    dispatch(
      setCommunityData({
        communityId: community._id,
        userId: userId,
      })
    );
    
    const cleanedCommunityName = community.name
      .replace(/\s+/g, "-")
      .replace(/\|/g, "-")
      .replace(/-+/g, "-");
    const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
    const communityParam = `${encodedCommunityName}-${community._id}`;
    router.push(`/community/${communityParam}/profile`);
  };

  function handleSelectChange(communityId: string) {
    setSelectedCommunities((prev) =>
      prev.includes(communityId)
        ? prev.filter((id) => id !== communityId)
        : [...prev, communityId]
    );
  }

  const toggleBodyScroll = (lockScroll: boolean) => {
    if (lockScroll) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  useEffect(() => {
    toggleBodyScroll(showTopicsModal);
    return () => toggleBodyScroll(false);
  }, [showTopicsModal]);

  const handleTopicSelectChange = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  async function handleCloseTopicsModal() {
    setShowTopicsModal(false);
    try {
      setCustomTopics((prev) => [
        ...prev,
        { name: topicFeedName, topicIds: [...selectedTopics] },
      ]);

      await dispatch(
        getSelectedTopic({
          userId: userId,
          categoryIds: selectedTopics,
        })
      );

      setTopicFeedName("");
      setSelectedTopics([]);
    } catch (error) {
      console.error("Error creating custom topic feed:", error);
    }
  }

  function handleDeleteCustomFeed(index: number) {
    setCustomFeeds((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDeleteCustomTopic(index: number) {
    setCustomTopics((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCloseModal() {
    setShowSelectModal(false);

    try {
      const response = await apiClient.post(
        "/v1/feed/custom/create",
        {
          userId: userId,
          communityIds: selectedCommunities,
          name: feedName,
        }
      );
      console.log("Custom feed created:", response);

      setCustomFeeds((prev) => [
        ...prev,
        { name: feedName, communityIds: [...selectedCommunities] },
      ]);

      setFeedName("");
      setSelectedCommunities([]);
    } catch (error) {
      console.error("Error creating custom feed:", error);
    }
  }

  // Handle loading states
  if (isCommunitiesLoading) {
    return (
      <aside className="left-0 h-screen w-80 pl-5 pr-2 py-4 pb-3 space-y-3">
        <div className="bg-card rounded-xl p-4 space-y-2">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="left-0 h-screen w-80 pl-5 pr-2 py-4 pb-3 space-y-3 ">
      {/* My Communities */}
      <div className="bg-card rounded-xl p-4 space-y-2">
        <Collapsible
          open={openSections.communities}
          onOpenChange={() => toggleSection("communities")}
          className="space-y-2  py-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium border-b border-zinc-300 py-2 ">
            {StringConstants.PAGE_FOLLOWED}
            {openSections.communities ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 max-h-[365px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-900 overflow-auto scrollbar-none cursor-pointer">
            {communitiesError ? (
              <div className="text-red-500 text-sm">
                Failed to load communities
              </div>
            ) : (
              communities
                ?.filter((community: any) => community !== null)
                .map((community: any) => (
                  <button
                    key={community?._id}
                    onClick={() => handleCommunityClick(community)}
                    className="w-full flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-background text-start"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={community?.image} />
                      <AvatarFallback>{community?.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1">{community?.name}</span>
                  </button>
                ))
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </aside>
  );
}
