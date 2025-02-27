"use client";

import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MemoizedCommunityCard from "./MemoizedCommunityCard";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setCommunityData } from "@/redux/communitySlice";
import { setActiveCommunity } from "@/redux/channelSlice";
import Loader from "../Loader"; 

interface Community {
  _id: string;
  user_id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface CommunitySectionProps {
  activeCategory: string;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({
  activeCategory,
}) => {
  const loggedInUserId = useSelector(
    (state: RootState) => state.user.user?._id
  );
  const dispatch = useDispatch();
  const router = useRouter();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [clickLoading, setClickLoading] = useState(false); 

  useEffect(() => {
    const fetchTopCommunity = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/look`,
          { categoryId: activeCategory }
        );
        setCommunities(response.data.data);
      } catch (error) {
        console.error("Error fetching communities", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (activeCategory) {
      fetchTopCommunity();
    }
  }, [activeCategory]);

  // Handle Community Click
  const handleClickCommunity = useCallback(
    (community: Community) => {
      if (!community || !community._id) {
        console.error("Invalid community data:", community);
        return;
      }

      console.log("Clicked community:", community);
      setClickLoading(true); // Show loader on click

      dispatch(
        setCommunityData({
          communityId: community._id,
          userId: community.user_id,
        })
      );

      router.push("/community/profile");
    },
    [dispatch, router]
  );

  return (
    <div className="bg-background min-h-screen lg:p-4">
      {loading ? ( // Show loader while fetching communities
        <Loader />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-8 lg:pb-0">
          {communities.length > 0 ? (
            communities.map((community) => (
              <MemoizedCommunityCard
                key={community._id}
                community={community}
                onClick={() => handleClickCommunity(community)}
              />
            ))
          ) : (
            <div className="text-center text-gray-400">No community found</div>
          )}
        </div>
      )}
      {clickLoading && <p className="text-center mt-4">Loading...</p>}{" "}
      {/* Loader when clicking */}
    </div>
  );
};

export default React.memo(CommunitySection);
