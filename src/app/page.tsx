"use client";
import CategoryBar from "@/components/explore/CategoryBar";
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
import Hero from "@/components/heroSection/HeroSection";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreatorForm from "@/components/form/CreatorForm";
import { toast } from "sonner";
import { useSession, signIn } from "next-auth/react";
import Loader from "@/components/Loader";
import { ArrowRight } from "lucide-react";
import { motion, useScroll } from "framer-motion";
import { setHeroVisible } from "@/redux/uiSlice";
import { Button } from "@/components/ui/button";
import BenefitCards from "@/components/heroSection/BenefitCards";
import VideoPlaceholder from "@/components/VideoPlaceholder";
import Footer from "@/components/layout/Footer";
import { on } from "events";

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

  
  const handleCreatorButtonClick = () => {
    if (!session) {
      signIn(undefined, {
        callbackUrl: window.location.origin,
      });
    }
  };

  const handleScroll = () => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setIsLoading(true);

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
                          className="group w-full relative overflow-hidden flex items-center justify-center gap-2 px-6 py-4  font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
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
                          className="group relative overflow-hidden flex items-center gap-3  hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-[0.98] px-6"
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
    </Suspense>
  );
}

export default Page;
