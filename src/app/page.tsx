"use client";
import CategoryBar from "@/components/explore/CategoryBar";
import EnhancedCommunitySection from "@/components/community/enhanced-community-section";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { setUserFollowedCommunities } from "@/redux/userSlice";
import { fetchUserCommunities } from "@/lib/services/communities";
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
import Hero from "@/components/heroSection/HeroSection";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreatorForm from "@/components/form/CreatorForm";
import { toast } from "sonner";
import { useSession, signIn } from "next-auth/react";
import Loader from "@/components/Loader";
import { motion, useScroll } from "framer-motion";
import { setHeroVisible } from "@/redux/uiSlice";
import { Button } from "@/components/ui/button";
import { useTracking } from "@/hooks/useTracking";
import { PageTracker } from "@/components/analytics/PageTracker";
import { Brain, Dumbbell, ArrowRight } from "lucide-react";


import VideoPlaceholder from "@/components/VideoPlaceholder";
import Footer from "@/components/layout/Footer";

import { HiSparkles } from "react-icons/hi2";

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
  const targetRef = useRef<HTMLDivElement | null>(null);
  const user = useSelector((state: RootState) => state.user);
  const isCreator = user?.user?.is_creator ? true : false;
  const [isCreatorFormOpen, setIsCreatorFormOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const stickyTriggerRef = useRef<HTMLDivElement>(null);
  const userId = session?.user._id;
  const tracking = useTracking();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          const communities = await fetchUserCommunities(session?.user._id);
          // Transform communities to include 'id' property for Redux
          const transformedCommunities = communities.map((community: any) => ({
            ...community,
            id: community._id,
          }));
          dispatch(setUserFollowedCommunities(transformedCommunities as any));

          // Track communities loaded
          tracking.trackCustomEvent("user_communities_loaded", {
            user_id: session.user._id,
            communities_count: transformedCommunities?.length || 0,
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
        // Fetch categories from JSON file only
        const jsonResponse = await fetch("/api/categories");
        
        if (!jsonResponse.ok) {
          if (jsonResponse.status === 404) {
            console.warn("⚠️ Categories JSON file not found. Using default category.");
            setCategory([{ _id: "all", name: "All Category" }]);
            return;
          }
          throw new Error(`Failed to fetch categories: ${jsonResponse.status}`);
        }
        
        const categoriesData = await jsonResponse.json();
        const categories = [
          { _id: "all", name: "All Category" },
          ...(Array.isArray(categoriesData) ? categoriesData : []),
        ];
        setCategory(categories);
        console.log("✅ Loaded categories from JSON:", categories.length);
      } catch (error) {
        console.error("Failed to fetch categories from JSON", error);
        // Set default category on error
        setCategory([{ _id: "all", name: "All Category" }]);
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

    tracking.trackClick("category_filter", {
      category_id: categoryId,
      category_name: selectedCat?.name || "All Category",
      previous_category: selectedCategory,
      user_id: session?.user._id,
    });

    // Start loading immediately to clear current content
    setIsLoading(true);

    // Update category state

    if (selectedCat) {
      setSelectedCategory(selectedCat.name);
      setSelectedCategoryId(categoryId);
    } else {
      setSelectedCategory("All Category");
      setSelectedCategoryId("all");
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

    setIsLoading(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        setIsSticky(!e.isIntersecting);
      },
      { threshold: [1], rootMargin: "-200px 0px 0px 0px" }
    );

    if (stickyTriggerRef.current) {
      observer.observe(stickyTriggerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

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
    <Suspense
      fallback={
        <div className="min-h-[100vh] flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <SearchParamsProvider onCategoryFromUrl={handleCategoryFromUrl}>

        <div className="min-h-screen bg-white relative">

          {/* Creator Form Dialog */}
          <Dialog open={isCreatorFormOpen} onOpenChange={setIsCreatorFormOpen}>
            <CreatorForm onClose={() => setIsCreatorFormOpen(false)} />
          </Dialog>

          <div className="relative z-10">
            <div ref={heroRef}>
              <Hero />
            </div>

            {/* Guildup Mind & Body Section */}
            <div className="w-full bg-gradient-to-br from-gray-50 to-white py-16 sm:py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                    Discover Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Perfect Expert</span>
                  </h2>
                  <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                    Get specialised guidance and support for your mind and body wellness journey
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                  {/* Guildup Mind Card */}
                  <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 sm:p-10 border border-indigo-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-xl">
                    <div className="absolute top-4 right-4">
                      <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        Guildup Mind
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Connect with mental health professionals, life coaches, and wellness experts. 
                        Find communities focused on mindfulness, personal growth, and emotional well-being.
                      </p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                        Mental Health & Therapy
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                        Life Coaching & Personal Development
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                        Mindfulness & Meditation
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push('/mind')}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 group-hover:scale-105"
                    >
                      Explore Experts
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>

                  {/* Guildup Body Card */}
                  <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 sm:p-10 border border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-xl">
                    <div className="absolute top-4 right-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                        <Dumbbell className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        Guildup Body
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Join fitness communities led by certified trainers, nutritionists, and health experts. 
                        Transform your physical health with personalized guidance and support.
                      </p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Fitness Training & Workouts
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Nutrition & Diet Planning
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Health & Wellness Coaching
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push('/body')}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 group-hover:scale-105"
                    >
                      Explore Experts
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Free Discovery Call Promotional Banner */}
            <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-6 sm:py-12 lg:py-16">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="text-center">
                  <div className="flex justify-center mb-3 sm:mb-6">
                    <div className="p-2 sm:p-4 bg-white/20 rounded-full backdrop-blur-sm animate-pulse">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-4">
                    🎯 Free Discovery Call!
                  </h2>
                  <p className="text-sm sm:text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto mb-4 sm:mb-8 leading-relaxed">
                    <span className="hidden sm:inline">Not sure which expert is right for you? Book a complimentary 15-minute consultation with our specialists to discuss your goals and find your perfect match.</span>
                    <span className="sm:hidden">Book a 15-minute consultation with our top experts.</span>
                  </p>
                  
                  <div className="flex justify-center">
                    <Button
                      onClick={() => router.push('/find-expert')}
                      className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-base sm:text-lg lg:text-xl"
                    >
                      📞 Book Your Free Clarity Call
                    </Button>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-blue-200 mt-3 sm:mt-6">
                    No commitment required • Expert guidance • Personalized recommendations
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[1920px] mx-auto">
              <div className="sticky top-16 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100/30 py-6">
                <div className="px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col gap-6">
                    <h2 className="text-xl font-medium text-gray-800 md:hidden">
                      Browse by Category
                    </h2>
                    <h2 className="hidden md:block text-3xl lg:text-4xl font-light text-gray-900 tracking-tight">
                      Browse <span className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Categories</span>
                    </h2>
                    <div className="overflow-x-auto scrollbar-hide">
                      <div className="min-w-max">
                        <CategoryBar
                          categorys={category}
                          selectCategory={handleCategorySelect}
                          selectedCategoryId={selectedCategory}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content with Enhanced Filtering */}
              <div className="pt-3 sm:pt-6 px-4 sm:px-6 lg:px-8">
                <div className="flex-1 min-w-0" ref={targetRef}>
                  <div className="rounded-xl sm:rounded-2xl">
                    <div
                      id="scroll-target-border"
                      className="w-full h-1 mb-4 sm:mb-8"
                    ></div>
                    {isLoading ? (
                      <Loader />
                    ) : (
                      <EnhancedCommunitySection
                        activeCategory={selectedCategoryId}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA - Free Discovery Call */}
        <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-6 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm sm:text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto mb-4 sm:mb-8 leading-relaxed">
                <span className="hidden sm:inline">Not sure which expert is right for you? Book a complimentary 15-minute consultation with our specialists to discuss your goals and find your perfect match.</span>
                <span className="sm:hidden">Book a 15-minute consultation with our top experts.</span>
              </p>
              
              <div className="flex justify-center">
                <Button
                  onClick={() => router.push('/find-expert')}
                  className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-base sm:text-lg lg:text-xl"
                >
                  📞 Book Your Free Clarity Call
                </Button>
              </div>
              
              <p className="text-xs sm:text-sm text-blue-200 mt-3 sm:mt-6">
                No commitment required • Expert guidance • Personalized recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
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
  );
}

export default Page;
