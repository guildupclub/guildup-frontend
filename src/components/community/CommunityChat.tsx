"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Send, Mic } from "lucide-react";
import { Sidebar } from "./SideBar";
import { PostCard } from "./PostCard";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

interface Post {
  id: string;
  author: string;
  time: string;
  level: number;
  content: string;
  likes: number;
  comments: number;
  avatar: string;
}

function ChatContent() {
  const activeChannel = useSelector(
    (state: RootState) => state.channel.activeChannel
  );
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const sessionId = useSelector((state: RootState) => state.user.sessionId);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchChannelContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:8000/v1/channel/fetch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            session: sessionId,
            channelId: "678c1e4fdf00b0951cfade8f",
            page: 0,
            limit: 20,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch channel content");
        }

        const data = await response.json();

        // Assuming `data.posts` contains the array of posts
        setPosts(data.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchChannelContent();
  }, []);

  const handleLike = (postId: string) => {
    setPosts(posts.map((post) => (post.id === postId ? { ...post } : post)));
  };

  const handleComment = (postId: string, comment: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, comments: post.comments + 1 } : post
      )
    );
  };

  if (loading) {
    return <div className="text-center py-10">Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error: {error}. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen pb-20">
      <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-6 py-3 my-3 mx-2">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium">
            # {activeChannel?.name || "Channel"}
          </h1>
        </div>
        <Button variant="ghost" size="icon" className="hover:bg-zinc-800">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full ">
          <div className="px-6 py-4 space-y-6 ">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                {...post}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="fixed bottom-0 w-[calc(100%-20rem)] px-8 pr-28 py-2">
        <div className="flex items-center gap-2 rounded-lg p-1 bg-zinc-900 px-2">
          <input
            type="text"
            placeholder="Share your thoughts..."
            className="flex-1 bg-transparent text-zinc-200 text-sm placeholder-zinc-400 focus:outline-none"
          />
          <div className="flex gap-8 px-2 py-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-zinc-800"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button className="bg-primary-gradient px-6">Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommunityChat() {
  return <ChatContent />;
}
