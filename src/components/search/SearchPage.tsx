"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCommunityData } from "@/redux/communitySlice";
import PostCard from "./PostCard";
import CommunityCard from "./CommunityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/config/constants";
import { StringConstants } from "../common/CommonText";
import { setActiveCommunity } from "@/redux/channelSlice";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Community {
  _id: string;
  name: string;
  user_id: string;
  description: string;
  imageUrl: string;
  image: string;
  background_image: string;
  user_isBankDetailsAdded: boolean;
  user_iscalendarConnected: boolean;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  // Get query params
  const query = searchParams?.get("q") || "";
  const type = "community";

  const [searchQuery, setSearchQuery] = useState(query);
  const [searchType, setSearchType] = useState(type);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch search results when query or type changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;

      setLoading(true);
      setError("");

      try {
        const endpoint = `${API_BASE_URL}/v1/community/look`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            page: 0,
          }),
        });

        const data = await response.json();

        if (data.r === "s") {
          setResults(data.data);
        } else {
          setError("Failed to fetch results");
        }
      } catch (err) {
        setError("An error occurred while fetching results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, type]);

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    router.push(`/api/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Handle card click navigation
  const handleCardClick = (id: string) => {
    router.push(`/${type}/${id}`);
  };

  // Handle community click with Redux
  const handleClickCommunity = useCallback(
    (communityData: { community: Community }) => {
      if (!communityData.community || !communityData.community._id) {
        console.error("Invalid community data:", communityData);
        return;
      }

      setLoading(true);

      dispatch(
        setCommunityData({
          communityId: communityData.community._id,
          userId: communityData.community.user_id,
        })
      );

      // @ts-ignore - Ignoring type mismatch as the action only needs id and name
      dispatch(
        setActiveCommunity({
          id: communityData.community._id,
          name: communityData.community.name,
          image: "",
          background_image: "",
          user_isBankDetailsAdded: false,
          user_iscalendarConnected: false
        })
      );
      const cleanedCommunityName = communityData.community.name
        ? communityData.community.name
            .replace(/\s+/g, "-")
            .replace(/\|/g, "-")
            .replace(/-+/g, "-")
        : "";
      const encodedCommunityName = encodeURIComponent(cleanedCommunityName);
      const communityParams = `${encodedCommunityName}-${communityData.community._id}`;
      router.push(`/community/${communityParams}/profile`);
    },
    [dispatch, router]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-full">
                <Skeleton className="h-[100px] w-full rounded-lg mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 p-4 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
              {results.length} {results.length === 1 ? "result" : "results"} for
              &quot;{query}&quot;
            </h1>

            {results.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600 mb-2">
                  {StringConstants.NO_RESULTS_FOUND}
                </p>
                <p className="text-gray-500">
                  {StringConstants.TRY_SEARCH_WITH_DIFFERENT_KEYWORDS}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
                {results.map((result) => (
                  <CommunityCard
                    key={result._id}
                    community={result}
                    onClick={() => handleClickCommunity(result)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
