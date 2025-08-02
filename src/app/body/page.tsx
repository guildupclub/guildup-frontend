'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setCommunityData } from "@/redux/communitySlice";
import { setActiveCommunity } from "@/redux/channelSlice";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowDown, Dumbbell, Sparkles, Users } from "lucide-react";
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
  min_offering_id?: string;
}

// Body-related category IDs
const BODY_CATEGORY_IDS = [
  "67cab1fb9b3cd869f1d3ee95",
  "67cab21f9b3cd869f1d3ee96"
];

export default function BodyPage() {
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

  const fetchBodyCommunities = useCallback(async (pageNum: number, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCommunities([]);
      }

      // Use the new filter API to get body-related communities
      const filterPayload = {
        categoryIds: BODY_CATEGORY_IDS,
        priceRange: {
          min: 0,
          max: 300
        },
        offeringTypes: ["discovery-call", "consultation"]
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/filter-by-offerings`,
        filterPayload
      );

      if (
        response &&
        response.data &&
        response.data.r === "s" &&
        Array.isArray(response.data.data)
      ) {
        // Transform the response data to match our Community interface
        const transformedCommunities = response.data.data.map((community: any) => ({
          _id: community._id,
          user_id: community.user_id,
          name: community.name,
          description: community.description,
          image: community.image,
          owner_experience: community.owner_experience || 0,
          owner_sessions: community.owner_sessions || 0,
          num_member: community.num_member || 0,
          linkedin_followers: community.linkedin_followers || 0,
          instagram_followers: community.instagram_followers || 0,
          youtube_followers: community.youtube_followers || 0,
          tags: community.tags || [],
          min_offering_id: community.min_offering_id
        }));

        if (isLoadMore) {
          setCommunities(prev => [...prev, ...transformedCommunities]);
        } else {
          setCommunities(transformedCommunities);
        }
        
        setHasMore(transformedCommunities.length === COMMUNITIES_PER_PAGE);
        setTotalCount(response.data.meta?.totalCommunities || transformedCommunities.length);
      }
    } catch (error) {
      console.error("Error fetching body communities:", error);
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
    fetchBodyCommunities(0, false);
  }, [fetchBodyCommunities]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBodyCommunities(nextPage, true);
    }
  }, [page, loadingMore, hasMore, fetchBodyCommunities]);

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Free Discovery Call Banner - Top */}
      <div className="hidden md:block sticky top-16 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-b-4 border-green-300 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/25 rounded-full backdrop-blur-sm animate-pulse">
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-xl">💡 Your First 3 Expert Sessions Are FREE</h3>
                <p className="text-green-100 text-xs sm:text-sm hidden sm:block">✨ Experience personalized guidance from India&apos;s top verified experts, completely free for your first 3 sessions! 🧘‍♀️💪🧠</p>
                <p className="text-green-100 text-xs sm:hidden">✨ Experience personalized guidance from India&apos;s top verified experts, completely free for your first 3 sessions! 🧘‍♀️💪🧠</p>
              </div>
            </div>
                         <Button 
               className="bg-white text-green-700 hover:bg-green-50 font-bold px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs sm:text-base whitespace-nowrap flex-shrink-0"
               onClick={() => {
                 const communitiesSection = document.getElementById('communities-section');
                 if (communitiesSection) {
                   communitiesSection.scrollIntoView({ behavior: 'smooth' });
                 }
               }}
             >
               🎯 Book Free Session
             </Button>
          </div>
        </div>
      </div>

                    {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-mint-50 via-emerald-50 to-blue-50 text-black">
          {/* Floating background icons */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 opacity-[0.05] animate-float">
              <Dumbbell className="h-16 w-16 text-gray-600" />
            </div>
            <div className="absolute top-32 right-16 opacity-[0.05] animate-float-delay">
              <div className="w-12 h-12 rounded-full bg-green-200"></div>
            </div>
            <div className="absolute bottom-32 left-20 opacity-[0.05] animate-float-delay-2">
              <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
            </div>
            <div className="absolute top-48 left-1/3 opacity-[0.05] animate-float">
              <div className="w-10 h-10 bg-teal-200 rounded-lg"></div>
            </div>
          </div>
          
         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
           <div className="text-center">
             <div className="flex justify-center mb-8">
               <div className="p-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full backdrop-blur-sm shadow-lg">
                 <Dumbbell className="h-10 w-10 text-white" />
               </div>
             </div>
                          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-gray-900 leading-tight">
                💪 Lose Weight, Gain Energy & Transform Your Body
              </h1>
                           <p className="text-xl sm:text-2xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
                 Work 1:1 with trusted fitness coaches, yoga instructors & nutrition experts<br />
                 to achieve your health and fitness goals.
               </p>
             <div className="flex flex-wrap justify-center gap-3 mb-10">
               <span className="px-6 py-3 bg-green-100 text-green-700 rounded-full border border-green-200 hover:bg-green-200 hover:scale-105 transition-all duration-200 font-medium text-sm">
                 Weight Loss
               </span>
               <span className="px-6 py-3 bg-blue-100 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-200 hover:scale-105 transition-all duration-200 font-medium text-sm">
                 Strength Training
               </span>
               <span className="px-6 py-3 bg-purple-100 text-purple-700 rounded-full border border-purple-200 hover:bg-purple-200 hover:scale-105 transition-all duration-200 font-medium text-sm">
                 Nutrition
               </span>
               <span className="px-6 py-3 bg-pink-100 text-pink-700 rounded-full border border-pink-200 hover:bg-pink-200 hover:scale-105 transition-all duration-200 font-medium text-sm">
                 Fitness Goals
               </span>
               <span className="px-6 py-3 bg-orange-100 text-orange-700 rounded-full border border-orange-200 hover:bg-orange-200 hover:scale-105 transition-all duration-200 font-medium text-sm">
                 PCOS & Hormonal Health
               </span>
             </div>
             
             {/* CTA Button */}
             <div className="flex justify-center">
               <button 
                 className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-full hover:from-green-500 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                 onClick={() => {
                   const communitiesSection = document.getElementById('communities-section');
                   if (communitiesSection) {
                     communitiesSection.scrollIntoView({ behavior: 'smooth' });
                   }
                 }}
               >
                 🎯 Book Free Session
                </button>
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
                   <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full mb-6">
                     <Users className="h-16 w-16 text-green-500" />
                   </div>
                                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No fitness communities found
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      We&apos;re working on bringing you the best fitness and nutrition communities. Check back soon!
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
                   className="group relative overflow-hidden border-green-200 hover:border-green-400 bg-white hover:bg-green-50 transition-all duration-300"
                 >
                   {loadingMore ? (
                     <>
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500 mr-2"></div>
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
                             <div className="text-center py-4 text-sm text-sm text-gray-600">
                 Showing {communities.length} of {totalCount} Body & Fitness Communities
                {!hasMore && communities.length < totalCount && (
                  <span className="block mt-1">
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setPage(0);
                        setHasMore(true);
                        setTotalCount(0);
                        fetchBodyCommunities(0, false);
                      }}
                                             className="text-green-500 hover:text-green-700"
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