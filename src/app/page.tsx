"use client";
import { StringConstants } from "@/components/common/CommonText";
import CategoryBar from "@/components/explore/CategoryBar";
import { API_BASE_URL } from "../config/constants";
import CommunitySection from "@/components/explore/CommunitySection";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { setUserFollowedCommunities } from "@/redux/userSlice";
import { useDispatch } from "react-redux";
import React, { useEffect, useRef, useState } from "react";
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

interface Category {
  _id: string;
  name: string;
}

function Page() {
  const { data: session, status } = useSession();
  const [category, setCategory] = useState<Category[]>([]);
  const searchParams = useSearchParams();
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

  // Handle initial category load and URL changes
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

        // Handle category from URL
        const categoryFromUrl = searchParams?.get("category");
        if (categoryFromUrl) {
          const categoryName = urlToCategory(categoryFromUrl);
          const categoryObj = categories.find((cat: Category) => 
            cat.name.toLowerCase() === categoryName.toLowerCase()
          );
          if (categoryObj) {
            setSelectedCategory(categoryObj.name);
            setSelectedCategoryId(categoryObj._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategory();
  }, [searchParams]);

  // Update URL when category changes
  useEffect(() => {
    if (!category.length) return;

    const params = new URLSearchParams(searchParams?.toString() || '');
    if (selectedCategory === "All Category") {
      params.delete("category");
    } else {
      // Convert category name to URL-friendly format
      params.set("category", categoryToUrl(selectedCategory));
    }
    const newUrl = `?${params.toString()}`;
    if (window.location.search !== newUrl) {
      router.push(newUrl, { scroll: false });
    }
  }, [selectedCategory, router, searchParams, category]);

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
    setIsLoading(true); // Start loading
    const selectedCat = category.find((cat: Category) => cat._id === categoryId);
    if (selectedCat) {
      setSelectedCategory(selectedCat.name);
      setSelectedCategoryId(categoryId);
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("category", categoryToUrl(selectedCat.name));
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.pushState({}, "", newUrl);
    } else {
      setSelectedCategory("All Category");
      setSelectedCategoryId("all");
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete("category");
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.pushState({}, "", newUrl);
    }
    
    // Scroll to the first result after a short delay to allow for content to load
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

  return (
    <div className="min-h-[75vh] bg-white relative">
      <div className="absolute inset-0 pointer-events-none" />
      <div ref={heroRef}>
        <Hero />
      </div>
      {!isCreator && (
        <div className="md:hidden mt-4 flex flex-col items-center justify-center text-center mb-4">
          <h2 className="text-2xl font-semibold">
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
      <div ref={stickyTriggerRef} className="w-0 h-0" />
      <div className="w-full max-w-[1920px] mx-auto px-8 lg:px-12 relative bg-white">
        <div className="sticky top-16 z-50 -mx-8 px-8 py-6 bg-white border-b">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {StringConstants.TOP_EXPERTS}
                </h1>
                <span className="text-primary text-base">
                  {category.length - 1} Categories
                </span>
              </div>
              <Dialog open={isCreatorFormOpen} onOpenChange={setIsCreatorFormOpen}>
                <DialogTrigger asChild>
                  <button
                    onClick={handleCreatorButtonClick}
                    className="flex items-center gap-2 px-5 py-2 text-gray-700 hover:text-primary font-medium transition-all duration-200 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50"
                  >
                    <span className="text-amber-400">👋</span>
                    <span>Expert Page</span>
                    <Plus className="h-4 w-4" />
                  </button>
                </DialogTrigger>
                <CreatorForm onClose={() => setIsCreatorFormOpen(false)} />
              </Dialog>
            </div>

            <p className="text-gray-600 text-sm max-w-2xl">
                Discover expert pages curated just for you. Connect with industry leaders, learn from their experiences, and grow your skills.
              </p>

            {/* <motion.div
              animate={{
                height: isSticky ? 0 : "auto",
                opacity: isSticky ? 0 : 1,
                marginBottom: isSticky ? 0 : undefined
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-gray-600 text-lg max-w-2xl">
                Discover expert pages curated just for you. Connect with industry leaders, learn from their experiences, and grow your skills.
              </p>
            </motion.div> */}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="pt-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0" ref={targetRef}>
              <div className="rounded-2xl">
                {isLoading ? (
                  <Loader />
                ) : (
                  <CommunitySection activeCategory={selectedCategoryId} />
                )}
              </div>
            </div>

            {/* Category Section - Right Side */}
            <div className="w-full md:w-80 flex-shrink-0 order-first md:order-last">
              <div className="sticky top-60 z-51">
                <h2 className="hidden md:block text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 mb-6">
                  Browse Categories
                </h2>
                <div className="p-6 rounded-2xl border border-white/20 bg-white shadow-sm">
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
    </div>
  );
}

export default Page;


