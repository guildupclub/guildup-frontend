"use client";

import axios from "axios";
import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MemoizedCommunityCard from "@/components/explore/MemoizedCommunityCard";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setCommunityData } from "@/redux/communitySlice";
import Loader from "../Loader";
import { setActiveCommunity } from "@/redux/channelSlice";
import { Button } from "../ui/button";
import { ArrowDown, Users } from "lucide-react";
import { fetchFromJSON, fetchUserCommunities } from "@/lib/services/communities";

interface Community {
  _id: string;
  user_id: string;
  name: string;
  description: string;
  imageUrl?: string;
  community: any;
  offerings: any[];
}

interface EnhancedCommunitySectionProps {
  activeCategory: string;
}

const EnhancedCommunitySection: React.FC<EnhancedCommunitySectionProps> = ({
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
  const [error, setError] = useState<string | null>(null);

  const COMMUNITIES_PER_PAGE = 12;

  const fetchCommunities = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setCommunities([]);
          setError(null); // Clear previous errors
        }

        // Always fetch from JSON
        console.log("📦 [Enhanced Community Section] Fetching communities from JSON");
        const communities = await fetchFromJSON();
        
        if (!communities || communities.length === 0) {
          console.warn("⚠️ [Enhanced Community Section] No communities found in JSON");
          setHasMore(false);
          setCommunities([]);
          return;
        }

        if (!Array.isArray(communities)) {
          console.error("❌ [Enhanced Community Section] Invalid response format:", typeof communities);
          setError("Invalid response format from JSON");
          setHasMore(false);
          return;
        }

        // Map communities from service to component's Community interface
        const newCommunities: Community[] = communities.map((comm: any) => ({
          _id: comm._id || "",
          user_id: comm.user_id || comm._id || "", // Use _id as fallback for user_id
          name: comm.name || "",
          description: comm.description || "",
          imageUrl: comm.image || comm.imageUrl || comm.background_image || "",
          community: comm.community || comm, // Wrap the entire community object
          offerings: comm.offerings || [], // Empty array if not present
        })).filter((comm: Community) => comm._id && comm.name); // Filter out invalid communities

        console.log("✅ [Enhanced Community Section] Loaded", newCommunities.length, "communities from JSON");
        
        if (isLoadMore) {
          setCommunities((prev: Community[]) => [...prev, ...newCommunities]);
        } else {
          setCommunities(newCommunities);
          setTotalCount(newCommunities.length);
        }
        
        // Check if there are more communities to load (simple check for now)
        setHasMore(newCommunities.length >= COMMUNITIES_PER_PAGE);
      } catch (error: any) {
        console.error("❌ [Enhanced Community Section] Error fetching communities:", error);
        let errorMessage = "Failed to load communities from JSON";
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeCategory]
  );

  useEffect(() => {
    if (activeCategory) {
      setPage(0);
      setHasMore(true);
      fetchCommunities(0, false);
    }
  }, [activeCategory, fetchCommunities]);

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

  return (
    <div className="bg-white min-h-screen">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-red-50 rounded-full mb-4">
            <Users className="h-16 w-16 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Communities
          </h3>
          <p className="text-sm text-gray-600 mb-4 max-w-md">
            {error}
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setError(null);
              fetchCommunities(0, false);
            }}
          >
            Try Again
          </Button>
          <div className="mt-4 text-xs text-gray-400">
            <p>API URL: {process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "Not configured"}</p>
            <p>Category: {activeCategory}</p>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {/* Results Summary */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {totalCount > 0 &&
                  `Showing ${communities.length} of ${totalCount} total experts`}
              </p>
            </div>
          </div>

          {/* Communities Grid */}
          <div
            id="card-container-top"
            className="grid gap-6 grid-cols-1 md:grid-cols-2 pb-6"
          >
            {communities.length > 0 ? (
              communities.map((community, index) => (
                <div
                  key={community._id}
                  className={index === 0 ? "first-expert-card" : ""}
                >
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
                  No experts found
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Try selecting a different category
                </p>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {communities.length > 0 &&
            hasMore && (
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
        </div>
      )}
    </div>
  );
};

export default EnhancedCommunitySection;



