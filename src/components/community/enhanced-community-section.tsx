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
              limit: COMMUNITIES_PER_PAGE,
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
