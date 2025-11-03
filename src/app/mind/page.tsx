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
import LandingPageOnboarding from "@/components/onboarding/LandingPageOnboarding";
import { useLandingPageOnboarding } from "@/hooks/useLandingPageOnboarding";
import { useToast } from "@/hooks/use-toast";
import { setUser } from "@/redux/userSlice";

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

// Mind-related category IDs
const MIND_CATEGORY_IDS = [
  "67cab23e9b3cd869f1d3ee97",
  "67cab2669b3cd869f1d3ee98",
  "67cab2809b3cd869f1d3ee99"
];

console.log("Backend requests will be made to : ", process.env.NEXT_PUBLIC_BACKEND_BASE_URL)

export default function MindPage() {
  const loggedInUserId = useSelector(
    (state: RootState) => state.user.user?._id
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  // Onboarding popup hook
const {
  isOpen: isOnboardingOpen,
  handleClose: handleOnboardingClose,
  handleComplete: handleOnboardingComplete,
  triggerOnboarding
} = useLandingPageOnboarding({
  variant: "mind",
  delay: 2500,
  onComplete: async (data) => {
    console.log("Onboarding completed:", data);

    const mobileNumber = data.mobile?.replace("+", "") || "";

    try {
      // ✅ Store user in sessionStorage & Redux
      // sessionStorage.setItem("user", JSON.stringify(data.user));
      // sessionStorage.setItem("name", data.user.name);
      // sessionStorage.setItem("id", data.user._id);
      // sessionStorage.setItem("token", data.token);
      // sessionStorage.setItem("email", data.user.email);

      // dispatch(
      //   setUser({
      //     user: data.user,
      //     token: data.token
      //   })
      // );

      // 3️⃣ Save Onboarding Data
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/onboarding-user`, {
        name: data.fullName,
        email: data.email,
        phone: mobileNumber,
        interestedCategories: data.struggles || ["mind"],
        preferredSessionType: data.expertType || "discovery-call",
        additionalNotes: data.otherLanguage || "",
        userId: data.user._id,
        expertGender: data.expertGender,
        languages: data.languages,
        age: data.age,
        gender: data.gender,
      });

      console.log("Onboarding data saved successfully");

      // Redirect based on new/existing user
      // if (data.isNewUser) {
      //   router.push("/onboarding");
      // } else {
      //   router.push("/feeds");
      // }
    } catch (err) {
      console.error("Error in onboarding flow:", err);
      toast({
        title: "An error occurred",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }
});


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

      // Use the new filter API to get mind-related communities
      const filterPayload = {
        categoryIds: MIND_CATEGORY_IDS,
        priceRange: {
          min: 0,
          max: 300
        },
        offeringTypes: ["discovery-call", "consultation"]
      };

      let transformedCommunities: Community[] = [];

      try {
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
          transformedCommunities = response.data.data.map((community: any) => ({
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
        }
      } catch (apiErr) {
        // Fallback: fetch from JSON route
        try {
          const resp = await fetch("/api/communities", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (resp.ok) {
            const data = await resp.json();
            const all: any[] = Array.isArray(data) ? data : [];
            // Basic mapping from JSON structure
            const mapped = all.map((c: any) => ({
              _id: c._id,
              user_id: typeof c.user_id === "string" ? c.user_id : (c.user_id?._id || c._id),
              name: c.name,
              description: c.description || "",
              image: c.image,
              owner_experience: c.owner_experience || 0,
              owner_sessions: c.owner_sessions || 0,
              num_member: c.num_member || 0,
              linkedin_followers: c.linkedin_followers || 0,
              instagram_followers: c.instagram_followers || 0,
              youtube_followers: c.youtube_followers || 0,
              tags: c.tags || [],
              min_offering_id: c.min_offering_id,
            }));

            // Local filter for Mind categories (by category fields or tags/name keywords)
            const nameById: Record<string, string> = {
              "67cab23e9b3cd869f1d3ee97": "relationship",
              "67cab2669b3cd869f1d3ee98": "mental",
              "67cab2809b3cd869f1d3ee99": "self",
            };
            const desiredIds = new Set(MIND_CATEGORY_IDS);
            const desiredNameTokens = new Set([
              "mental",
              "counsel",
              "therapy",
              "relationship",
              "parent",
              "self",
              "growth",
              "mind",
              "anxiety",
              "stress",
            ]);

            const matchesCategory = (raw: any): boolean => {
              const cid = raw.category_id || raw.categoryId || raw.category?._id || raw.category?.id;
              if (cid && desiredIds.has(String(cid))) return true;
              const cname = String(raw.category_name || raw.categoryName || raw.category?.name || "").toLowerCase();
              if (cname) {
                for (const token of desiredNameTokens) if (cname.includes(token)) return true;
              }
              const tgs: string[] = Array.isArray(raw.tags) ? raw.tags.flat().map((t: any) => String(t).toLowerCase()) : [];
              return tgs.some((t) => Array.from(desiredNameTokens).some((tok) => t.includes(tok)));
            };

            transformedCommunities = mapped.filter((m, idx) => matchesCategory(all[idx]));
          } else {
            console.warn("/api/communities returned status", resp.status);
          }
        } catch (jsonErr) {
          console.error("JSON fallback failed for mind communities:", jsonErr);
        }
      }

      if (transformedCommunities.length > 0) {
        if (isLoadMore) {
          setCommunities((prev) => [...prev, ...transformedCommunities]);
        } else {
          setCommunities(transformedCommunities);
        }
        setHasMore(transformedCommunities.length === COMMUNITIES_PER_PAGE);
        setTotalCount((prev) => (prev > 0 ? prev : transformedCommunities.length));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching mind communities:", error);
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
    <div className="min-h-screen">
      {/* Onboarding Popup */}
      <LandingPageOnboarding
        isOpen={isOnboardingOpen}
        onClose={handleOnboardingClose}
        variant="mind"
        onComplete={handleOnboardingComplete}
      />

      {/* Free Discovery Call Banner - Top */}
      <div className="hidden md:block sticky top-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border-b-4 border-indigo-400 z-30">
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
                <p className="text-purple-100 text-xs sm:text-sm hidden sm:block">✨ Experience personalized guidance from India&apos;s top verified experts, completely free for your first 3 sessions! 🧘‍♀️💪🧠</p>
                <p className="text-purple-100 text-xs sm:hidden">✨ Experience personalized guidance from India&apos;s top verified experts, completely free for your first 3 sessions! 🧘‍♀️💪🧠</p>
              </div>
            </div>
                         <Button 
               className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs sm:text-base whitespace-nowrap flex-shrink-0"
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
        <div className="relative overflow-hidden bg-gradient-to-br from-lavender-50 via-indigo-50 to-blue-50 text-black">
          {/* Floating background icons */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-8 opacity-[0.05] animate-float">
              <Brain className="h-12 w-12 text-gray-600" />
            </div>
            <div className="absolute top-20 right-12 opacity-[0.05] animate-float-delay">
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full backdrop-blur-sm shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-gray-900 leading-tight animate-fade-in">
                💡 Get Your FREE Expert Session Today
              </h1>
              
              <p className="text-sm sm:text-base text-gray-700 max-w-xl mx-auto mb-4 leading-relaxed animate-fade-in-delay">
                Work 1:1 with verified therapists, life coaches & wellness experts — normally ₹1,000+ per session, free for a limited time.
              </p>

              {/* 3-Step Visual Funnel */}
              <div className="flex justify-center items-center gap-2 mb-4 animate-fade-in-delay-2">
                {/* Step 1 */}
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">1</div>
                  <span className="text-xs font-medium text-gray-800">Pick expert</span>
                </div>

                {/* Arrow */}
                <div className="text-indigo-500 font-bold text-sm">→</div>

                {/* Step 2 */}
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
                  <span className="text-xs font-medium text-gray-800">Select time</span>
                </div>

                {/* Arrow */}
                <div className="text-purple-500 font-bold text-sm">→</div>

                {/* Step 3 */}
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
                  <span className="text-xs font-medium text-gray-800">Book FREE</span>
                </div>
              </div>
              

            </div>
          </div>
        </div>

        {/* Ready to Transform CTA Section */}
        <div className="bg-gradient-to-br from-lavender-50 via-indigo-50 to-blue-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Transform Your Mind?</h2>
            <p className="text-gray-700 mb-6">Join thousands who&apos;ve already experienced the power of expert guidance</p>
            <button 
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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