"use client";

import { useState, useEffect } from "react";
import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/button";
import { FileText, Settings } from "lucide-react";
import { useCommunityPosts } from "@/hook/queries/useCommunityQueries";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaUsers } from "react-icons/fa";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
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
  media?: {
    publicUrl: string;
    fileType: string;
  };
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

  const { data: posts = [], isLoading, error } = useCommunityPosts(communityId);

  // Add local state to manage posts for immediate UI updates
  const [localPosts, setLocalPosts] = useState<any[]>([]);

  // Update localPosts when posts from the query change
  useEffect(() => {
    if (posts && posts.length > 0) {
      setLocalPosts(posts);
    }
  }, [posts]);

  // Handle post deletion
  const handlePostDelete = (postId: string) => {
    setLocalPosts((prevPosts) =>
      prevPosts.filter((post) => post._id !== postId)
    );
  };

  // Handle post update
  const handlePostUpdate = (updatedPost: any) => {
    setLocalPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === updatedPost._id ? { ...post, ...updatedPost } : post
      )
    );
  };

  // Show message for non-signed in users or users without communities
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="flex flex-col items-center space-y-6 max-w-md text-center">
          <FaUsers className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">
            {!session
              ? "Sign in to view community posts"
              : "No Communities Joined"}
          </h1>
          <p className="text-muted-foreground">
            {!session
              ? "Please sign in to view and interact with community posts"
              : "Join some communities to start seeing posts"}
          </p>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {StringConstants.EXPLORE_COMMUNITY}
            </Link>
            {!session && (
              <Link
                href="/api/auth/signin"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {StringConstants.SIGN_IN}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Determine which posts to display - use localPosts for immediate UI updates
  const displayPosts = localPosts.length > 0 ? localPosts : posts;

  return (
    <div className="min-h-screen grow py-2 md:py-24">
      <div className="max-w-5xl px-2 md:ps-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-xl border-b border-zinc-300 bg-card px-6 py-3">
          <div className="flex items-center text-muted gap-2">
            <FileText className="w-5 h-5" />
            <h1 className="text-xl font-semibold">{StringConstants.FEED}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="hidden md:block">
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-24 h-8 rounded-md bg-background hover:bg-zinc-300 text-zinc-300 flex justify-end px-2"
            >
              <PostDialog />
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="py-8 text-center">
            <p className="text-red-500">
              {StringConstants.ERROR_LOADING_POSTS}{" "}
              {StringConstants.PLEASE_TRY_AGAIN}
            </p>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader />
            </div>
          ) : displayPosts.length === 0 ? (
            <div className="text-center text-zinc-400">
              {StringConstants.NO_POST_AVAILABLE}
            </div>
          ) : (
            displayPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handlePostDelete}
                onUpdate={handlePostUpdate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
