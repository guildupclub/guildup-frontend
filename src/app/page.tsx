"use client";
import EnhancedCommunitySection from "@/components/community/enhanced-community-section";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { setUserFollowedCommunities } from "@/redux/userSlice";
import { useDispatch } from "react-redux";
import React, {
  useEffect,
  useRef,
  useState,
  Suspense,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { primary, black, white } from "./colours";
import Hero from "@/components/landing/Hero";
import ProgramsGrid from "@/components/landing/ProgramsGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import CTABannerWhatsApp from "@/components/landing/CTABannerWhatsApp";
import Testimonials from "@/components/landing/Testimonials";
import CTABannerLeadForm from "@/components/landing/CTABannerLeadForm";
import BlogsGrid from "@/components/landing/BlogsGrid";
 
import { Dialog } from "@/components/ui/dialog";
import CreatorForm from "@/components/form/CreatorForm";
import { toast } from "sonner";
import { useSession, signIn } from "next-auth/react";
import Loader from "@/components/Loader";
 
import { setHeroVisible } from "@/redux/uiSlice";
import { Button } from "@/components/ui/button";
import { useTracking } from "@/hooks/useTracking";
import { PageTracker } from "@/components/analytics/PageTracker";
import { Brain, Dumbbell, ArrowRight, Heart, Briefcase, FileText, Video, CheckCircle, DollarSign, Globe, Shield } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import MemoizedCommunityCard from "@/components/explore/MemoizedCommunityCard";
import { useCachedCommunities } from "@/hooks/useCachedCommunities";
import CachedCommunitySection from "@/components/community/CachedCommunitySection";

import VideoPlaceholder from "@/components/VideoPlaceholder";
import Footer from "@/components/layout/Footer";

import { HiSparkles } from "react-icons/hi2";

// Chakra UI imports
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Grid,
  Card,
  CardBody,
  Flex,
} from '@chakra-ui/react';

interface Category {
  _id: string;
  name: string;
}

// Component to handle search params with Suspense
function SearchParamsProvider({
  children,
  onCategoryFromUrl,
}: {
  children: React.ReactNode;
  onCategoryFromUrl: (category: string | null) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const categoryFromUrl = searchParams?.get("category");
    onCategoryFromUrl(categoryFromUrl ?? null);
  }, [searchParams, onCategoryFromUrl]);

  return children;
}

function Page() {
  const { data: session, status } = useSession();
  const [category, setCategory] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Category");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isMobileVideoLoaded, setIsMobileVideoLoaded] = useState(false);
  const [mobileVideoError, setMobileVideoError] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const user = useSelector((state: RootState) => state.user);
  const isCreator = user?.user?.is_creator ? true : false;
  const [isCreatorFormOpen, setIsCreatorFormOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const userId = session?.user._id;
  const tracking = useTracking();
  
  // Testimonials state
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonials = [
    "I was 26 years old when I had my first panic attack. Just like any Indian family, my parents were not amused by the fact their son would be going for therapy. While I got care finally, I still see a significant level of stigma against mental health. I wish there was an easier way to access this.",
    "I remember the first time I went for a routine checkup. The doctor asked me if I was married. Honestly, it took me a while to realise what she meant was if I was sexually active. GuildUp provides a safe space for these conversations.",
    "I am subjected to intrusive questions about my mental health issues from everyone at the store - right from the person taking my order to everyone else working in the store. All of this makes it a very uncomfortable experience. GuildUp offers privacy and understanding."
  ];

  


  // Cached communities data
  const { data: cachedData, loading: isCachedLoading } = useCachedCommunities({
    fallbackToAPI: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    autoRefresh: false
  });

  // Filtered communities based on selected tab
  const [filteredCommunities, setFilteredCommunities] = useState<any[]>([]);
  
  // Pagination state for All Experts section
  const [displayedCommunities, setDisplayedCommunities] = useState<any[]>([]);
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const communitiesPerPage = 15;

  // Function to filter communities based on selected tab
  const filterCommunitiesByTab = useCallback((tabTag: string) => {
    if (!cachedData?.communities) {
      setFilteredCommunities([]);
      return;
    }

    if (tabTag === 'all' || !tabTag) {
      setFilteredCommunities(cachedData.communities);
      return;
    }

    const filtered = cachedData.communities.filter((item) => {
      const community = item.community || item;
      if (!community.tags || !Array.isArray(community.tags)) return false;
      
      return community.tags.some((tag: string) => 
        tag.toLowerCase().includes(tabTag.toLowerCase()) ||
        tabTag.toLowerCase().includes(tag.toLowerCase())
      );
    });

    setFilteredCommunities(filtered);
  }, [cachedData]);

  // Initialize filtered communities when cached data loads
  useEffect(() => {
    if (cachedData?.communities) {
      filterCommunitiesByTab(selectedCategoryId === 'all' ? 'all' : selectedCategory);
    }
  }, [cachedData, selectedCategoryId, selectedCategory, filterCommunitiesByTab]);

  // Update displayed communities when filtered communities change
  useEffect(() => {
    if (filteredCommunities.length > 0) {
      const initialDisplay = filteredCommunities.slice(0, communitiesPerPage);
      setDisplayedCommunities(initialDisplay);
      setShowAllCommunities(false);
      setCurrentPage(1);
    } else {
      setDisplayedCommunities([]);
    }
  }, [filteredCommunities]);

  // Function to show more communities
  const handleShowMore = () => {
    const nextPage = currentPage + 1;
    const startIndex = 0;
    const endIndex = nextPage * communitiesPerPage;
    const newDisplay = filteredCommunities.slice(startIndex, endIndex);
    
    setDisplayedCommunities(newDisplay);
    setCurrentPage(nextPage);
    
    // If we've shown all communities, hide the button
    if (endIndex >= filteredCommunities.length) {
      setShowAllCommunities(true);
    }
  };

  // Trending categories computed from communities.json (no API)
  const [trendingCategories, setTrendingCategories] = useState<
    { _id: string; name: string; num_communities?: number }[]
  >([]);
  useEffect(() => {
    if (!cachedData?.communities) return;
    // Build counts by category name
    const counts = new Map<string, number>();
    for (const item of cachedData.communities) {
      const c = item.community || item;
      const rawCat = c?.category;
      let name: string | null = null;
      if (typeof rawCat === "string") name = rawCat;
      else if (rawCat?.name) name = rawCat.name;
      if (!name) continue;
      const key = name.trim();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const ranked = Array.from(counts.entries())
      .map(([name, n]) => ({ _id: name.replace(/\s+/g, "-"), name, num_communities: n }))
      .sort((a, b) => (b.num_communities || 0) - (a.num_communities || 0))
      .slice(0, 8);
    setTrendingCategories(ranked);
  }, [cachedData?.communities]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-swiping testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    if (!isMounted || status === "loading") return;

    if (!session) {
      tracking.trackCustomEvent("home_page_viewed_anonymous", {
        is_initial_load: isInitialLoad,
      });
      router.push("/");
    } else {
      // Track authenticated user viewing home page
      tracking.trackCustomEvent("home_page_viewed_authenticated", {
        user_id: session.user._id,
        is_new_user: session.user?.isNewUser,
        is_creator: session.user?.is_creator,
        is_initial_load: isInitialLoad,
      });

      // Identify user for PostHog
      tracking.identifyUser(session.user._id, {
        email: session.user.email,
        name: session.user.name,
        is_creator: session.user?.is_creator,
        signup_date: session.user?.createdAt,
      });

      const fetchCommunities = async () => {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user/follow`,
            {
              userId: session?.user._id,
            }
          );
          dispatch(setUserFollowedCommunities(res.data.data));

          // Track communities loaded
          tracking.trackCustomEvent("user_communities_loaded", {
            user_id: session.user._id,
            communities_count: res.data.data?.length || 0,
          });
        } catch (error) {
          console.error(error);
          tracking.trackError(
            "api_error",
            "Failed to fetch user communities",
            error?.toString()
          );
        }
      };
      fetchCommunities();

      if (session.user?.isNewUser) {
        tracking.trackCustomEvent("new_user_modal_shown", {
          user_id: session.user._id,
        });
        setIsModalOpen(true);
      }
    }

    // Mark initial load as complete
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [session, status, isMounted, router, isInitialLoad, dispatch]);

  const categoryToUrl = (name: string) => {
    return name.replace(/\s+/g, "-");
  };

  const urlToCategory = (url: string) => {
    return url.replace(/-/g, " ");
  };

  // Categories derived from communities.json (no API)
  useEffect(() => {
    if (!cachedData?.communities) return;
    const names = new Set<string>();
    for (const item of cachedData.communities) {
      const c = item.community || item;
      const rawCat = c?.category;
      if (typeof rawCat === "string" && rawCat.trim()) names.add(rawCat.trim());
      else if (rawCat?.name && String(rawCat.name).trim()) names.add(String(rawCat.name).trim());
    }
    const list = [{ _id: "all", name: "All Category" }, ...Array.from(names).map((n) => ({ _id: n.replace(/\s+/g, "-"), name: n }))];
    setCategory(list);
  }, [cachedData?.communities]);

  useEffect(() => {
    if (!category.length) return;

    if (selectedCategory === "All Category") {
      router.replace("/", { scroll: false });
    } else {
      router.replace(`?category=${categoryToUrl(selectedCategory)}`, {
        scroll: false,
      });
    }
  }, [selectedCategory, router, category]);

  useEffect(() => {
    if (session && typeof window !== "undefined") {
      const shouldOpen = localStorage.getItem("openCreatorModal");

      if (shouldOpen === "true") {
        localStorage.removeItem("openCreatorModal");

        tracking.trackCustomEvent("creator_form_opened_post_signin", {
          user_id: session.user._id,
          triggered_from: "post_signin",
        });

        setIsCreatorFormOpen(true);
      }
    }
  }, [session]);

  const handleCreatorButtonClick = () => {
    tracking.trackClick("creator_signup_button", {
      section: "header",
      user_signed_in: !!session,
      user_id: session?.user._id,
    });

    if (!session) {
      // Store intent to open modal after sign-in
      localStorage.setItem("openCreatorModal", "true");

      tracking.trackCustomEvent("signup_prompt_shown", {
        trigger: "creator_button",
        location: "home_page",
      });

      tracking.trackClick("signin_from_redirect", {
        trigger: "creator_button_prompt",
      });

      signIn(undefined, {
        callbackUrl: `${window.location.origin}`,
      });

      return;
    }

    tracking.trackCustomEvent("creator_form_opened", {
      source: "header_button",
      user_id: session.user._id,
    });

    setIsCreatorFormOpen(true);
  };

  const handleCategorySelect = (categoryId: string) => {
    // Track category selection
    const selectedCat = category.find(
      (cat: Category) => cat._id === categoryId
    );

    // Handle tag-based filtering for the new tabs
    const isTagFilter = !selectedCat && categoryId !== 'all';
    const categoryName = isTagFilter ? categoryId : (selectedCat?.name || "All Category");

    tracking.trackClick("category_filter", {
      category_id: categoryId,
      category_name: categoryName,
      previous_category: selectedCategory,
      user_id: session?.user._id,
      is_tag_filter: isTagFilter,
    });

    // Update category state
    if (selectedCat) {
      setSelectedCategory(selectedCat.name);
      setSelectedCategoryId(categoryId);
    } else if (isTagFilter) {
      setSelectedCategory(categoryId); // Use the tag as the category name
      setSelectedCategoryId(categoryId); // Use the tag as the category ID
    } else {
      setSelectedCategory("All Category");
      setSelectedCategoryId("all");
    }

    // Filter communities using cached data
    if (cachedData?.communities) {
      filterCommunitiesByTab(categoryId === 'all' ? 'all' : categoryId);
    }

    if (targetRef.current) {
      const headerOffset = 145;
      const elementPosition = targetRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  

  const handleCategoryFromUrl = useCallback(
    (categoryFromUrl: string | null) => {
      if (categoryFromUrl && category.length > 0) {
        const categoryName = urlToCategory(categoryFromUrl);
        const categoryObj = category.find(
          (cat: Category) =>
            cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        if (categoryObj) {
          setSelectedCategory(categoryObj.name);
          setSelectedCategoryId(categoryObj._id);
        }
      }
    },
    [category]
  );

  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visiblePercentage = entry.intersectionRatio;
        dispatch(setHeroVisible(visiblePercentage > 0.2));
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: "0px 0px 0px 0px",
      }
    );

    observer.observe(heroRef.current);

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, [dispatch, heroRef]);

  return (
    <div style={{backgroundColor: white}}>
    <Suspense
      fallback={
        <div className="min-h-[100vh] flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <SearchParamsProvider onCategoryFromUrl={handleCategoryFromUrl}>

        <div className="relative overflow-x-hidden" style={{backgroundColor: white}}>

          {/* Creator Form Dialog */}
          <Dialog open={isCreatorFormOpen} onOpenChange={setIsCreatorFormOpen}>
            <CreatorForm onClose={() => setIsCreatorFormOpen(false)} />
          </Dialog>

          {/* 2. Main Navbar - Using existing Hero component */}
          {/* <div className="relative z-10">
            <div ref={heroRef}>
              <Hero />
            </div>
          </div> */}

          

          {/* Hero */}
          <div className="relative" style={{ backgroundColor: white }}>
            <Hero />
          </div>

          {/* Programs and How It Works */}
          <ProgramsGrid />
          <HowItWorks />

          {/* 3. All Experts Listing */}
          <div className="w-full py-16 sm:py-20" style={{ backgroundColor: white }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: black }}>
                  All Experts
                </h2>
                <p className="text-lg max-w-2xl mx-auto" style={{ color: black }}>
                  Browse through our complete collection of experts and find the perfect match for your journey
                </p>
              </div>

              {/* Category filter removed per request */}

              <div className="flex-1 min-w-0" ref={targetRef}>
                <div className="rounded-xl sm:rounded-2xl">
                  <div
                    id="scroll-target-border"
                    className="w-full h-1 mb-4"
                  ></div>
                  {isCachedLoading ? (
                    <Loader />
                  ) : (
                    <>
                      <CachedCommunitySection
                        communities={displayedCommunities}
                        loading={isCachedLoading}
                      />
                      
                      {/* Show More Button */}
                      {filteredCommunities.length > communitiesPerPage && !showAllCommunities && (
                        <div className="flex justify-center mt-8">
                          <button
                            onClick={handleShowMore}
                            className="px-8 py-3 rounded-lg font-medium text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
                            style={{
                              backgroundColor: primary,
                              color: white,
                              fontFamily: "'Poppins', sans-serif"
                            }}
                            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#2B37E9'}
                            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = primary}
                          >
                            <span>Show More Experts</span>
                            <ArrowRight size={20} />
                          </button>
                        </div>
                      )}
                      
                      {/* Show All Communities Message */}
                      {showAllCommunities && filteredCommunities.length > communitiesPerPage && (
                        <div className="text-center mt-6">
                          <p className="text-sm text-gray-500" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Showing all {filteredCommunities.length} communities
                          </p>
                        </div>
                      )}
                    </>
                  )}
              </div>
            </div>
          </div>

          {/* Old testimonials block removed; using new Testimonials component below */}

          {/* Spacer Section */}
          <div className="w-full py-6 sm:py-8" style={{ backgroundColor: white }}>
            <div className="h-2"></div>
          </div>


          {/* Spacer Section */}
          <div className="w-full py-8 sm:py-10" style={{ backgroundColor: white }}>
            <div className="h-4"></div>
          </div>

          {/* CTA to WhatsApp */}
          <CTABannerWhatsApp />

          {/* Spacer Section */}
          <div className="w-full py-6 sm:py-8" style={{ backgroundColor: white }}>
            <div className="h-2"></div>
          </div>

        </div>

        {/* Testimonials, Lead Form CTA, Blogs */}
        <Testimonials />
        <CTABannerLeadForm />
        <BlogsGrid />
        <Footer />
        </div>
      </SearchParamsProvider>
      <PageTracker
        pageName="Home"
        pageCategory="landing"
        metadata={{
          selected_category: selectedCategory,
          selected_category_id: selectedCategoryId,
          user_signed_in: !!session,
          user_id: session?.user._id,
          is_creator: session?.user?.is_creator,
          is_new_user: session?.user?.isNewUser,
          categories_count: category.length,
          is_loading: isLoading,
        }}
        trackScrollDepth={true}
        trackTimeOnPage={true}
        trackClicks={true}
      />
    </Suspense>
  </div>
  );
}

export default Page;
