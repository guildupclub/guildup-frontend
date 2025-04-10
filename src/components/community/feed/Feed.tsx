"use client";

import { useState } from "react";
import { PostCard } from "./PostCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Settings } from "lucide-react";
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

  // Show message for non-signed in users or users without communities
  if (!session ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-premium p-4">
        <div className="flex flex-col items-center space-y-6 max-w-md text-center">
          <FaUsers className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">
            {!session ? "Sign in to view community posts" : "No Communities Joined"}
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

        {/* Filter Bar */}
        {/* <div className="flex items-center gap-4 py-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="">Showing:</span>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] h-8 bg-transparent border-zinc-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background hover:bg-card border-zinc-400">
                <SelectItem value="Your Activity">Your Activity</SelectItem>
                <SelectItem value="All Posts">All Posts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="">Channel:</span>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger className="w-[180px] h-8 bg-transparent border-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="">#</span>
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent className="bg-background border-zinc-400">
                <SelectItem value="Open Discussion">Open Discussion</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="">Sorted By:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-8 bg-transparent border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-zinc-400">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div> */}

        {/* Error state */}
        {error && (
          <div className="py-8 text-center">
            <p className="text-red-500">{StringConstants.ERROR_LOADING_POSTS} {StringConstants.PLEASE_TRY_AGAIN}</p>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-zinc-400">{StringConstants.NO_POST_AVAILABLE}</div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </div>
      </div>
    </div>
  );
}
