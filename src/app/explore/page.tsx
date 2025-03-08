"use client";
import CategoryBar from "@/components/explore/CategoryBar";
import CommunitySection from "@/components/explore/CommunitySection";
import TrendingSection from "@/components/explore/TrendingSection";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";

function Page() {
  const [category, setCategory] = useState<any>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Set isMounted to true after the component is mounted on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  //Redirect to Google auth if not authenticated, but only on the client side
  // useEffect(() => {
  //   if (isMounted && status !== "loading" && !session) {
  //     signIn("google"); // Redirect to Google authentication
  //   }
  // }, [session, status, isMounted]);

  useEffect(() => {
    const fetchCategory = async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category`
      );
      setCategory(response.data.data);
      setSelectedCategory(response.data.data[0]?._id || "");
    };
    fetchCategory();
  }, []);

  // Render nothing while loading or redirecting
  if (status === "loading" || !isMounted) {
    return <div>Loading...</div>; // You can add a loading spinner here
  }

  return (
    <div className="bg-background">
        <CategoryBar
          categorys={category}
          selectCategory={setSelectedCategory}
        />
      <div className="w-full lg:px-[100px] ">
        <div className="p-6 sm:px-0">
          <div className="flex gap-6 md:justify-between">
            <div className="">
              <h1 className="text-xl lg:text-2xl font-bold mb-4">
                Top Communities
              </h1>
              <CommunitySection activeCategory={selectedCategory} />
            </div>

            <div className="col-span-1  hidden md:block w-60">
              <h1 className="text-2xl font-bold mb-4">Trending Tags</h1>
              <TrendingSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
