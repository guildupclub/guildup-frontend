"use client";
import CategoryBar from "@/components/explore/CategoryBar";
import CommunitySection from "@/components/explore/CommunitySection";
import TrendingSection from "@/components/explore/TrendingSection";
import axios from "axios";
import React, { useEffect, useState } from "react";

function page() {
  const [category, setCategory] = useState<any>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    category.length > 0 ? category[0]._id : ""
  );
  useEffect(() => {
    const fetchCategory = async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category`
      );
      console.log("@category", response.data.data);
      setCategory(response.data.data);
      setSelectedCategory(response.data.data[0]);
    };
    fetchCategory();
  }, []);
  useEffect(() => {
    console.log("@SelectedCategory", selectedCategory);
  }, [selectedCategory]);
  return (
    <div className="pl-12 pr-12 bg-black">
      <div className="w-screen overflow-scroll whitespace-nowrap bg-black [&::-webkit-scrollbar]:hidden">
        <CategoryBar
          categorys={category}
          selectCategory={setSelectedCategory}
        />
      </div>
      <div className="bg-black p-6">
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {/* Top Communities Section */}
    <div className="md:col-span-2 lg:col-span-3">
      <h1 className="bg-black pt-4 pb-4 text-white text-[24px]">Top Communities</h1>
      <CommunitySection activeCategory={selectedCategory} />
    </div>

    {/* Trending Section */}
    <div className="col-span-1">
      <h1 className="bg-black pt-4 pb-4 text-white text-[24px]">Trending</h1>
      <TrendingSection />
    </div>
  </div>
</div>


    </div>
  );
}

export default page;
