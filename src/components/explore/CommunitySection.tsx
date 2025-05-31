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
import { Button } from "../ui/button";
import { ArrowDown, Users } from "lucide-react";

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const COMMUNITIES_PER_PAGE = 12;

  const fetchCommunities = useCallback(async (pageNum: number, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCommunities([]); // Clear communities when changing category
      }

      let response;
      if (activeCategory === "all") {
        response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/all?page=${pageNum}&limit=${COMMUNITIES_PER_PAGE}`
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/look`,
          { 
            categoryId: activeCategory,
            page: pageNum,
            limit: COMMUNITIES_PER_PAGE 
          }
        );
      }

      if (
        response &&
        response.data &&
        response.data.r === "s" &&
        Array.isArray(response.data.data)
      ) {
        const newCommunities = response.data.data;
        const meta = response.data.meta;
        
        if (isLoadMore) {
          setCommunities(prev => [...prev, ...newCommunities]);
        } else {
          setCommunities(newCommunities);
        }
        
        // Update pagination state
        if (meta) {
          setTotalCount(meta.total || 0);
          setHasMore(newCommunities.length === COMMUNITIES_PER_PAGE && (pageNum + 1) * COMMUNITIES_PER_PAGE < (meta.total || 0));
        } else {
          // Fallback for endpoints that don't return meta
          setHasMore(newCommunities.length === COMMUNITIES_PER_PAGE);
        }
      } else {
        console.error("Invalid response format:", response.data);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching communities", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCategory]);

  // Reset and fetch first page when category changes
  useEffect(() => {
    if (activeCategory) {
      setPage(0);
      setHasMore(true);
      fetchCommunities(0, false);
    }
  }, [activeCategory, fetchCommunities]);

  // Load more communities
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCommunities(nextPage, true);
    }
  }, [page, loadingMore, hasMore, fetchCommunities]);

  const handleClickCommunity = useCallback(
    (community: Community) => {
      if (!community || !community._id) {
        console.error("Invalid community data:", community);
        return;
      }

      // Create URL-friendly community name
      const cleanedCommunityName = community.name
        .replace(/\s+/g, "-")
        .replace(/\|/g, "-")
        .replace(/-+/g, "-");
      const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
      const communityParams = `${encodedCommunityName}-${community._id}`;

      // Navigate immediately first
      router.push(`/community/${communityParams}/profile`);
      
      // Then update Redux state
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
        <>
          {/* Communities Grid */}
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
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-500 mb-2">
                  No communities found
                </p>
                <p className="text-sm text-gray-400">
                  Try selecting a different category or check back later
                </p>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {communities.length > 0 && hasMore && (
            <div className="flex justify-center py-8">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                variant="outline"
                size="lg"
                className="group relative overflow-hidden border-primary/20 hover:border-primary/40 transition-all duration-300"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Loading more...
                  </>
                ) : (
                  <>
                    <span className="mr-2">Load More Experts</span>
                    <ArrowDown className="h-4 w-4 group-hover:translate-y-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Results Summary */}
          {totalCount > 0 && (
            <div className="text-center py-4 text-sm text-gray-500">
              Showing {communities.length} of {totalCount} Experts
              {!hasMore && communities.length < totalCount && (
                <span className="block mt-1">
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setPage(0);
                      setHasMore(true);
                      fetchCommunities(0, false);
                    }}
                    className="text-primary hover:text-primary/80"
                  >
                    Reset to see all results
                  </Button>
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommunitySection;
