"use client";
import { StringConstants } from "@/components/common/CommonText";
import CategoryBar from "@/components/explore/CategoryBar";
import { API_BASE_URL } from "../config/constants";
import CommunitySection from "@/components/explore/CommunitySection";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { setUserFollowedCommunities } from "@/redux/userSlice";
import { useDispatch } from "react-redux";
import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/explore/Header";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

function Page() {
  const { data: session, status } = useSession();
  const [category, setCategory] = useState<any>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const user = useSelector((state: RootState) => state.user);
  const isCreator = user?.user?.is_creator ? true : false;

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

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        console.log("BACKEND_URL", process.env.NEXT_PUBLIC_BACKEND_BASE_URL);
        console.log("BACKENDURL_FROM_POST", API_BASE_URL);
        console.log("NEXTAUTH_URL", process.env.NEXTAUTH_URL);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category`
        );

        setCategory([
          { _id: "all", name: "All Category" },
          ...response.data.data,
        ]);
        setSelectedCategory("all");
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategory();
  }, []);

  if (status === "loading" || !isMounted) {
    return <div>{StringConstants.LOADING}</div>;
  }

  // const handleCreatorButtonClick = () => {
  //   if (!session) {
  //     toast("Sign in required", {
  //       action: {
  //         label: "Sign In",
  //         onClick: () => signIn(undefined, {
  //           callbackUrl: `${window.location.origin}?hero=1`
  //         }),
  //       },
  //     });
  //   } else {
  //     setIsDialogOpen(true);
  //   }
  // };

  return (
    <div className="min-h-[75vh] mesh-gradient relative"> {/* Changed from min-h-screen to min-h-[75vh] */}
      <div className="absolute inset-0 grid-overlay pointer-events-none" />
      
      <Header />
      
      <div className="w-full max-w-[1920px] mx-auto px-8 lg:px-12 relative">
        {/* Header section with background to prevent content from showing through */}
        <div className="sticky top-16 z-20 -mx-8 px-8 bg-premium backdrop-blur-md">
          <div className="flex items-start justify-between py-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
                {StringConstants.TOP_PAGES}
              </h1>
              <p className="mt-2 text-gray-600 text-sm">
                Discover expert communities curated just for you
              </p>
            </div>
          </div>
        </div>
        
        {/* Scrollable content with padding to account for sticky header */}
        <div className="pt-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0" ref={targetRef}>
              <div className="rounded-2xl border border-white/20">
                <CommunitySection 
                  activeCategory={selectedCategory} 
                />
              </div>
            </div>

            {/* Category Section - Right Side */}
            <div className="w-full md:w-80 flex-shrink-0 order-first md:order-last">
              <div className="sticky top-40">
                <h2 className="hidden md:block text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 mb-6">
                  Browse Categories
                </h2>
                <div className="p-6 rounded-2xl border border-white/20">
                  <CategoryBar categorys={category} selectCategory={setSelectedCategory} />
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
