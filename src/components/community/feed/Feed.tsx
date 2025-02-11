"use client";

import { useState, useEffect } from "react";
import { PostCard } from "./PostCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Settings } from "lucide-react";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [filter, setFilter] = useState("Your Activity");
  const [channel, setChannel] = useState("Open Discussion");

  useEffect(() => {
    if (communityId) fetchPosts();
  }, [communityId]);
  console.log(communityId);

  const fetchPosts = async () => {
    try {
      console.log("Community ID:", communityId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/community/post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            communityId: communityId,
            type: "close",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch posts");

      const result = await response.json();
      setPosts(result.data);
      useEffect(() => {
        if (communityId) fetchPosts();
      }, [communityId]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen  py-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h1 className="text-xl font-semibold">Feed</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-4 py-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Showing:</span>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] h-8 bg-transparent border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="Your Activity">Your Activity</SelectItem>
                <SelectItem value="All Posts">All Posts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Channel:</span>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger className="w-[180px] h-8 bg-transparent border-zinc-800">
                <span className="flex items-center gap-1">
                  <span className="text-zinc-400">#</span>
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="Open Discussion">Open Discussion</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Sorted By:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-8 bg-transparent border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6 py-4">
          {isLoading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-zinc-800/30 rounded-lg p-6 space-y-4 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-zinc-700 rounded w-1/4 mb-2" />
                      <div className="h-3 bg-zinc-700 rounded w-1/6" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-700 rounded w-3/4" />
                    <div className="h-4 bg-zinc-700 rounded w-1/2" />
                  </div>
                </div>
              ))
            : posts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      </div>
    </div>
  );
}
