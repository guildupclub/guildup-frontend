"use client";

import CategoryBar from "@/components/explore/CategoryBar";
import EnhancedCommunitySection from "@/components/community/enhanced-community-section";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
  useEffect,
  useRef,
  useState,
  Suspense,
  useCallback,
  useMemo,
} from "react";
import Hero from "@/components/heroSection/HeroSection";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreatorForm from "@/components/form/CreatorForm";
import Loader from "@/components/Loader";
import { ArrowRight } from "lucide-react";
import { motion, useScroll } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTracking } from "@/hooks/useTracking";
import { PageTracker } from "@/components/analytics/PageTracker";


import BenefitCards from "@/components/heroSection/BenefitCards";
import VideoPlaceholder from "@/components/VideoPlaceholder";
import Footer from "@/components/layout/Footer";
import { FaArrowRightLong } from "react-icons/fa6";
import { HiSparkles } from "react-icons/hi2";

// New architecture imports
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { useToast } from "@/contexts/ToastContext";
import { useCategories } from "@/hooks/api/useExploreQueries";
import { useUserCommunities } from "@/hooks/api/useCommunityQueries";

// Category URL formatting utilities
const formatCategoryUrl = (name: string) => name.replace(/\s+/g, "-");
const parseCategoryUrl = (url: string) => url.replace(/-/g, " ");

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
  const { user, isAuthenticated, login } = useAuth();
  const tracking = useTracking();
  const router = useRouter();

  // Fetch categories using the new hook
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  
  // Fetch user communities if authenticated
  // Temporarily disabled to prevent infinite re-rendering until backend API is 
  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string>("All Category");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isCreatorFormOpen, setIsCreatorFormOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Refs
  const targetRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const stickyTriggerRef = useRef<HTMLDivElement>(null);

  // Prepare categories data - memoized to prevent recreation
  const categories = useMemo(() => {
    return categoriesData ? [
      { _id: "all", name: "All Category" },
      ...categoriesData,
    ] : [];
  }, [categoriesData]);

  const isCreator = user?.is_creator || false;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track page views and handle authentication - optimized to prevent re-renders
  const hasTrackedRef = useRef(false);
  
  useEffect(() => {
    if (!isMounted || hasTrackedRef.current) return;

    if (!isAuthenticated) {
      tracking.trackCustomEvent("home_page_viewed_anonymous", {
        is_initial_load: isInitialLoad,
      });
      hasTrackedRef.current = true;
    } else if (user) {
      // Track authenticated user viewing home page
      tracking.trackCustomEvent("home_page_viewed_authenticated", {
        user_id: user.id,
        is_new_user: user.isNewUser,
        is_creator: user.is_creator,
        is_initial_load: isInitialLoad,
      });

      // Identify user for PostHog
      tracking.identifyUser(user.id, {
        email: user.email,
        name: user.name,
        is_creator: user.is_creator,
        signup_date: user.createdAt,
      });

      // Show modal for new users
      if (user.isNewUser && !isModalOpen) {
        tracking.trackCustomEvent("new_user_modal_shown", {
          user_id: user.id,
        });
        setIsModalOpen(true);
      }
      
      hasTrackedRef.current = true;
    }

    // Mark initial load as complete
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isAuthenticated, user, isMounted, isInitialLoad, isModalOpen, tracking]);

  // Handle URL category changes - using ref to prevent loops
  const isUpdatingUrlRef = useRef(false);
  
  useEffect(() => {
    if (!categories.length || !isMounted || isInitialLoad || isUpdatingUrlRef.current) return;

    isUpdatingUrlRef.current = true;
    
    const updateUrl = async () => {
      if (selectedCategory === "All Category") {
        router.replace("/", { scroll: false });
      } else {
        router.replace(`?category=${formatCategoryUrl(selectedCategory)}`, {
          scroll: false,
        });
      }
      
      // Reset flag after a brief delay
      setTimeout(() => {
        isUpdatingUrlRef.current = false;
      }, 100);
    };

    updateUrl();
  }, [selectedCategory, router, categories, isMounted, isInitialLoad]);

  const handleCreatorButtonClick = useCallback(() => {
    // Track the creator button click
    tracking.trackClick("creator_signup_button", {
      section: "header",
      user_signed_in: !!isAuthenticated,
      user_id: user?.id,
    });

    if (!isAuthenticated) {
      tracking.trackUserAction("signup_prompt_shown", {
        trigger: "creator_button",
        location: "home_page",
      });

      tracking.trackClick("signin_from_redirect", {
        trigger: "creator_button_prompt",
      });

      // Trigger OAuth login
      login({ email: "", password: "" });
      return;
    }

    tracking.trackUserAction("creator_form_opened", {
      source: "header_button",
      user_id: user?.id,
    });

    setIsDialogOpen(true);
  }, [tracking, isAuthenticated, user?.id, login]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    // Prevent unnecessary updates if same category is selected
    if (categoryId === selectedCategoryId) return;
    
    // Track category selection
    const selectedCat = categories.find(
      (cat: Category) => cat._id === categoryId
    );

    tracking.trackClick("category_filter", {
      category_id: categoryId,
      category_name: selectedCat?.name || "All Category",
      previous_category: selectedCategory,
      user_id: user?.id,
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
  }, [selectedCategoryId, categories, tracking, selectedCategory, user?.id]);

  // Intersection observer for sticky behavior
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
      if (categoryFromUrl && categories.length > 0) {
        const categoryName = parseCategoryUrl(categoryFromUrl);
        const categoryObj = categories.find(
          (cat: Category) =>
            cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        if (categoryObj && categoryObj.name !== selectedCategory) {
          setSelectedCategory(categoryObj.name);
          setSelectedCategoryId(categoryObj._id);
        }
      }
    },
    [categories, selectedCategory]
  );

  // Hero visibility tracking (removed Redux dependency)
  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visiblePercentage = entry.intersectionRatio;
        // Hero visibility can be tracked without Redux if needed
        // or handled locally for any UI state changes
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
  }, [heroRef]);

  if (categoriesLoading) {
    return (
      <div className="min-h-[100vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

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
          {/* Grid pattern background for entire page */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div
              className="absolute inset-0 opacity-[0.35] animate-pulse"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.6) 2px, transparent 0)
                `,
                backgroundSize: "40px 40px",
                animation: "gridMove 20s ease-in-out infinite",
              }}
            />
          </div>

          <Dialog open={isCreatorFormOpen} onOpenChange={setIsCreatorFormOpen}>
            <DialogTrigger asChild>
              {!isCreator && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 py-2 w-full h-10 text-white text-sm font-semibold text-center flex items-center justify-center relative z-20 mt-16 mx-auto">
                  <HiSparkles className="h-6 w-6 text-yellow-300 mx-2" /> Join
                  as Expert
                  <FaArrowRightLong
                    onClick={handleCreatorButtonClick}
                    className="h-5 w-5 ml-4 animate-arrow-bounce hover:scale-x-150 transition-transform duration-300 cursor-pointer"
                  />
                </div>
              )}
            </DialogTrigger>
            <CreatorForm onClose={() => setIsCreatorFormOpen(false)} />
          </Dialog>

          <div className="relative z-10">
            <div ref={heroRef}>
              <Hero />
            </div>

            {/* Video Showcase Section */}
            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
              <div className="text-center mb-8 sm:mb-12">
                <motion.h2
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  See GuildUp in{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Action
                  </span>
                </motion.h2>
                <motion.p
                  className="text-gray-600 text-lg max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Watch how our platform connects you with expert coaches and
                  transforms your growth journey
                </motion.p>
              </div>
              <VideoPlaceholder className="mb-16" />
            </div>

            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative bg-white">
              <div className="py-6 sm:py-10 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/30">
                <div className="flex flex-col gap-6 sm:gap-8">
                  {/* Mobile Layout */}
                  <div className="sm:hidden space-y-6">
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                          Real Experts.
                          <br />
                          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                            Real Solutions.
                          </span>
                        </h1>
                        <div className="w-16 h-1.5 bg-gradient-to-r from-primary to-primary/70 rounded-full mx-auto shadow-sm"></div>
                      </div>
                      <p className="text-gray-600 text-sm max-w-xs mx-auto">
                        GuildUp brings real experts together in one easy
                        place—so you can get support without the stress.
                      </p>
                    </div>

                    <BenefitCards />

                    <Dialog
                      open={isCreatorFormOpen}
                      onOpenChange={setIsCreatorFormOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={handleCreatorButtonClick}
                          className="group w-full relative overflow-hidden flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          <span className="relative z-10 font-medium">
                            Join as Expert{" "}
                          </span>
                          <ArrowRight className="relative z-10 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </DialogTrigger>
                      <CreatorForm
                        onClose={() => setIsCreatorFormOpen(false)}
                      />
                    </Dialog>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <h1 className="text-3xl sm:text-2xl lg:text-4xl font-black text-gray-900 tracking-tight">
                          Real Experts.{" "}
                          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                            Real Solutions.
                          </span>
                        </h1>
                        <div className="w-20 h-1.5 bg-gradient-to-r from-primary to-primary/70 rounded-full shadow-sm"></div>
                      </div>
                      <p className="text-gray-600 text-md font-medium max-w-lg">
                        GuildUp brings real experts together in one easy
                        place—so you can get support without the stress.
                      </p>
                    </div>
                    <Dialog
                      open={isCreatorFormOpen}
                      onOpenChange={setIsCreatorFormOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={handleCreatorButtonClick}
                          className="group relative overflow-hidden flex items-center gap-3 hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-[0.98] px-6"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          <span className="relative z-10">Join as Expert</span>
                          <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </DialogTrigger>
                      <CreatorForm
                        onClose={() => setIsCreatorFormOpen(false)}
                      />
                    </Dialog>
                  </div>
                </div>
              </div>

              <div className="sticky top-16 z-50 bg-white border-b py-1">
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold text-gray-800 md:hidden">
                    Categories
                  </h2>
                  <h2 className="hidden md:block text-xl lg:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
                    Browse Categories
                  </h2>
                  <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white">
                    <div className="overflow-x-auto -mx-3 sm:-mx-6 px-3 sm:px-6 scrollbar-hide">
                      <div className="min-w-max">
                        <div className="flex gap-2">
                          <CategoryBar
                            categorys={categories}
                            selectCategory={handleCategorySelect}
                            selectedCategoryId={selectedCategory}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content with Enhanced Filtering */}
              <div className="pt-3 sm:pt-6">
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

        {/* White spacing before footer */}
        <div className="bg-white py-8"></div>

        {/* Footer */}
        <Footer />
      </SearchParamsProvider>
      <PageTracker
        pageName="Home"
        pageCategory="landing"
        metadata={{
          selected_category: selectedCategory,
          selected_category_id: selectedCategoryId,
          user_signed_in: !!isAuthenticated,
          user_id: user?.id,
          is_creator: user?.is_creator,
          is_new_user: user?.isNewUser,
          categories_count: categories.length,
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
