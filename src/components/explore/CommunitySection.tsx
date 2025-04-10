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
  community: any;
  offerings: any;
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
  activeCategory
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
    const fetchCommunities = async () => {
      setLoading(true);
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
    (communityWrapper: { community: Community }) => {
      const community = communityWrapper.community;

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
    <div className="bg-transparent min-h-screen py-4">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {communities.length > 0 ? (
            communities.map((communityWrapper) => (
              <MemoizedCommunityCard
                key={communityWrapper._id}
                community={communityWrapper}
                onClick={() => handleClickCommunity(communityWrapper)}
              />
            ))
          ) : (
            <p className="text-center col-span-full py-8 text-muted-foreground">
              No communities found
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(CommunitySection);
