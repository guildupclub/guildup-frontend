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

  // Trending categories for suggestions and popular categories
  const [trendingCategories, setTrendingCategories] = useState<
    { _id: string; name: string; num_communities?: number }[]
  >([]);
  useEffect(() => {
    const fetchTrendingCategories = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category/trending`
        );
        if (res?.data?.r === "s" && Array.isArray(res.data.data)) {
          setTrendingCategories(res.data.data);
        }
      } catch (e) {
        console.error("Failed to load trending categories", e);
      }
    };
    fetchTrendingCategories();
  }, []);

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

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category`
        );

        const categories = [
          { _id: "all", name: "All Category" },
          ...response.data.data,
        ];
        setCategory(categories);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategory();
  }, []);

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

        <div className="min-h-screen relative" style={{backgroundColor: white}}>

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

          

          {/* 1. Modern Clean Hero Section */}
          <div className="relative min-h-screen flex items-center -mt-20 pt-20" style={{ backgroundColor: white }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Content */}
                <div className="space-y-8">
                  {/* Trust Badge */}
                  <div className="inline-flex items-center px-4 py-2 rounded-full border border-gray-200" style={{ backgroundColor: `${primary}15` }}>
                    <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: primary }}></span>
                    <span className="text-sm font-medium" style={{ color: primary, fontFamily: 'Garamond, serif', fontWeight: '600' }}>
                      Trusted by 10,000+ users across India
                    </span>
                  </div>

                  {/* Main Headline */}
                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight" style={{ color: black, fontFamily: 'Garamond, serif', fontWeight: '700' }}>
                      Your wellness journey
                      <br />
                      <span style={{ color: primary, fontWeight: '800' }}>starts here</span>
                    </h1>
                  </div>

                  {/* Subtitle */}
                  <p className="text-lg sm:text-xl leading-relaxed max-w-lg" style={{ color: '#6B7280', fontFamily: 'Garamond, serif', fontWeight: '400' }}>
                    Connect with licensed professionals in a judgment-free environment. Get personalized care for mental health, physical wellness, relationships, and career growth.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => router.push('/mind')}
                      className="px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                      style={{ 
                        backgroundColor: primary, 
                        color: white,
                        fontFamily: 'Garamond, serif',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#2B37E9'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = primary}
                    >
                      Get Started Today
                    </button>
                    
                    <button 
                      onClick={() => window.open('https://wa.me/919220521385?text=Hi! I would like to learn more about GuildUp.', '_blank')}
                      className="px-8 py-4 border-2 rounded-lg font-semibold transition-all duration-300 hover:bg-gray-50"
                      style={{ 
                        borderColor: primary, 
                        color: primary,
                        fontFamily: 'Garamond, serif',
                        fontWeight: '500'
                      }}
                    >
                      Schedule Free Call
                    </button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="grid grid-cols-3 gap-8 pt-8">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: primary, fontFamily: 'Garamond, serif', fontWeight: '700' }}>500+</div>
                      <div className="text-sm" style={{ color: '#6B7280', fontFamily: 'Garamond, serif', fontWeight: '400' }}>Licensed Experts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: primary, fontFamily: 'Garamond, serif', fontWeight: '700' }}>10K+</div>
                      <div className="text-sm" style={{ color: '#6B7280', fontFamily: 'Garamond, serif', fontWeight: '400' }}>Happy Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: primary, fontFamily: 'Garamond, serif', fontWeight: '700' }}>50K+</div>
                      <div className="text-sm" style={{ color: '#6B7280', fontFamily: 'Garamond, serif', fontWeight: '400' }}>Sessions</div>
                    </div>
                  </div>
                </div>

                {/* Right Visual - Hero Images Grid */}
                <div className="relative lg:h-[600px] flex items-center justify-center">
                  <div className="relative w-full h-full max-w-lg mx-auto">
                    
                    {/* 2x2 Grid Layout */}
                    <div className="grid grid-cols-2 gap-4 h-full">
                      
                      {/* Hero Image 1 - Top Left */}
                      <div className="relative flex items-center justify-center animate-float-up">
                        <div className="relative group w-full h-full max-w-[200px] max-h-[200px]">
                          <div className="absolute -inset-1 rounded-2xl blur-sm transition-all duration-300 group-hover:blur-none" style={{ background: `linear-gradient(135deg, ${primary}30, transparent)` }}></div>
                          <img 
                            src="/hero/hero1.jpg" 
                            alt="Physical Wellness"
                            className="relative w-full h-full object-cover rounded-2xl shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                            style={{ border: `3px solid ${primary}40` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                        </div>
                      </div>

                      {/* Hero Image 2 - Top Right */}
                      <div className="relative flex items-center justify-center animate-float-right">
                        <div className="relative group w-full h-full max-w-[200px] max-h-[200px]">
                          <div className="absolute -inset-1 rounded-2xl blur-sm transition-all duration-300 group-hover:blur-none" style={{ background: `linear-gradient(135deg, ${primary}30, transparent)` }}></div>
                          <img 
                            src="/hero/hero2.jpg" 
                            alt="Mental Wellness"
                            className="relative w-full h-full object-cover rounded-2xl shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                            style={{ border: `3px solid ${primary}40` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                        </div>
                      </div>

                      {/* Hero Image 3 - Bottom Left */}
                      <div className="relative flex items-center justify-center animate-float-left">
                        <div className="relative group w-full h-full max-w-[200px] max-h-[200px]">
                          <div className="absolute -inset-1 rounded-2xl blur-sm transition-all duration-300 group-hover:blur-none" style={{ background: `linear-gradient(135deg, ${primary}30, transparent)` }}></div>
                          <img 
                            src="/hero/hero3.jpg" 
                            alt="Professional Support"
                            className="relative w-full h-full object-cover rounded-2xl shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                            style={{ border: `3px solid ${primary}40` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                        </div>
                      </div>

                      {/* Hero Image 4 - Bottom Right */}
                      <div className="relative flex items-center justify-center animate-float-down">
                        <div className="relative group w-full h-full max-w-[200px] max-h-[200px]">
                          <div className="absolute -inset-1 rounded-2xl blur-sm transition-all duration-300 group-hover:blur-none" style={{ background: `linear-gradient(135deg, ${primary}30, transparent)` }}></div>
                          <img 
                            src="/hero/hero4.jpg" 
                            alt="Holistic Care"
                            className="relative w-full h-full object-cover rounded-2xl shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                            style={{ border: `3px solid ${primary}40` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                        </div>
                      </div>
                    </div>

                    {/* Central Connecting Element */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-20 h-20 rounded-full animate-pulse-slow" style={{ background: `radial-gradient(circle, ${primary}15, transparent)` }}>
                        <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}20, transparent)` }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center animate-spin-slow" style={{ backgroundColor: primary }}>
                            <HiSparkles size={16} color={white} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Corner Accent Lines */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: primary }}></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: primary }}></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: primary }}></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: primary }}></div>

                    {/* Floating Particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute top-8 left-8 w-1.5 h-1.5 rounded-full animate-particle-1" style={{ backgroundColor: `${primary}60` }}></div>
                      <div className="absolute top-12 right-12 w-1 h-1 rounded-full animate-particle-2" style={{ backgroundColor: `${primary}80` }}></div>
                      <div className="absolute bottom-16 left-12 w-1.5 h-1.5 rounded-full animate-particle-3" style={{ backgroundColor: `${primary}70` }}></div>
                      <div className="absolute bottom-8 right-8 w-1 h-1 rounded-full animate-particle-4" style={{ backgroundColor: `${primary}50` }}></div>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* Custom Animations */}
            <style jsx>{`
              @keyframes float-up {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-12px) rotate(1deg); }
              }
              
              @keyframes float-right {
                0%, 100% { transform: translateY(0px) translateX(0px); }
                50% { transform: translateY(-8px) translateX(6px); }
              }
              
              @keyframes float-left {
                0%, 100% { transform: translateY(0px) translateX(0px); }
                50% { transform: translateY(-10px) translateX(-4px); }
              }
              
              @keyframes float-down {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-6px) rotate(-1deg); }
              }
              
              @keyframes pulse-slow {
                0%, 100% { opacity: 0.6; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
              }
              
              @keyframes spin-slow {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              
              @keyframes particle-float-1 {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.7; }
                25% { transform: translateY(-15px) translateX(10px); opacity: 1; }
                50% { transform: translateY(-8px) translateX(-5px); opacity: 0.5; }
                75% { transform: translateY(-20px) translateX(8px); opacity: 0.8; }
              }
              
              @keyframes particle-float-2 {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
                33% { transform: translateY(-12px) translateX(-8px); opacity: 1; }
                66% { transform: translateY(-18px) translateX(12px); opacity: 0.4; }
              }
              
              @keyframes particle-float-3 {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.8; }
                40% { transform: translateY(-10px) translateX(6px); opacity: 0.3; }
                80% { transform: translateY(-16px) translateX(-4px); opacity: 1; }
              }
              
              @keyframes particle-float-4 {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
                30% { transform: translateY(-14px) translateX(-6px); opacity: 0.9; }
                70% { transform: translateY(-8px) translateX(10px); opacity: 0.6; }
              }
              
              .animate-float-up {
                animation: float-up 4s ease-in-out infinite;
              }
              
              .animate-float-right {
                animation: float-right 3.5s ease-in-out infinite 0.5s;
              }
              
              .animate-float-left {
                animation: float-left 4.5s ease-in-out infinite 1s;
              }
              
              .animate-float-down {
                animation: float-down 3.8s ease-in-out infinite 1.5s;
              }
              
              .animate-pulse-slow {
                animation: pulse-slow 3s ease-in-out infinite;
              }
              
              .animate-spin-slow {
                animation: spin-slow 20s linear infinite;
              }
              
              .animate-particle-1 {
                animation: particle-float-1 6s ease-in-out infinite;
              }
              
              .animate-particle-2 {
                animation: particle-float-2 7s ease-in-out infinite 1s;
              }
              
              .animate-particle-3 {
                animation: particle-float-3 5.5s ease-in-out infinite 2s;
              }
              
              .animate-particle-4 {
                animation: particle-float-4 6.5s ease-in-out infinite 0.5s;
              }
              
              /* Responsive adjustments for mobile */
              @media (max-width: 640px) {
                .animate-float-up,
                .animate-float-right,
                .animate-float-left,
                .animate-float-down {
                  animation-duration: 2.5s;
                }
              }
            `}</style>
          </div>

          {/* Spacer Section */}
          <div className="w-full py-12 sm:py-16" style={{ backgroundColor: white }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-8"></div>
            </div>
          </div>

          {/* 2. How It Works - Light Timeline */}
          <Box bg="gray.50" py={20}>
            <Container maxW="7xl">
              <VStack spacing={16} align="center">
                <VStack spacing={4} textAlign="center">
                  <Heading size="2xl" fontWeight="bold" color="gray.900">
                    How it works?
                  </Heading>
                  <Text fontSize="lg" color="gray.600" maxW="2xl">
                    Unlock your potential in three simple steps
                  </Text>
                </VStack>
                <HStack spacing={8} align="stretch" w="full" justify="center" flexWrap="wrap">
                  {[
                    {
                      title: "Online Assessment",
                      desc: "Share your goals and challenges with our platform. We'll match you with the right expert for your needs.",
                      icon: FileText,
                      color: primary
                    },
                    {
                      title: "Connect with Expert", 
                      desc: "Start with a free 30-minute consultation via chat, phone, or video call based on your preference.",
                      icon: Video,
                      color: primary
                    },
                    {
                      title: "Ongoing Support",
                      desc: "Continue your journey with regular sessions, progress tracking, and 24/7 access to your expert.",
                      icon: CheckCircle,
                      color: primary
                    }
                  ].map((item, index) => (
                    <Flex key={index} direction="column" align="center" flex="1" minW="300px" maxW="400px">
                      <VStack spacing={6} align="center">
                        <Box position="relative">
                          <Box 
                            w={20} 
                            h={20} 
                            bg={`${item.color}20`} 
                            borderRadius="full" 
                            display="flex" 
                            alignItems="center" 
                            justifyContent="center"
                            border="4px"
                            borderColor={primary}
                          >
                            <item.icon size={40} color={primary} />
                          </Box>
                          {index < 2 && (
                            <Box 
                              position="absolute" 
                              top="50%" 
                              left="full" 
                              transform="translateY(-50%)" 
                              w={8} 
                              h={0.5} 
                              bg={`${primary}80`}
                              display={{ base: "none", lg: "block" }}
                            />
                          )}
                        </Box>
                        <VStack spacing={3} textAlign="center">
                          <Heading size="md" color="gray.900">{index + 1}. {item.title}</Heading>
                          <Text color="gray.600" fontSize="sm">{item.desc}</Text>
                        </VStack>
                      </VStack>
                    </Flex>
                  ))}
                </HStack>
              </VStack>
            </Container>
          </Box>

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

              {/* Community Category Tabs */}
              <div className="flex justify-center mb-8">
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 p-4 rounded-2xl shadow-lg border" style={{ 
                  backgroundColor: `${primary}08`, 
                  borderColor: `${primary}20`,
                  backdropFilter: 'blur(10px)'
                }}>
                  {[
                    { id: 'all', label: 'All Experts', tag: '' },
                    { id: 'nutrition', label: 'Nutrition', tag: 'Nutrition' },
                    { id: 'pcos', label: 'PCOS', tag: 'PCOS' },
                    { id: 'anxiety', label: 'Anxiety', tag: 'Anxiety' },
                    { id: 'stress', label: 'Stress', tag: 'Stress' },
                    { id: 'relationship', label: 'Relationship', tag: 'Relationship' }
                  ].map((tab) => {
                    // Calculate count for this tab
                    const getTabCount = () => {
                      if (!cachedData?.communities) return 0;
                      if (tab.id === 'all') return cachedData.communities.length;
                      
                      return cachedData.communities.filter((item) => {
                        const community = item.community || item;
                        if (!community.tags || !Array.isArray(community.tags)) return false;
                        return community.tags.some((tag: string) => 
                          tag.toLowerCase().includes(tab.tag.toLowerCase()) ||
                          tab.tag.toLowerCase().includes(tag.toLowerCase())
                        );
                      }).length;
                    };

                    const tabCount = getTabCount();
                    const isActive = (tab.id === 'all' && selectedCategoryId === 'all') || 
                                   (tab.id !== 'all' && selectedCategory === tab.tag);
                    
                    return (
                    <button
                      key={tab.id}
                      onClick={() => handleCategorySelect(tab.id === 'all' ? 'all' : tab.tag)}
                      className={`relative px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center gap-2.5 group overflow-hidden ${
                        isActive
                          ? 'text-white shadow-xl transform scale-105' 
                          : 'text-gray-700 hover:text-gray-900 bg-white/90 hover:bg-white shadow-md hover:shadow-lg hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: isActive ? primary : undefined,
                        fontFamily: "'Poppins', sans-serif",
                        border: isActive ? `2px solid ${primary}` : '2px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.target as HTMLElement).style.backgroundColor = 'white';
                          (e.target as HTMLElement).style.transform = 'scale(1.05)';
                          (e.target as HTMLElement).style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.9)';
                          (e.target as HTMLElement).style.transform = 'scale(1)';
                          (e.target as HTMLElement).style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                        }
                      }}
                    >
                      {/* Active tab glow effect */}
                      {isActive && (
                        <div 
                          className="absolute inset-0 rounded-xl opacity-20"
                          style={{ 
                            background: `linear-gradient(135deg, ${primary}, ${primary}80)`,
                            filter: 'blur(8px)'
                          }}
                        />
                      )}
                      
                      <span className="relative z-10">{tab.label}</span>
                      {tabCount > 0 && (
                        <span className={`relative z-10 text-xs px-2.5 py-1 rounded-full font-bold transition-all duration-300 ${
                          isActive
                            ? 'bg-white/25 text-white shadow-inner' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}>
                          {tabCount}
                        </span>
                      )}
                      
                      {/* Subtle shine effect on hover */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%]" />
                    </button>
                    );
                  })}
                </div>
              </div>

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

          {/* 4. Customer Testimonials Section */}
          <div className="w-full py-16 sm:py-20" style={{ backgroundColor: white }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: black, fontFamily: 'Garamond, serif', fontWeight: '700' }}>
                  What Our Users Say
                </h2>
                <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6B7280', fontFamily: 'Garamond, serif', fontWeight: '400' }}>
                  Real stories from people who found their path to wellness with GuildUp
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="p-8 sm:p-12 rounded-2xl border shadow-lg" style={{ backgroundColor: '#F9FAFB', borderColor: `${primary}20` }}>
                  <div className="text-center">
                    <div className="mb-6">
                      <svg className="w-8 h-8 mx-auto mb-4" style={{ color: primary }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                      </svg>
                    </div>
                    
                    <blockquote className="text-lg sm:text-xl italic mb-8 leading-relaxed" style={{ color: '#374151', fontFamily: 'Garamond, serif', fontWeight: '400' }}>
                      &quot;{testimonials[currentTestimonial]}&quot;
                    </blockquote>
                    
                    <div className="flex justify-center space-x-3 mb-6">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentTestimonial(index)}
                          className="w-3 h-3 rounded-full transition-all duration-300 hover:scale-110"
                          style={{
                            backgroundColor: index === currentTestimonial 
                              ? primary 
                              : '#D1D5DB'
                          }}
                          onMouseEnter={(e) => {
                            if (index !== currentTestimonial) {
                              (e.target as HTMLElement).style.backgroundColor = '#9CA3AF';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (index !== currentTestimonial) {
                              (e.target as HTMLElement).style.backgroundColor = '#D1D5DB';
                            }
                          }}
                        />
                      ))}
                    </div>

                    <div className="text-sm" style={{ color: '#6B7280', fontFamily: 'Garamond, serif', fontWeight: '400' }}>
                      Anonymous User • Verified Review
                    </div>
                  </div>
                </div>

                {/* Additional Trust Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
                  <div className="text-center p-6 rounded-xl" style={{ backgroundColor: `${primary}05` }}>
                    <div className="text-2xl font-bold mb-2" style={{ color: primary, fontFamily: 'Garamond, serif', fontWeight: '700' }}>4.8/5</div>
                    <div className="text-sm" style={{ color: '#6B7280', fontFamily: 'Garamond, serif', fontWeight: '400' }}>Average Rating</div>
                  </div>
                  <div className="text-center p-6 rounded-xl" style={{ backgroundColor: `${primary}05` }}>
                    <div className="text-2xl font-bold mb-2" style={{ color: primary, fontFamily: 'Garamond, serif', fontWeight: '700' }}>95%</div>
                    <div className="text-sm" style={{ color: '#6B7280', fontFamily: 'Garamond, serif', fontWeight: '400' }}>Satisfaction Rate</div>
                  </div>
                  <div className="text-center p-6 rounded-xl" style={{ backgroundColor: `${primary}05` }}>
                    <div className="text-2xl font-bold mb-2" style={{ color: primary, fontFamily: 'Garamond, serif', fontWeight: '700' }}>1000+</div>
                    <div className="text-sm" style={{ color: '#6B7280', fontFamily: 'Garamond, serif', fontWeight: '400' }}>Success Stories</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer Section */}
          <div className="w-full py-6 sm:py-8" style={{ backgroundColor: white }}>
            <div className="h-2"></div>
          </div>


          {/* Spacer Section */}
          <div className="w-full py-8 sm:py-10" style={{ backgroundColor: white }}>
            <div className="h-4"></div>
          </div>

          {/* 5. Discovery Call Banner - WhatsApp with Primary Background */}
          <div className="relative w-full overflow-hidden py-16 sm:py-20" style={{backgroundColor: primary}}>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                    <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: white, fontFamily: 'Garamond, serif', fontWeight: '700'}}>
                  🎯 Free Discovery Call!
                </h2>
                <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed" style={{fontFamily: 'Garamond, serif', fontWeight: '400'}}>
                  Not sure which expert is right for you? Chat with us on WhatsApp for a complimentary consultation to discuss your goals and find your perfect match.
                </p>
                
                {/* Centered WhatsApp Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => window.open('https://wa.me/919876543210?text=Hi! I would like to book a free discovery call to find the right expert for my wellness journey.', '_blank')}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold px-10 py-5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg flex items-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    💬 Chat on WhatsApp
                  </Button>
                </div>
                
                <p className="text-sm text-white/80 mt-6" style={{fontFamily: 'Garamond, serif', fontWeight: '400'}}>
                  No commitment required • Expert guidance • Personalized recommendations
                </p>
              </div>
            </div>
          </div>

          {/* Spacer Section */}
          <div className="w-full py-6 sm:py-8" style={{ backgroundColor: white }}>
            <div className="h-2"></div>
          </div>

        </div>

        {/* White spacing before footer */}
        <div className="py-8" style={{backgroundColor: white}}></div>

        {/* Footer */}
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
