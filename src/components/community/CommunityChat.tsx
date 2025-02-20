"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Send } from "lucide-react";
import { PostCard } from "./PostCard";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { API_BASE_URL } from "@/config/constants";

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

interface UserData {
  _id: string;
  name: string;
  image: string;
}

function ChatContent() {
  const activeChannel = useSelector(
    (state: RootState) => state.channel.activeChannel
  );

  const activeChannelId = activeChannel?.id || null;
  const userId = useSelector((state: RootState) => state.user.user?.id);
  const sessionId = useSelector((state: RootState) => state.user.sessionId);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postBody, setPostBody] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeChannelId) {
      setLoading(false);
      setPosts([]);
      return;
    }

    const fetchChannelContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/v1/channel/fetch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            session: sessionId,
            channelId: activeChannelId,
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch channel content");

        const data = await response.json();

        // Safely transform the data with null checks
        setPosts(
          data?.data?.map((item: any) => {
            const userData: UserData = item.user_id || {};
            return {
              id: item._id || "",
              time: item.created_At || "",
              level: 0,
              content: item.body || "",
              likes: item.up_votes || 0,
              comments: item.reply_count || 0,
              author: userData.name || "Unknown",
              avatar: userData.image || "",
            };
          }) || []
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchChannelContent();
  }, [activeChannelId, userId, sessionId]);

  const handleSendPost = async () => {
    if (!postBody.trim() || !activeChannelId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/v1/channel/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          session: sessionId,
          channelId: activeChannelId,
          body: postBody,
        }),
      });

      if (!response.ok) throw new Error("Failed to send post");

      const newPost = await response.json();

      // Safely access the user data
      const userData: UserData = newPost.user_id || {};

      setPosts((prev) => [
        {
          id: newPost._id || "",
          author: userData.name || "Unknown",
          time: newPost.created_At || "",
          level: 0,
          content: newPost.body || "",
          likes: newPost.up_votes || 0,
          comments: newPost.reply_count || 0,
          avatar: userData.image || "",
        },
        ...prev,
      ]);

      setPostBody("");
    } catch (error) {
      console.error("Error sending post:", error);
      setError("Failed to send post. Please try again.");
    }
  };

  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center h-screen text-muted">
        Please select a channel to start chatting
      </div>
    );
  }

  if (loading) return <div className="text-center py-10">Loading posts...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-500">
        Error: {error}. Please try again.
      </div>
    );

  return (
    <div className="flex flex-col h-screen pb-20">
      {/* Channel Header */}
      <div className="flex items-center justify-between bg-card border-b border-background px-6 py-3 my-3 mx-2">
        <h1 className="text-lg font-medium">
          # {activeChannel.name || "Unnamed Channel"}
        </h1>
        <Settings className="h-5 w-5" />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-6 py-4 pb-24 space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => <PostCard onLike={function (id: string): void {
                throw new Error("Function not implemented.");
              } } onComment={function (id: string, comment: string): void {
                throw new Error("Function not implemented.");
              } } key={post.id} {...post} />)
            ) : (
              <div className="text-center text-muted">No posts yet</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Box */}
      <div className="fixed bottom-0 w-[calc(100%-20rem)] px-3 pr-28 py-2">
        <div className="flex items-center gap-2 rounded-lg p-1 bg-card border border-background">
          <input
            type="text"
            placeholder="Share your thoughts..."
            value={postBody}
            onChange={(e) => setPostBody(e.target.value)}
            className="flex-1 bg-card text-muted text-sm placeholder-zinc-400 rounded px-3 py-2 focus:outline-none"
          />
          <div className="flex gap-8 px-2 py-1">
            <Button
              onClick={handleSendPost}
              className="px-6"
              disabled={!postBody.trim()}
            >
              <Send className="h-4 w-4 text-white" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommunityChat() {
  return <ChatContent />;
}
