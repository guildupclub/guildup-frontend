/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCommunityData } from "@/redux/communitySlice";
import PostCard from "./PostCard";
import CommunityCard from "./CommunityCard";
import { Skeleton } from "@/components/ui/skeleton";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  // Get query params
  const query = searchParams.get("q") || "";
  const type = "community";

  const [searchQuery, setSearchQuery] = useState(query);
  const [searchType, setSearchType] = useState(type);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        const endpoint = "http://localhost:8000/v1/community/look";

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

  // Handle search trigger
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(
      `/search?type=${searchType}&q=${encodeURIComponent(searchQuery)}`
    );
  };

  // Handle card click navigation
  const handleCardClick = (id: string) => {
    router.push(`/${type}/${id}`);
  };

  // Handle community click with Redux
  const handleClickCommunity = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (community: any) => {
      setLoading(true);
      dispatch(
        setCommunityData({
          communityId: community._id,
          userId: community.user_id,
        })
      );

      router.push("/community/profile");
    },
    [dispatch, router]
  );

  return (
    <div className="container mx-auto p-16 py-24 min-h-screen p-auto bg-black">
      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-[292px]">
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
          <h1 className="text-2xl font-bold text-white mb-6">
            Search Results for &quot;{query}&quot;
          </h1>

          {results.length === 0 ? (
            <div className="text-center text-gray-400 p-8">
              <p>No results found</p>
              <p className="text-sm">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
