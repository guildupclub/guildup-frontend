"use client";

import { useState } from "react";
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

const initialPosts: Post[] = [
  {
    id: "1",
    author: "Reena Singh",
    time: "11:00 pm",
    level: 1,
    content:
      "Did you know that investing in index funds can help you build a solid portfolio? They offer low fees, diversification, and good returns over time. Check out my latest video on how to get started with index funds. 📊 #InvestmentTips #PassiveIncome",
    likes: 15,
    comments: 45,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    author: "Ravi Kumar",
    time: "11:00 pm",
    level: 2,
    content:
      "Did you know that investing in index funds can help you build a solid portfolio? They offer low fees, diversification, and good returns over time. Check out my latest video on how to get started with index funds. 📊 #InvestmentTips #PassiveIncome",
    likes: 15,
    comments: 45,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    author: "Reena Singh",
    time: "11:00 pm",
    level: 1,
    content:
      "Did you know that investing in index funds can help you build a solid portfolio? They offer low fees, diversification, and good returns over time. Check out my latest video on how to get started with index funds. 📊 #InvestmentTips #PassiveIncome",
    likes: 15,
    comments: 45,
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

function ChatContent() {
  const activeChannel = useSelector(
    (state: RootState) => state.channel.activeChannel
  );
  const [posts, setPosts] = useState<Post[]>(initialPosts);

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

  return (
    <div className="flex flex-col h-screen pb-20">
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium"># {activeChannel.name}</h1>
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

      <div className="fixed bottom-0 w-[calc(100%-20rem)] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-zinc-800 px-16 py-4">
        <div className="flex items-center gap-2 rounded-lg p-2 bg-black px-2">
          <input
            type="text"
            placeholder="Share your thoughts..."
            className="flex-1 bg-transparent text-zinc-200 text-sm placeholder-zinc-400 focus:outline-none"
          />
          <div className="flex gap-8 px-6 py-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-zinc-800"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button className="bg-primary-gradient ">Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommunityChat() {
  return <ChatContent />;
}
