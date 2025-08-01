'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setCommunityData } from "@/redux/communitySlice";
import { setActiveCommunity } from "@/redux/channelSlice";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowDown, Brain, Sparkles, Users } from "lucide-react";
import MemoizedCommunityCard from "@/components/explore/MemoizedCommunityCard";
import Loader from "@/components/Loader";

interface Community {
  _id: string;
  user_id: string;
  name: string;
  description: string;
  image?: string;
  owner_experience?: number;
  owner_sessions?: number;
  num_member?: number;
  linkedin_followers?: number;
  instagram_followers?: number;
  youtube_followers?: number;
  tags?: string[];
}

// Mind-related search terms for filtering communities
const MIND_KEYWORDS = [
  'mental', 'health', 'wellness', 'coaching', 'therapy', 
  'mindfulness', 'meditation', 'psychology', 'life', 'personal', 
  'growth', 'mind', 'brain', 'emotional', 'stress', 'anxiety',
  'depression', 'counseling', 'therapist', 'psychologist'
];

export default function MindPage() {
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

  const fetchMindCommunities = useCallback(async (pageNum: number, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCommunities([]);
      }

      // Fetch all communities and then filter for mind-related ones
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/all?page=${pageNum}&limit=${COMMUNITIES_PER_PAGE * 3}` // Get more results to filter from
        );

        if (
          response &&
          response.data &&
          response.data.r === "s" &&
          Array.isArray(response.data.data)
        ) {
                      // Extract community data from the response format
            const communitiesFromResponse = response.data.data.map((item: any) => {
              if (item.community) {
                return {
                  _id: item.community._id,
                  user_id: item.community.user_id?._id || item.community.user_id,
                  name: item.community.name,
                  description: item.community.description,
                  image: item.community.image,
                  // Add other fields that might be needed
                  owner_experience: item.community.owner_experience,
                  owner_sessions: item.community.owner_sessions,
                  num_member: item.community.num_member,
                  linkedin_followers: item.community.linkedin_followers,
                  instagram_followers: item.community.instagram_followers,
                  youtube_followers: item.community.youtube_followers,
                  tags: item.community.tags,
                };
              }
              // If the item is directly a community (not wrapped in community property)
              return {
                _id: item._id,
                user_id: item.user_id?._id || item.user_id,
                name: item.name,
                description: item.description,
                image: item.image,
                owner_experience: item.owner_experience,
                owner_sessions: item.owner_sessions,
                num_member: item.num_member,
                linkedin_followers: item.linkedin_followers,
                instagram_followers: item.instagram_followers,
                youtube_followers: item.youtube_followers,
                tags: item.tags || item.additional_tags,
              };
            });

          // Filter communities to only include mind-related ones
          const mindRelatedCommunities = communitiesFromResponse.filter((community: any) => {
            const name = community.name?.toLowerCase() || '';
            const description = community.description?.toLowerCase() || '';
            const tags = community.tags?.join(' ').toLowerCase() || '';
            
            const text = `${name} ${description} ${tags}`;
            return MIND_KEYWORDS.some(keyword => text.includes(keyword));
          });

          if (isLoadMore) {
            setCommunities(prev => [...prev, ...mindRelatedCommunities]);
          } else {
            setCommunities(mindRelatedCommunities);
          }
          
          setHasMore(mindRelatedCommunities.length === COMMUNITIES_PER_PAGE);
          setTotalCount(prev => prev + mindRelatedCommunities.length);
        }
      } catch (error) {
        console.error("Error fetching mind communities:", error);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching mind communities", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setTotalCount(0);
    fetchMindCommunities(0, false);
  }, [fetchMindCommunities]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMindCommunities(nextPage, true);
    }
  }, [page, loadingMore, hasMore, fetchMindCommunities]);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
                         <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
               Mind & Wellness
             </h1>
             <p className="text-xl sm:text-2xl text-purple-100 max-w-3xl mx-auto mb-8 leading-relaxed">
               Discover communities focused on mental health, personal growth, and inner transformation
             </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
                             <span className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm flex items-center gap-2">
                 <Sparkles className="h-4 w-4" />
                 Mental Health
               </span>
               <span className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm flex items-center gap-2">
                 <Sparkles className="h-4 w-4" />
                 Life Coaching
               </span>
               <span className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm flex items-center gap-2">
                 <Sparkles className="h-4 w-4" />
                 Personal Growth
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Communities Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader />
          </div>
        ) : (
          <>
            {/* Communities Grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-6">
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
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full mb-6">
                    <Users className="h-16 w-16 text-indigo-600" />
                  </div>
                                     <h3 className="text-xl font-semibold text-gray-900 mb-2">
                     No mind-focused communities found
                   </h3>
                   <p className="text-gray-600 max-w-md">
                     We're working on bringing you the best mental health and wellness communities. Check back soon!
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
                  className="group relative overflow-hidden border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50 transition-all duration-300"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                      Loading more...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">Load More Communities</span>
                      <ArrowDown className="h-4 w-4 group-hover:translate-y-1 transition-transform duration-300" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Results Summary */}
            {totalCount > 0 && (
                             <div className="text-center py-4 text-sm text-gray-600">
                 Showing {communities.length} of {totalCount} Mind & Wellness Communities
                {!hasMore && communities.length < totalCount && (
                  <span className="block mt-1">
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setPage(0);
                        setHasMore(true);
                        setTotalCount(0);
                        fetchMindCommunities(0, false);
                      }}
                      className="text-indigo-600 hover:text-indigo-800"
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
    </div>
  );
} 