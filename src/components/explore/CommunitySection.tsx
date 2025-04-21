"use client";

import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MemoizedCommunityCard from "./MemoizedCommunityCard";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setCommunityData } from "@/redux/communitySlice";
import Loader from "../Loader";
import { setActiveCommunity } from "@/redux/channelSlice";

interface Community {
  _id: string;
  user_id: string;
  name: string;
  description: string;
  imageUrl?: string;
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
    // Clear communities immediately when category changes
    setCommunities([]);
    setLoading(true);
    
    const fetchCommunities = async () => {
      try {
        let response;
        let limits = 100;
        if (activeCategory === "all") {
          response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/all?limit=${limits}`
          );
        } else {
          response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/look`,
            { categoryId: activeCategory }
          );
        }

        if (
          response &&
          response.data &&
          response.data.r === "s" &&
          Array.isArray(response.data.data)
        ) {
          setCommunities(response.data.data);
        } else {
          console.error("Invalid response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching communities", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeCategory) {
      fetchCommunities();
    }
  }, [activeCategory]);

  const handleClickCommunity = useCallback(
    (community: Community) => {
      if (!community || !community._id) {
        console.error("Invalid community data:", community);
        return;
      }

      setClickLoading(true);

      dispatch(
        setCommunityData({
          communityId: community._id,
          userId: community.user_id,
        })
      );

      dispatch(
        setActiveCommunity({
          id: community._id,
          name: community.name,
          image: "",
          background_image: "",
          user_isBankDetailsAdded: false,
          user_iscalendarConnected: false
        })
      );

      router.push(`/community/${community._id}/profile`);
    },
    [dispatch, router]
  );

  return (
    <div className="bg-white min-h-screen">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader />
        </div>
      ) : (
        <div id="card-container-top" className="grid gap-3 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-6 z-0 lg:pb-0 pt-4 sm:pt-10">
          {communities.length > 0 ? (
            communities.map((community, index) => (
              <div key={community._id} className={index === 0 ? "first-expert-card" : ""}>
                <MemoizedCommunityCard
                  community={community}
                  onClick={() => handleClickCommunity(community)}
                />
              </div>
            ))
          ) : (
            <p className="text-center col-span-3 py-8 text-muted-foreground">
              No communities found for this category
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(CommunitySection);
