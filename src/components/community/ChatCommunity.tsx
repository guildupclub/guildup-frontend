"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Send } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useChatMessages, useSendChatMessage } from "@/hook/queries/useChatQueries";

interface Post {
  id: string;
  author: string;
  time: string;
  content: string;
  avatar: string;
}

function Chat() {
  const activeChannel = useSelector(
    (state: RootState) => state.channel.activeChannel
  );

  const activeChannelId = activeChannel?.id || null;
  const userId = useSelector((state: RootState) => state.user.user?._id);

  const [postBody, setPostBody] = useState<string>("");

  // Use React Query hooks
  const {
    data: posts = [],
    isLoading,
    error
  } = useChatMessages(
    activeChannelId && userId
      ? { userId, channelId: activeChannelId }
      : null
  );

  const { mutate: sendMessage, isPending: isSending } = useSendChatMessage();

  const handleSendPost = () => {
    if (!postBody.trim() || !activeChannelId || !userId) return;

    sendMessage(
      {
        userId,
        channelId: activeChannelId,
        message_type: "text",
        message_content: postBody,
      },
      {
        onSuccess: () => {
          setPostBody("");
        },
        onError: (error) => {
          console.error("Error sending message:", error);
        },
      }
    );
  };

  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center h-screen text-zinc-400">
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
              posts.map((post) => (
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
              <div className="text-center text-zinc-400">No posts yet</div>
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
          <Button onClick={handleSendPost} disabled={!postBody.trim() || isSending}>
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CommunityChat2() {
  return <Chat />;
}
