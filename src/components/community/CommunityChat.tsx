"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Send } from "lucide-react";
import { PostCard } from "./PostCard";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { API_BASE_URL } from "@/config/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StringConstants } from "../common/CommonText";

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
  const queryClient = useQueryClient();
  const activeChannel = useSelector(
    (state: RootState) => state.channel.activeChannel
  );

  const activeChannelId = activeChannel?.id || null;
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const sessionId = useSelector((state: RootState) => state.user.sessionId);

  const [postBody, setPostBody] = useState<string>("");

  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["channelPosts", activeChannelId],
    queryFn: async () => {
      if (!activeChannelId) return [];
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
      return (
        data?.data?.map((item: any) => {
          const userData: any = item.user_id || {};
          return {
            id: item._id || "",
            time: item.created_At || "",
            level: 0,
            content: item.body || "",
            likes: item.up_votes || 0,
            comments: item.reply_count || 0,
            author: userData.user_name || "Unknown",
            avatar: userData.image || "",
          };
        }) || []
      );
    },
    enabled: !!activeChannelId,
  });

  const sendPostMutation = useMutation({
    mutationFn: async () => {
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
      return response.json();
    },
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({
        queryKey: ["channelPosts", activeChannelId]
      });
      setPostBody("");
    },
  });

  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center h-screen text-muted">
        {StringConstants.SELECT_CHANNEL_TO_START_CHATTING}
      </div>
    );
  }

  if (isLoading) return <div className="text-center py-10">{StringConstants.LOADING_POSTS}</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-500">
        {StringConstants.ERROR} {(error as Error).message}. {StringConstants.PLEASE_TRY_AGAIN}
      </div>
    );

  return (
    <div className="flex flex-col h-screen pb-20">
      {/* Channel Header */}
      <div className="flex items-center justify-between bg-card border-b border-background px-6 py-3 my-3 mx-2">
        <h1 className="text-lg font-medium">
          {StringConstants.HASHTAG} {activeChannel.name || "Unnamed Channel"}
        </h1>
        <Settings className="h-5 w-5" />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-6 py-4 pb-24 space-y-6">
            {posts.length > 0 ? (
              posts.map((post:any) => <PostCard key={post.id} {...post} />)
            ) : (
              <div className="text-center text-muted">{StringConstants.NO_POSTS_YET}</div>
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
              onClick={() => sendPostMutation.mutate()}
              className="px-6"
              disabled={!postBody.trim() || sendPostMutation.isPending}
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
