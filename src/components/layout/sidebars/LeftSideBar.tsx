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
import { sidebarData } from "./Data";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/constants";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getSelectedTopic } from "@/redux/postSlice";
import { Button } from "@/components/ui/button";
import { setActiveCommunity } from "@/redux/channelSlice";
import { StringConstants } from "@/components/common/CommonText";
import { setCommunityData } from "@/redux/communitySlice";
// Optionally, if you're updating selected topics in the topic slice
// import { setSelectedTopics } from "@/redux/topicSlice";

type SelectedItem = {
  section: string;
  id: number | string;
};

interface Community {
  _id: string;
  name: string;
  image:string,
  background_image:string
}

export function LeftSidebar() {
  const COMMUNITY_PROFILE_PATH= '/community/profile'
  const userId = useSelector((state: RootState) => state.user.user?._id);
  // Extract session ID
  const sessionId = useSelector((state: RootState) => state.user.sessionId);
  const [openSections, setOpenSections] = React.useState({
    customFeed: true,
    customTopics: true,
    followedTopics: true,
    recentFeed: true,
    communities: true,
  });

  // const [posts, setPosts] = useState<any[]>([]);

  const dispatch = useDispatch<AppDispatch>();

  const [myCommunities, setMyCommunities] = useState<any>();
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState<any[]>([]);
  const [feedName, setFeedName] = useState("");
  const router = useRouter();

  // topics
  const [myTopics, setMyTopics] = useState<any>();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopics, setCustomTopics] = useState<
    { name: string; topicIds: string[] }[]
  >([]);
  const [topicFeedName, setTopicFeedName] = useState("");
  const [showTopicsModal, setShowTopicsModal] = useState(false);

  // Initialize with null selected item
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

  useEffect(() => {
    const storedFeeds = localStorage.getItem("customFeeds");
    if (storedFeeds) {
      setCustomFeeds(JSON.parse(storedFeeds));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("customFeeds", JSON.stringify(customFeeds));
  }, [customFeeds]);

  useEffect(() => {
    const storedTopics = localStorage.getItem("customTopics");
    if (storedTopics) {
      setCustomTopics(JSON.parse(storedTopics));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("customTopics", JSON.stringify(customTopics));
  }, [customTopics]);

  // Updated handler for item selection
  const handleItemClick = (section: string, id: number | string) => {
    setSelectedItem({ section, id });
  };

  // Helper function to check if an item is selected
  const isItemSelected = (section: string, id: number | string) => {
    return selectedItem?.section === section && selectedItem?.id === id;
  };

  // useEffect(() => {
  //   async function fetchCommunities() {
  //     try {
  //       const res = await axios.post(
  //         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user`,
  //         {
  //           userId: userId,
  //         }
  //       );

  //       setMyCommunities(res.data.data);
  //       dispatch(setUserFollowedCommunities(res.data.data));
  //       console.log("Comm ======>>>>", res.data.data);
  //     } catch (error) {
  //       console.error(error);
  //       setMyCommunities([]);
  //     }
  //   }
  //   fetchCommunities();
  // }, [userId]); // Ensure this runs when `userId` changes

  const communities = useSelector((state: RootState) => state?.user?.userFollowedCommunities|| []);
  
  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user/follow`,
          {
            userId: userId,
          }
        );

        setMyCommunities(res.data.data);
        console.log("Comm ======>>>>", res.data.data);
      } catch (error) {
        console.error(error);
        setMyCommunities([]);
      }
    }
    // fetchCommunities();
  }, []); // Ensure this runs when `userId` changes

  // ✅ Set active community AFTER myCommunities is updated
  useEffect(() => {
    if (myCommunities && myCommunities.length > 0) {
      dispatch(
        setActiveCommunity({
          id: myCommunities[0]?._id, // Now it's properly set
          name: myCommunities[0]?.name,
          image: myCommunities[0]?.image,
          background_image: myCommunities[0]?.background_image
        })
      );
    }
  }, [myCommunities, dispatch]); // Runs when `myCommunities` updates

  const handleCommunityClick = (community: Community) => {
    dispatch(
      setActiveCommunity({
        id: community._id, // Now it's properly set
        name: community.name,
        image: community.image,
        background_image: community.background_image
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

  // Topics
  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category/interest`,
          { userId: userId }
        );

        setMyTopics(res.data.data);
        console.log("Topics:----->>>>", res.data.data);
      } catch (error) {
        console.error(error);
        setMyTopics([]);
      }
    }

    fetchTopics();
  }, []);

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
      // redux implementation
      setCustomTopics((prev) => [
        ...prev,
        { name: topicFeedName, topicIds: [...selectedTopics] },
      ]);

      // const response = await axios.post("http://localhost:8000/v1/category/post", {
      //   userId: "678cf03a3755e3d81f93d5aa",
      //   categoryIds: selectedTopics,
      // });

      await dispatch(
        getSelectedTopic({
          userId: userId,
          categoryIds: selectedTopics,
        })
      );
      // console.log("Posts fetched:", response.data);
      // setPosts(response.data.posts || []);
      // Reset selection for topics feed
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

  // console.log("My Communities : ", myCommunities);

  async function handleCloseModal() {
    setShowSelectModal(false);
    // After closing, you could do more with selectedCommunities...

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/feed/custom/create`,
        {
          userId: userId,
          communityIds: selectedCommunities,
          name: feedName,
        }
      );
      console.log("Custom feed created:", response.data);

      setCustomFeeds((prev) => [
        ...prev,
        { name: feedName, communityIds: [...selectedCommunities] },
      ]);

      // Reset
      setFeedName("");
      setSelectedCommunities([]);
    } catch (error) {
      console.error("Error creating custom feed:", error);
    }
  }

  return (
    <aside className="left-0 h-screen w-80 pl-5 pr-2 py-4 pb-3 space-y-3 ">
      {/* <div className="bg-card rounded-xl p-3 space-y-1"> */}
      {/* </div> */}

      {/* My Communities */}
      <div className="bg-card rounded-xl p-4 space-y-2 border-2 border-zinc-400/40">
        <Collapsible
          open={openSections.communities}
          onOpenChange={() => toggleSection("communities")}
          className="space-y-2  py-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between text-md font-medium ">
            {StringConstants.PAGE_FOLLOWED}
            {openSections.communities ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 max-h-[365px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-900 overflow-auto scrollbar-none cursor-pointer">
            {communities
              ?.filter((community: any) => community !== null)
              .map((community: any) => (
                <button
                  key={community?._id}
                  onClick={() => handleCommunityClick(community)}
                  className="w-full flex items-center gap-2 rounded-lg text-sm pb-1 hover:bg-background text-start"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={community?.image} />
                    <AvatarFallback>{community?.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm font-semibold">{community?.name}</span>
                </button>
              ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </aside>
  );
}
