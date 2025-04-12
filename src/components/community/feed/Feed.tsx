"use client";

import { useState } from "react";
import { PostCard } from "./PostCard";
import { useCommunityPosts } from "@/hook/queries/useCommunityQueries";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaUsers } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Loader from "@/components/Loader";
import { StringConstants } from "@/components/common/CommonText";
import { PostDialog } from "../Event/CreateEventDialouge";

interface Post {
  _id: string;
  title: string;
  body: string;
  user_id: string;
  up_votes: number;
  down_votes: number;
  reply_count: number;
  created_At: string;
  is_locked: boolean;
  post_type: string;
}

interface FeedProps {
  communityId: string;
}

export function Feed({ communityId }: FeedProps) {
  const { data: session } = useSession();
  const userFollowedCommunities = useSelector(
    (state: RootState) => state.user.userFollowedCommunities
  );
  
  const [sortBy, setSortBy] = useState("newest");
  const [filter, setFilter] = useState("Your Activity");
  const [channel, setChannel] = useState("Open Discussion");

  const { 
    data: posts = [], 
    isLoading, 
    error 
  } = useCommunityPosts(communityId);

  return (
    <div className="space-y-6 px-4">
      {/* Header Section - More elegant styling */}
      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
          Feed
        </h2>
        <div className="ml-auto">
          <PostDialog />
        </div>
      </div>

      {/* Error Message - Refined styling */}
      {error && (
        <div className="flex items-center justify-center p-4 bg-red-50 rounded-xl">
          <p className="text-red-600 font-medium">
            {StringConstants.ERROR_LOADING_POSTS} {StringConstants.PLEASE_TRY_AGAIN}
          </p>
        </div>
      )}

      {/* Posts List - Enhanced styling */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-xl">
            <p className="text-lg font-medium text-gray-600">
              {StringConstants.NO_POST_AVAILABLE}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <PostCard post={post} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sign In State - Premium styling */}
      {!session && (
        <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl bg-gradient-to-b from-white to-gray-50 border border-gray-100 shadow-sm p-12">
          <div className="bg-primary/5 p-4 rounded-full mb-6">
            <FaUsers className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
            Sign in to view community posts
          </h2>
          <p className="text-gray-600 mb-8 text-center max-w-md">
            Please sign in to view and interact with community posts
          </p>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 bg-white shadow-sm transition-colors duration-200"
            >
              {StringConstants.EXPLORE_COMMUNITY}
            </Link>
            <Link
              href="/api/auth/signin"
              className="px-6 py-2.5 bg-primary text-white rounded-lg shadow-sm transition-colors duration-200"
            >
              {StringConstants.SIGN_IN}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
