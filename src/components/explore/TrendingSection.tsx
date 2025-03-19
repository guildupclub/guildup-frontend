import axios from "axios";
import React, { useEffect, useState } from "react";
import { StringConstants } from "../common/CommonText";

interface TrendingCategory {
  _id: string;
  name: string;
  num_communities: number;
}

function TrendingSection() {
  const [trendingCategories, setTrendingCategories] = useState<TrendingCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("BACKEND_URL", `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}`);
    const fetchTrendingCategories = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category/trending`
        );
        
        if (response && response.data && response.data.r === "s") {
          setTrendingCategories(response.data.data);
        } else {
          console.error("Failed to fetch trending categories", response.data);
        }
      } catch (error) {
        console.error("Error fetching trending categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrendingCategories();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Trending Tags Section */}
      <div className="bg-card p-4 rounded-lg h-[500px] overflow-auto scrollbar-none border border-zinc-200/30">
        <h2 className="text-lg font-semibold mb-3 border-b pb-2 border-zinc-200/50">Trending Tags</h2>
        
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="p-2 border-b border-background">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : trendingCategories.length > 0 ? (
          <div className="space-y-3">
            {trendingCategories.map((category) => (
              <div
                key={category._id}
                className="p-2 border-b border-zinc-200/30 hover:bg-muted/10 transition-colors rounded-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">{category.num_communities} Guilds</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            {StringConstants.NO_TRENDING_CATEGORIES}
          </div>
        )}
      </div>
    </div>
  );
}

export default TrendingSection;
