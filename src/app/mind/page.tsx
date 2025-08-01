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
      {/* Free Discovery Call Banner - Top */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border-b-4 border-indigo-400 mt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/25 rounded-full backdrop-blur-sm animate-pulse">
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-xl">🧠 Free Discovery Call!</h3>
                <p className="text-purple-100 text-xs sm:text-base hidden sm:block">Book a 15-minute consultation with wellness experts</p>
                <p className="text-purple-100 text-xs sm:hidden">15-min consultation with wellness experts</p>
              </div>
            </div>
                         <Button 
               className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-4 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-lg whitespace-nowrap"
               onClick={() => {
                 const communitiesSection = document.getElementById('communities-section');
                 if (communitiesSection) {
                   communitiesSection.scrollIntoView({ behavior: 'smooth' });
                 }
               }}
             >
               📞 Book Free Call
             </Button>
          </div>
        </div>
      </div>

                           {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 text-black">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating Particles */}
            <div className="absolute top-20 left-10 w-2 h-2 bg-indigo-300 rounded-full animate-pulse opacity-60"></div>
            <div className="absolute top-32 right-20 w-3 h-3 bg-purple-300 rounded-full animate-bounce opacity-40"></div>
            <div className="absolute top-40 left-1/4 w-1 h-1 bg-pink-300 rounded-full animate-ping opacity-70"></div>
            <div className="absolute top-60 right-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-pulse opacity-50"></div>
            <div className="absolute top-80 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-60"></div>
            
            
            
            {/* Floating Brain Icons */}
            <div className="absolute top-1/4 left-5 animate-float-slow opacity-30">
              <Brain className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="absolute top-1/3 right-8 animate-float-slower opacity-40">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div className="absolute top-2/3 left-8 animate-float-slow opacity-35">
              <Brain className="w-5 h-5 text-pink-400" />
            </div>
            
            {/* Geometric Shapes */}
            <div className="absolute top-1/2 right-1/4 w-6 h-6 border-2 border-indigo-300 rounded-lg animate-spin-slow opacity-30"></div>
            <div className="absolute top-3/4 left-1/4 w-4 h-4 bg-purple-300 rounded-full animate-pulse opacity-40"></div>
            <div className="absolute top-1/4 right-1/3 w-3 h-3 border border-pink-300 transform rotate-45 animate-pulse opacity-50"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-white/80 rounded-full backdrop-blur-sm shadow-lg animate-pulse">
                  <Brain className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
                           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 animate-fade-in">
                 Mind & Wellness
               </h1>
               <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in-delay">
                 Discover communities focused on mental health, personal growth, and inner transformation
               </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm animate-fade-in-delay-2">
                               <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full backdrop-blur-sm flex items-center gap-2 border border-indigo-200 hover:scale-105 transition-transform duration-300">
                   <Sparkles className="h-4 w-4 animate-pulse" />
                   Mental Health
                 </span>
                 <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full backdrop-blur-sm flex items-center gap-2 border border-purple-200 hover:scale-105 transition-transform duration-300">
                   <Sparkles className="h-4 w-4 animate-pulse" />
                   Life Coaching
                 </span>
                 <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full backdrop-blur-sm flex items-center gap-2 border border-pink-200 hover:scale-105 transition-transform duration-300">
                   <Sparkles className="h-4 w-4 animate-pulse" />
                   Personal Growth
                 </span>
              </div>
            </div>
          </div>
        </div>

             {/* Communities Section */}
       <div id="communities-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader />
          </div>
        ) : (
          <>
            {/* Communities Grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 pb-6">
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
                     We&apos;re working on bringing you the best mental health and wellness communities. Check back soon!
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