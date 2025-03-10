"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Send } from "lucide-react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RootState } from "@/redux/store";
import { useChatMessages, useSendChatMessage } from "@/hook/queries/useChatQueries";
import { API_BASE_URL } from "@/config/constants";
import { StringConstants } from "../common/CommonText";

interface Post {
  id: string;
  author: string;
  time: string;
  content: string;
  avatar: string;
}

function Chat() {
  const queryClient = useQueryClient();
  const activeChannel = useSelector(
    (state: RootState) => state.channel.activeChannel
  );
  const activeChannelId = activeChannel?.id || null;
  const userId = useSelector((state: RootState) => state.user.user?._id);

  const [postBody, setPostBody] = useState<string>("");

  // ✅ Fetch chat messages using useQuery
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery<Post[]>({
    queryKey: ["chatMessages", activeChannelId, userId],
    queryFn: async () => {
      if (!activeChannelId) return [];
      const response = await fetch(`${API_BASE_URL}/v1/channel/fetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: activeChannelId, userId }),
      });

      if (!response.ok) throw new Error("Failed to fetch channel content");

      const data = await response.json();
      return (
        data?.data?.map((item: any) => {
          const userData: any = item.sender_id || {};
          return {
            id: item._id || "",
            time: item.createdAt || "",
            content: item.message_content || "",
            author: userData.user_name || "Unknown",
            avatar: userData.image || "",
          };
        }) || []
      );
    },
    enabled: !!activeChannelId, // ✅ Only fetch when channel is active
  });

  const sendPostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/v1/channel/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: activeChannelId,
          message_type: "text",
          message_content: postBody,
          userId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send post");

      return await response.json(); // Return the full response from backend
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", activeChannelId, userId]
      });
      setPostBody(""); // Clear input after sending
    },
    onError: () => {
      console.error("Error sending post");
    },
  });

  const handleSendPost = () => {
    if (postBody.trim() && activeChannelId) {
      sendPostMutation.mutate();
    }
  };

  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center h-screen text-zinc-400">
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
            {(posts || []).length > 0 ? (
              (posts || []).map((post) => (
                <div key={post.id} className="flex gap-3 items-start">
                  <img
                    src={post.avatar || "/placeholder.svg?height=40&width=40"}
                    alt={post.author}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{post.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {post.time}
                      </span>
                    </div>
                    <p className="text-sm text-accent">{post.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-zinc-400">{StringConstants.NO_POSTS_YET}</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Box */}
      <div className="fixed bottom-0 w-[calc(100%-20rem)] px-3 pr-28 py-2">
        <div className="flex items-center gap-2 rounded-lg p-1 bg-card border border-background">
          <input
            type="text"
            placeholder="Search"
            value={postBody}
            onChange={(e) => setPostBody(e.target.value)}
            className="flex-1 text-muted text-sm placeholder-zinc-400 rounded px-3 py-2 focus:outline-none"
          />
          <Button
            onClick={handleSendPost}
            disabled={!postBody.trim() || sendPostMutation.isPending}
          >
            {sendPostMutation.isPending ? (
              "Sending..."
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CommunityChat2() {
  return <Chat />;
}
