'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setCommunityData } from "@/redux/communitySlice";
import { setActiveCommunity } from "@/redux/channelSlice";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowDown, Heart, Sparkles, Users, Dumbbell, Target } from "lucide-react";
import MemoizedCommunityCard from "@/components/explore/MemoizedCommunityCard";
import Loader from "@/components/Loader";
import LandingPageOnboarding from "@/components/onboarding/LandingPageOnboarding";
import { useLandingPageOnboarding } from "@/hooks/useLandingPageOnboarding";

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

// Body-related category IDs (fitness, nutrition, etc.)
const BODY_CATEGORY_IDS = [
  "67cab2669b3cd869f1d3ee98", // Replace with actual body/fitness category IDs
  "67cab2809b3cd869f1d3ee99",
  "67cab23e9b3cd869f1d3ee97"
];

export default function BodyPage() {
  const loggedInUserId = useSelector(
    (state: RootState) => state.user.user?._id
  );
  const dispatch = useDispatch();
  const router = useRouter();

  // Onboarding popup hook
  const {
    isOpen: isOnboardingOpen,
    handleClose: handleOnboardingClose,
    handleComplete: handleOnboardingComplete,
    triggerOnboarding
  } = useLandingPageOnboarding({
    variant: 'body',
    delay: 2500, // 2.5 seconds
    onComplete: (data) => {
      console.log('Onboarding completed:', data);
      // You can add additional logic here like redirecting to signup
    }
  });

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
          min_offering_id: community.min_offering_id,
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
    <div className="min-h-screen">
      {/* Onboarding Popup */}
      <LandingPageOnboarding
        isOpen={isOnboardingOpen}
        onClose={handleOnboardingClose}
        variant="body"
        onComplete={handleOnboardingComplete}
      />

      {/* Free Discovery Call Banner - Top */}
      <div className="hidden md:block sticky top-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg border-b-4 border-green-400 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/25 rounded-full backdrop-blur-sm animate-pulse">
                <Dumbbell className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-xl">💪 Your First 3 Fitness Sessions Are FREE</h3>
                <p className="text-green-100 text-xs sm:text-sm hidden sm:block">✨ Experience personalized fitness guidance from India&apos;s top verified trainers, completely free for your first 3 sessions! 🏋️‍♀️💪🥗</p>
                <p className="text-green-100 text-xs sm:hidden">✨ Experience personalized fitness guidance from India&apos;s top verified trainers, completely free for your first 3 sessions! 🏋️‍♀️💪🥗</p>
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
      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-black">
        {/* Floating background icons */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-8 opacity-[0.05] animate-float">
            <Heart className="h-12 w-12 text-gray-600" />
          </div>
          <div className="absolute top-20 right-12 opacity-[0.05] animate-float-delay">
            <Dumbbell className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full backdrop-blur-sm shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-gray-900 leading-tight animate-fade-in">
              💪 Transform Your Body & Fitness Today
            </h1>
            
            <p className="text-sm sm:text-base text-gray-700 max-w-xl mx-auto mb-4 leading-relaxed animate-fade-in-delay">
              Work 1:1 with verified fitness trainers, nutritionists & wellness experts — normally ₹1,000+ per session, free for a limited time.
            </p>

            {/* 3-Step Visual Funnel */}
            <div className="flex justify-center items-center gap-2 mb-4 animate-fade-in-delay-2">
              {/* Step 1 */}
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">1</div>
                <span className="text-xs font-medium text-gray-800">Pick expert</span>
              </div>

              {/* Arrow */}
              <div className="text-green-500 font-bold text-sm">→</div>

              {/* Step 2 */}
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
                <span className="text-xs font-medium text-gray-800">Apply GUILD100</span>
              </div>

              {/* Arrow */}
              <div className="text-emerald-500 font-bold text-sm">→</div>

              {/* Step 3 */}
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
                <span className="text-xs font-medium text-gray-800">Book FREE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ready to Transform CTA Section */}
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Transform Your Body?</h2>
          <p className="text-gray-700 mb-6">Join thousands who&apos;ve already experienced the power of expert fitness guidance</p>
          <button 
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => {
              const communitiesSection = document.getElementById('communities-section');
              if (communitiesSection) {
                communitiesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            🎯 Book My Free Session →
          </button>
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
            <div className="grid gap-4 grid-cols-1 pb-6">
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
                  <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-6">
                    <Users className="h-16 w-16 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No fitness communities found
                  </h3>
                                     <p className="text-gray-600 max-w-md">
                     We&apos;re working on bringing you the best fitness and wellness communities. Check back soon!
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
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
                Showing {communities.length} of {totalCount} Fitness & Wellness Communities
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
                      className="text-green-600 hover:text-green-800"
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