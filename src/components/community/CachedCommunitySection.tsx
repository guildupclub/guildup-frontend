"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setCommunityData } from "@/redux/communitySlice";
import { setActiveCommunity } from "@/redux/channelSlice";
import MemoizedCommunityCard from "@/components/explore/MemoizedCommunityCard";

interface CachedCommunitySectionProps {
  communities: any[];
  loading?: boolean;
}

const CachedCommunitySection: React.FC<CachedCommunitySectionProps> = ({
  communities,
  loading = false,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleClickCommunity = useCallback(
    (community: any) => {
      if (!community || !community._id) {
        console.error("Invalid community data:", community);
        return;
      }

      const cleanedCommunityName = community.name
        .replace(/\s+/g, "-")
        .replace(/\|/g, "-")
        .replace(/-+/g, "-");
      const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
      const communityParams = `${encodedCommunityName}-${community._id}`;

      router.push(`/community/${communityParams}/profile`);

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
          user_iscalendarConnected: false,
        })
      );
    },
    [dispatch, router]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No communities found</div>
        <p className="text-gray-400">Try selecting a different category or check back later.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* Communities grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {communities.map((item, index) => {
            const community = item.community || item;
            return (
              <div key={community._id || index} onClick={() => handleClickCommunity(community)}>
                <MemoizedCommunityCard
                  community={community}
                  onClick={() => handleClickCommunity(community)}
                />
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default CachedCommunitySection;
