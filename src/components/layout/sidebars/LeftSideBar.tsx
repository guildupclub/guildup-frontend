"use client";

import * as React from "react";
import Link from "next/link";
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
// Optionally, if you're updating selected topics in the topic slice
// import { setSelectedTopics } from "@/redux/topicSlice";

type SelectedItem = {
  section: string;
  id: number | string;
};

export function LeftSidebar() {
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

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user`,
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
    fetchCommunities();
  }, [userId]); // Ensure this runs when `userId` changes

  // ✅ Set active community AFTER myCommunities is updated
  useEffect(() => {
    if (myCommunities && myCommunities.length > 0) {
      dispatch(
        setActiveCommunity({
          id: myCommunities[0]?._id, // Now it's properly set
          name: myCommunities[0]?.name,
        })
      );
    }
  }, [myCommunities, dispatch]); // Runs when `myCommunities` updates

  const handleCommunityClick = (community: { _id: string; name: string }) => {
    dispatch(setActiveCommunity({ id: community._id, name: community.name }));
    router.push(`/community/${community._id}/feed`);
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
    <aside className="fixed top-0 left-0 h-screen w-80  pt-20 pb-3 px-4 space-y-3">
      <div className="bg-card rounded-xl p-3 space-y-1">
        <div>
          <button
            onClick={() => handleItemClick("home", "feed")}
            className={`w-full flex items-center text-sm font-medium border-b border-zinc-300 py-2 bg ${
              isItemSelected("home", "feed") ? "text-purple-500" : ""
            }`}
          >
            Home Feed
          </button>
        </div>

        <Collapsible
          open={openSections.customFeed}
          onOpenChange={() => toggleSection("customFeed")}
          className="space-y-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium ">
            Custom Feed
            {openSections.customFeed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>

          <CollapsibleContent>
            <button
              onClick={() => setShowSelectModal(true)}
              className="w-full flex items-center gap-2 rounded-lg p-2 text-sm  hover:bg-background"
            >
              Select Feed
            </button>

            {customFeeds.map((feed, idx) => (
              <div
                key={`${feed.name}-${idx}`}
                className="mt-2 p-2 bg-card rounded-lg "
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-purple-300 font-medium mb-1">
                    {feed.name}
                  </h4>
                  <button
                    onClick={() => handleDeleteCustomFeed(idx)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Delete
                  </button>
                </div>
                {feed.communityIds.map((cid) => {
                  const community = myCommunities.find(
                    (c: any) => c._id === cid
                  );
                  return (
                    <div
                      key={cid}
                      className=" mt-1 border-l border-zinc-700 pl-4 text-sm"
                    >
                      <div className="font-semibold ">{community?.name}</div>
                      {/* {community?.description && (
                        <div className="text-zinc-400">{community.description}</div>
                      )}
                      {community?.membersCount && (
                        <div className="text-zinc-500">Members: {community.membersCount}</div>
                      )} */}
                    </div>
                  );
                })}
              </div>
            ))}
          </CollapsibleContent>

          {showSelectModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-card/50">
              <div className="bg-card p-4 rounded space-y-2 w-[300px]">
                <div className="flex justify-between items-center">
                  <h2 className="">Create Custom Feed</h2>
                  <Button
                    onClick={() => setShowSelectModal(false)}
                    className="text-white"
                  >
                    X
                  </Button>
                </div>
                <input
                  type="text"
                  value={feedName}
                  onChange={(e) => setFeedName(e.target.value)}
                  className="w-full p-2 rounded-lg  bg-background mb-2"
                  placeholder="Feed Name"
                />
                <p className="">Select Communities:</p>
                {myCommunities.map((comm: any) => (
                  <label key={comm._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCommunities.includes(comm._id)}
                      onChange={() => handleSelectChange(comm._id)}
                    />
                    {comm.name}
                  </label>
                ))}
                <Button
                  onClick={handleCloseModal}
                  className="mt-2  px-3 py-1 rounded text-white"
                >
                  Create
                </Button>
              </div>
            </div>
          )}
        </Collapsible>

        {/* Followed Topics */}

        <Collapsible
          open={openSections.customTopics}
          onOpenChange={() => toggleSection("customTopics")}
          className="space-y-2 border-t border-zinc-300 py-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium">
            Custom Topics
            {openSections.customTopics ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Button
              onClick={() => setShowTopicsModal(true)}
              className="w-full flex items-center gap-2 rounded-lg p-2 text-sm  text-white"
            >
              Select Topics
            </Button>
            {customTopics.map((topicFeed, idx) => (
              <div
                key={`${topicFeed.name}-${idx}`}
                className="mt-2 p-2 bg-zinc-800 rounded-lg "
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-purple-300 font-medium mb-1">
                    {topicFeed.name}
                  </h4>
                  <button
                    onClick={() => handleDeleteCustomTopic(idx)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Delete
                  </button>
                </div>
                {topicFeed.topicIds.map((tid) => {
                  const topic = myTopics?.user_interests?.find(
                    (t: any) => t._id === tid
                  );
                  return (
                    <div
                      key={tid}
                      className=" mt-1 border-l border-zinc-300 pl-4 text-sm"
                    >
                      <div className="font-semibold ">{topic?.name}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </CollapsibleContent>
          {showTopicsModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-background/50">
              <div className="bg-card p-4 rounded space-y-2 w-[300px]">
                <div className="flex justify-between items-center">
                  <h2 className="">Create Custom Topic Feed</h2>
                  <Button
                    onClick={() => setShowTopicsModal(false)}
                    className="text-white"
                  >
                    X
                  </Button>
                </div>
                <input
                  type="text"
                  value={topicFeedName}
                  onChange={(e) => setTopicFeedName(e.target.value)}
                  className="w-full p-2 rounded-lg   bg-background mb-2"
                  placeholder="Topic Feed Name"
                />
                <p className="">Select Topics:</p>
                {myTopics?.user_interests?.map((topic: any) => (
                  <label key={topic._id} className="flex items-center gap-2 ">
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic._id)}
                      onChange={() => handleTopicSelectChange(topic._id)}
                    />
                    {topic.name}
                  </label>
                ))}
                <Button
                  onClick={handleCloseTopicsModal}
                  className="mt-2  px-3 py-1 rounded text-white"
                >
                  Create
                </Button>
              </div>
            </div>
          )}
        </Collapsible>

        {/* {myTopics?.user_interests && (
          <div className="mt-4 p-4 bg-zinc-800 rounded-lg text-zinc-300 shadow-lg">

            {myTopics.user_interests.map((topic) => (
              <div
                key={topic._id}
                className="mt-2 border-l-4 border-zinc-700 pl-4 text-sm transition-all duration-200 hover:pl-6 hover:text-white"
              >
                <span className="font-medium">{topic.name}</span>
              </div>
            ))}
          </div>
        )} */}
      </div>

      <div className="bg-card rounded-xl p-4 space-y-2">
        <Collapsible
          open={openSections.communities}
          onOpenChange={() => toggleSection("communities")}
          className="space-y-2  py-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium border-b border-zinc-300 py-2 ">
            My Communities
            {openSections.communities ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 max-h-[330px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-900 overflow-auto scrollbar-none cursor-pointer">
            {myCommunities
              ?.filter((community: any) => community !== null)
              .map((community: any) => (
                <button
                  key={community?._id}
                  onClick={() => handleCommunityClick(community)}
                  className="w-full flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-background"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={community?.avatarURL} />
                    <AvatarFallback>{community?.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{community?.name}</span>
                </button>
              ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </aside>
  );
}
