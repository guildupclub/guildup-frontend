"use client";
import { StringConstants } from "@/components/common/CommonText";
import CategoryBar from "@/components/explore/CategoryBar";
import { API_BASE_URL } from "../config/constants";
import CommunitySection from "@/components/explore/CommunitySection";
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
import { Button } from "@/components/ui/button";

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
    // Handle category from URL
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
    return name.replace(/\s+/g, "-");
  };

  // Convert URL-friendly format back to category name
  const urlToCategory = (url: string) => {
    return url.replace(/-/g, " ");
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
      router.replace("/", { scroll: false });
    } else {
      // Convert category name to URL-friendly format
      router.replace(`?category=${categoryToUrl(selectedCategory)}`, {
        scroll: false,
      });
    }
  }, [selectedCategory, router, category]);

  const handleCreatorButtonClick = () => {
    if (!session) {
      toast("Sign in required", {
        action: {
          label: "Sign In",
          onClick: () =>
            signIn(undefined, {
              callbackUrl: `${window.location.origin}`,
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
    const selectedCat = category.find(
      (cat: Category) => cat._id === categoryId
    );
    if (selectedCat) {
      setSelectedCategory(selectedCat.name);
      setSelectedCategoryId(categoryId);
    } else {
      setSelectedCategory("All Category");
      setSelectedCategoryId("all");
    }

    // Perform scrolling immediately without timeout
    if (targetRef.current) {
      const headerOffset = 150;
      const elementPosition = targetRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }

    // Stop loading immediately
    setIsLoading(false);
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
        <div className="min-h-[75vh] flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <SearchParamsProvider onCategoryFromUrl={handleCategoryFromUrl}>
        <div className="min-h-[100vh] bg-white relative">
          <div className="absolute inset-0 pointer-events-none" />
          <div ref={heroRef}>
            <Hero />
          </div>
          {/* {!isCreator && (
            <div className="md:hidden mt-4 flex flex-col items-center justify-center text-center mb-4 ">
              <h2 className="text-xl font-semibold">
                Join or create a community to start interacting with other
                members.
              </h2>
              <div className="flex gap-4 mt-4">
                <Button onClick={handleScroll} className="px-2 py-1 ">
                  Explore Communities
                </Button>
                <Dialog
                  open={session ? isDialogOpen : false}
                  onOpenChange={setIsDialogOpen}
                >
                  <Button
                    className="px-2 py-1 "
                    onClick={handleCreatorButtonClick}
                  >
                    {StringConstants.CREATE_A_PAGE}
                  </Button>

                  {session && (
                    <CreatorForm onClose={() => setIsDialogOpen(false)} />
                  )}
                </Dialog>
              </div>
            </div>
          )} */}
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative bg-white">
            <div className="py-4 sm:py-8 border-b border-gray-100">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                      Real Experts. Real Solutions.
                    </h1>
                    <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
                  </div>
                  <Dialog
                    open={isCreatorFormOpen}
                    onOpenChange={setIsCreatorFormOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={handleCreatorButtonClick}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-xl hover:shadow-2xl active:scale-[0.98] border-2 border-black"
                      >
                        <span className="hidden sm:inline text-lg">
                          Join Now
                        </span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="sm:hidden font-bold">Join</span>
                      </Button>
                    </DialogTrigger>
                    <CreatorForm onClose={() => setIsCreatorFormOpen(false)} />
                  </Dialog>
                </div>

                <p className="hidden sm:block text-gray-700 font-medium text-lg max-w-3xl leading-relaxed">
                  Stop wasting time with fake gurus and questionable advice. 
                  <span className="font-bold text-gray-900"> Get direct access to verified professionals</span> who actually know what they're talking about.
                </p>
                
                <div className="sm:hidden bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="text-gray-800 font-semibold text-sm">
                    <span className="text-red-600">Stop guessing.</span> Get real answers from real experts.
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky top-16 z-50 bg-white border-b py-1">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-gray-800 md:hidden">
                  Categories
                </h2>
                <h2 className="hidden md:block text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
                  Browse Categories
                </h2>
                <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white">
                  <div className="overflow-x-auto -mx-3 sm:-mx-6 px-3 sm:px-6 scrollbar-hide">
                    <div className="min-w-max">
                      <div className="flex gap-2">
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
            </div>

            {/* Main Content */}
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
                    <CommunitySection activeCategory={selectedCategoryId} />
                  )}
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
