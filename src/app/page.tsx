"use client";
import { StringConstants } from "@/components/common/CommonText";
import CategoryBar from "@/components/explore/CategoryBar";
import { API_BASE_URL } from "../config/constants";
import CommunitySection from "@/components/explore/CommunitySection";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { setUserFollowedCommunities } from "@/redux/userSlice";
import { useDispatch } from "react-redux";
import React, { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Hero from "@/components/heroSection/HeroSection";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreatorForm from "@/components/form/CreatorForm";
import { toast } from "sonner";
import { useSession, signIn } from "next-auth/react";
import Loader from "@/components/Loader";
import { ArrowRight, Plus } from "lucide-react";
import { motion, useScroll } from "framer-motion";
import { setHeroVisible } from "@/redux/uiSlice";

interface Category {
  _id: string;
  name: string;
}

// Component to handle search params with Suspense
function SearchParamsProvider({ children, onCategoryFromUrl }: { 
  children: React.ReactNode,
  onCategoryFromUrl: (category: string | null) => void 
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Handle category from URL
    const categoryFromUrl = searchParams?.get("category");
    onCategoryFromUrl(categoryFromUrl ?? null);
  }, [searchParams, onCategoryFromUrl]);
  
  return children;
}

function Page() {
  const { data: session, status } = useSession();
  const [category, setCategory] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Category");
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || status === "loading") return;

    if (!session) {
      router.push("/");
    } else {
      const fetchCommunities = async () => {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user/follow`,
            {
              userId: session?.user._id,
            }
          );
          dispatch(setUserFollowedCommunities(res.data.data));
        } catch (error) {
          console.error(error);
        }
      };
      fetchCommunities();

      if (session.user?.isNewUser) {
        setIsModalOpen(true);
      }
    }
  }, [session, status, isMounted, router]);

  // Convert category name to URL-friendly format
  const categoryToUrl = (name: string) => {
    return name.replace(/\s+/g, '-');
  };

  // Convert URL-friendly format back to category name
  const urlToCategory = (url: string) => {
    return url.replace(/-/g, ' ');
  };

  // Fetch categories
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

  // Update URL when category changes
  useEffect(() => {
    if (!category.length) return;

    if (selectedCategory === "All Category") {
      router.replace('/', { scroll: false });
    } else {
      // Convert category name to URL-friendly format
      router.replace(`?category=${categoryToUrl(selectedCategory)}`, { scroll: false });
    }
  }, [selectedCategory, router, category]);

  const handleCreatorButtonClick = () => {
    if (!session) {
      toast("Sign in required", {
        action: {
          label: "Sign In",
          onClick: () =>
            signIn(undefined, {
              callbackUrl: `${window.location.origin}?hero=1`,
            }),
        },
      });
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleScroll = () => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    // Start loading immediately to clear current content
    setIsLoading(true);
    
    // Update category state
    const selectedCat = category.find((cat: Category) => cat._id === categoryId);
    if (selectedCat) {
      setSelectedCategory(selectedCat.name);
      setSelectedCategoryId(categoryId);
    } else {
      setSelectedCategory("All Category");
      setSelectedCategoryId("all");
    }
    
    // Scroll and stop loading
    setTimeout(() => {
      if (targetRef.current) {
        const headerOffset = 180;
        const elementPosition = targetRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
      setIsLoading(false); // Stop loading after scroll
    }, 500);
  };

  // Add scroll handler to detect when header becomes sticky
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        setIsSticky(!e.isIntersecting);
      },
      { threshold: [1], rootMargin: "-200px 0px 0px 0px" } // 64px (top-16) + 20px offset
    );

    if (stickyTriggerRef.current) {
      observer.observe(stickyTriggerRef.current);
    }


    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle category from URL
  const handleCategoryFromUrl = useCallback((categoryFromUrl: string | null) => {
    if (categoryFromUrl && category.length > 0) {
      const categoryName = urlToCategory(categoryFromUrl);
      const categoryObj = category.find((cat: Category) => 
        cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (categoryObj) {
        setSelectedCategory(categoryObj.name);
        setSelectedCategoryId(categoryObj._id);
      }
    }
  }, [category]);

  // Add scroll handler to detect when hero section is visible
  useEffect(() => {
    if (!heroRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Consider the hero "visible" only if more than 20% is showing
        // This means the search bar appears when 80% or more is out of view
        const visiblePercentage = entry.intersectionRatio;
        dispatch(setHeroVisible(visiblePercentage > 0.2));
      },
      { 
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: "0px 0px 0px 0px"
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
    <Suspense fallback={<div className="min-h-[75vh] flex items-center justify-center"><Loader /></div>}>
      <SearchParamsProvider onCategoryFromUrl={handleCategoryFromUrl}>
        <div className="min-h-[75vh] bg-white relative">
          <div className="absolute inset-0 pointer-events-none" />
          <div ref={heroRef}>
            <Hero />
          </div>
          {!isCreator && (
            <div className="md:hidden mt-4 flex flex-col items-center justify-center text-center mb-4">
              <h2 className="text-xl font-semibold">
                Join or create a community to start interacting with other members.
              </h2>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleScroll}
                  className="px-2 py-1 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Explore Communities
                </button>
                <Dialog
                  open={session ? isDialogOpen : false}
                  onOpenChange={setIsDialogOpen}
                >
                  <button
                    className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={handleCreatorButtonClick}
                  >
                    {StringConstants.CREATE_A_PAGE}
                  </button>

                  {session && <CreatorForm onClose={() => setIsDialogOpen(false)} />}
                </Dialog>
              </div>
            </div>
          )}
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative bg-white">
            <div className="sticky top-16 z-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 sm:py-6 bg-white border-b">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {StringConstants.TOP_EXPERTS}
                  </h1>
                  <Dialog open={isCreatorFormOpen} onOpenChange={setIsCreatorFormOpen}>
                    <DialogTrigger asChild>
                      <button
                        onClick={handleCreatorButtonClick}
                        className="flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2 text-gray-700 hover:text-primary font-medium transition-all duration-200 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50"
                      >
                        <span className="text-amber-400 hidden sm:inline">👋</span>
                        <span>Expert Page</span>
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </DialogTrigger>
                    <CreatorForm onClose={() => setIsCreatorFormOpen(false)} />
                  </Dialog>
                </div>
  
                <p className="hidden sm:block text-gray-600 text-sm max-w-2xl description-text">
                  Discover expert pages curated just for you. Connect with industry leaders, learn from their experiences, and grow your skills.
                </p>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="pt-3 sm:pt-6">
              <div className="flex flex-col md:flex-row gap-5 sm:gap-8">
                {/* Category Section - Top on Mobile, Right on Desktop */}
                <div className="w-full md:w-80 flex-shrink-0 order-first md:order-last mb-3 md:mb-0">
                  <div className="md:sticky top-60 z-51">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2 md:hidden">
                      Categories
                    </h2>
                    <h2 className="hidden md:block text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 mb-6">
                      Browse Categories
                    </h2>
                    <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-zinc-200 bg-white sm:shadow-sm">
                      <CategoryBar
                        categorys={category}
                        selectCategory={handleCategorySelect}
                        selectedCategoryId={selectedCategory}
                      />
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0" ref={targetRef}>
                  <div className="rounded-xl sm:rounded-2xl">
                    <div id="scroll-target-border" className="w-full h-1 mb-4 sm:mb-8"></div>
                    {isLoading ? (
                      <Loader />
                    ) : (
                      <CommunitySection activeCategory={selectedCategoryId} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SearchParamsProvider>
    </Suspense>
  );
}

export default Page;


