"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Send } from "lucide-react";
import { PostCard } from "./PostCard";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useChannelPosts, usePostToChannel } from "@/hook/queries/useChannelQueries";

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

  const activeChannelId = activeChannel?.id || null;
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const sessionId = useSelector((state: RootState) => state.user.sessionId);

  const [postBody, setPostBody] = useState<string>("");

  // Use React Query hooks
  const {
    data: posts = [],
    isLoading,
    error
  } = useChannelPosts(
    activeChannelId && userId && sessionId
      ? { userId, sessionId, channelId: activeChannelId }
      : null
  );

  const { mutate: sendPost, isPending: isSending } = usePostToChannel();

  const handleSendPost = () => {
    console.log("Sending post:", postBody, activeChannelId, userId, sessionId);
    if (!postBody.trim() || !activeChannelId || !userId || !sessionId) return;

    sendPost(
      {
        userId,
        sessionId,
        channelId: activeChannelId,
        body: postBody,
      },
      {
        onSuccess: () => {
          setPostBody("");
        },
        onError: (error) => {
          console.error("Error sending post:", error);
        },
      }
    );
  };

  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center h-screen text-muted">
        Please select a channel to start chatting
      </div>
    );
  }

  if (isLoading) return <div className="text-center py-10">Loading posts...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-500">
        Error: {(error as Error).message}. Please try again.
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
              }} onComment={function (id: string, comment: string): void {
                throw new Error("Function not implemented.");
              }} key={post.id} {...post} />)
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
              disabled={!postBody.trim() || isSending}
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
