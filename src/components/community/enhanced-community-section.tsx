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
import { ArrowDown, Users, SlidersHorizontal } from "lucide-react";
import { OfferingFilters } from "@/components/filter/offering-filters";
import { useOfferingFilters } from "@/hooks/use-offering-filters";

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
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const COMMUNITIES_PER_PAGE = 12;

  // Use the filtering hook
  const { filters, setFilters, clearFilters, filteredAndSortedCommunities } =
    useOfferingFilters(communities);

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

        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

        let response;
        if (activeCategory === "all") {
          const url = `${apiUrl}/v1/community/all?page=${pageNum}&limit=${COMMUNITIES_PER_PAGE}`;
          response = await axios.get(url);
        } else {
          const url = `${apiUrl}/v1/community/look`;
          const payload = {
            categoryId: activeCategory,
            page: pageNum,
            limit: COMMUNITIES_PER_PAGE,
          };
          response = await axios.post(url, payload);
        }
        // Check if response has data
        if (!response || !response.data) {
          console.error("❌ No response data received");
          setHasMore(false);
          return;
        }

        // Handle different response formats
        if (response.data.r === "s" && Array.isArray(response.data.data)) {
          const newCommunities = response.data.data;
          const meta = response.data.meta;

          if (isLoadMore) {
            setCommunities((prev) => [...prev, ...newCommunities]);
          } else {
            setCommunities(newCommunities);
          }

          if (meta) {
            setTotalCount(meta.total || 0);
            setHasMore(
              newCommunities.length === COMMUNITIES_PER_PAGE &&
                (pageNum + 1) * COMMUNITIES_PER_PAGE < (meta.total || 0)
            );
          } else {
            setHasMore(newCommunities.length === COMMUNITIES_PER_PAGE);
          }
        } else if (response.data.r === "e") {
          // Error response from backend
          setHasMore(false);
        } else if (Array.isArray(response.data)) {
          // Direct array response (some APIs might return this)
          const newCommunities = response.data;
          if (isLoadMore) {
            setCommunities((prev) => [...prev, ...newCommunities]);
          } else {
            setCommunities(newCommunities);
          }
          setHasMore(newCommunities.length === COMMUNITIES_PER_PAGE);
        } else if (Array.isArray(response.data.data)) {
          // Data array without 'r' field
          const newCommunities = response.data.data;
          if (isLoadMore) {
            setCommunities((prev) => [...prev, ...newCommunities]);
          } else {
            setCommunities(newCommunities);
          }
          setHasMore(newCommunities.length === COMMUNITIES_PER_PAGE);
        } else {
          const errorMsg = "Invalid response format from API";
          setError(errorMsg);
          setHasMore(false);
        }
      } catch (error: any) {
        let errorMessage = "Failed to load communities";
        
        if (error.response) {
          console.error("📛 Response error details:", {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          });
          errorMessage = `API Error: ${error.response.status} ${error.response.statusText || ""}`;
          if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          console.error("📛 No response received:", {
            message: error.message,
            url: error.config?.url,
          });
          errorMessage = "No response from server. Please check your connection.";
        } else {
          console.error("📛 Request setup error:", error.message);
          errorMessage = `Request error: ${error.message}`;
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filters & Sort</span>
                  </div>
                </Button>
              </div>

              {/* Filter Component */}
              <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
                <OfferingFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearFilters={clearFilters}
                  className="bg-white border rounded-lg p-4"
                />
              </div>
            </div>
          </div>

          {/* Communities Grid */}
          <div className="lg:col-span-3">
            {/* Results Summary */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                {/* <h2 className="text-xl font-semibold">
                  {filteredAndSortedCommunities.length} Expert
                  {filteredAndSortedCommunities.length !== 1 ? "s" : ""} Found
                </h2> */}
                <p className="text-sm text-muted-foreground">
                  {totalCount > 0 &&
                    `Showing ${filteredAndSortedCommunities.length} of ${totalCount} total experts`}
                </p>
              </div>
            </div>

            {/* Communities Grid */}
            <div
              id="card-container-top"
              className="grid gap-6 grid-cols-1 md:grid-cols-2 pb-6"
            >
              {filteredAndSortedCommunities.length > 0 ? (
                filteredAndSortedCommunities.map((community, index) => (
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
                    Try adjusting your filters or selecting a different category
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {communities.length > 0 &&
              hasMore &&
              filteredAndSortedCommunities.length > 0 && (
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
        </div>
      )}
    </div>
  );
};

export default EnhancedCommunitySection;
