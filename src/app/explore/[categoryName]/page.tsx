"use client";

import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setCommunityData } from "@/redux/communitySlice";
import { setActiveCommunity } from "@/redux/channelSlice";
import MemoizedCommunityCard from "@/components/explore/MemoizedCommunityCard";

interface Community {
  _id: string;
  user_id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryName = params.categoryName as string;
  const categoryId = searchParams.get("id"); // Get the ID directly from the URL

  const dispatch = useDispatch();
  const router = useRouter();
  const loggedInUserId = useSelector(
    (state: RootState) => state.user.user?._id
  );

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [clickLoading, setClickLoading] = useState(false);

  // Fetch communities based on the category ID from URL
  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        let response;
        const limits = 100;

        if (categoryName === "all") {
          response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/all?limit=${limits}`
          );
        } else if (categoryId) {
          response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/look`,
            {
              categoryId: categoryId,
            }
          );
        }

        if (
          response &&
          response.data &&
          response.data.r === "s" &&
          Array.isArray(response.data.data)
        ) {
          setCommunities(response.data.data);
        } else {
          console.error("Invalid response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching communities", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId || categoryName === "all") {
      fetchCommunities();
    }
  }, [categoryId, categoryName]);

  const handleClickCommunity = useCallback(
    (communityWrapper: { community: Community }) => {
      const community = communityWrapper.community;

      if (!community || !community._id) {
        console.error("Invalid community data:", community);
        return;
      }

      setClickLoading(true);

      dispatch(
        setCommunityData({
          communityId: community._id,
          userId: community.user_id,
        })
      );

      dispatch(
        setActiveCommunity({
          id: community._id,
          name: community.name,
        })
      );

      router.push(`/community/${community._id}/profile`);
    },
    [dispatch, router]
  );

  return (
    <div className="container mx-auto px-4 py-8 w-[80%]">
      <h1 className="text-2xl font-bold mb-3 mt-12">
        <span>Top Pages of </span>{" "}
        {categoryName === "all"
          ? "All Communities"
          : `${decodeURIComponent(categoryName)} Communities`}
      </h1>

      <div className="bg-background min-h-screen lg:py-4">
        {loading ? (
          <p className="text-center mt-4">Loading...</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 pb-8 z-0 lg:pb-0">
            {communities.length > 0 ? (
              communities.map((communityWrapper) => (
                <MemoizedCommunityCard
                  key={communityWrapper._id}
                  community={communityWrapper}
                  onClick={() => handleClickCommunity(communityWrapper)}
                />
              ))
            ) : (
              <p className="text-center col-span-3 py-8 text-muted-foreground">
                No communities found for this category
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
