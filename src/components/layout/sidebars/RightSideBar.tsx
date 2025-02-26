"use client";

import * as React from "react";
import Image from "next/image";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreatorForm from "@/components/form/CreatorForm";

// Sample data structure
const trendingPosts = [
  {
    id: 1,
    title: "Tech Trailblazers",
    description:
      "Discussions on the latest tech trends, innovations, and breakthroughs. Share your thoughts on AI, blockchain...",
    image: "/svg/pic1.svg",
    loves: "50.8k",
    comments: "1.1k",
    shares: "15k",
  },
  {
    id: 2,
    title: "The Financier's Forum",
    description:
      "A platform for financial professionals, investors, and enthusiasts to discuss market trends, investment...",
    image: "/svg/pic2.svg",
    loves: "50k",
    comments: "1.5k",
    shares: "8k",
  },
  {
    id: 3,
    title: "Digital Frontiers",
    description:
      "Cutting edge of technology. Discuss emerging technologies, their impact on society, and the future of t...",
    image: "/svg/pic3.svg",
    loves: "45",
    comments: "100",
    shares: "12k",
  },
  {
    id: 4,
    title: "The Financier's Forum",
    description:
      "A platform for financial professionals, investors, and enthusiasts to discuss market trends, investment...",
    image: "/svg/pic2.svg",
    loves: "50k",
    comments: "1.5k",
    shares: "8k",
  },
];

// const recommendedCommunities = [
//   {
//     id: 1,
//     name: "Rajat Verma",
//     avatar: "/svg/Aditi_KApoor.svg",
//     status: "Private • 25k Members • Paid",
//   },
//   {
//     id: 2,
//     name: "Adit Kapoor",
//     avatar: "/svg/Rajat.svg",
//     status: "Public • 15k Members • Free",
//   },
//   {
//     id: 3,
//     name: "Vishal S",
//     avatar: "/svg/Aditi_KApoor.svg",
//     status: "Private • 30k Members • Paid",
//   },
//   {
//     id: 4,
//     name: "Sanjay Rathi",
//     avatar: "/svg/Rajat.svg",
//     status: "Public • 5k Members • Free",
//   },
// ];

export function RightSidebar() {
  const [showCreatorForm, setShowCreatorForm] = React.useState(false);

  const handleOpenForm = () => {
    setShowCreatorForm((prev) => !prev);
  };

  const handleCloseForm = () => {
    setShowCreatorForm(false);
  };
  return (
    <aside className="right-0 h-screen w-80 pl-2 pt-4 pb-4 pe-5 space-y-2">
      {/* Trending Posts Box */}

      <div className="bg-card rounded-xl p-4 w-full space-y-4">
        <h1 className="">Ready to start making money?</h1>
        <Button className="w-full text-white" onClick={handleOpenForm}>
          Become a Creator
        </Button>

        {showCreatorForm && <CreatorForm />}
      </div>

      <div className="bg-card rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2 border-b border-zinc-300 pb-2">
          Trending Posts
        </h2>
        <div className="space-y-4 max-h-[430px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-900 overflow-auto scrollbar-none cursor-pointer">
          {trendingPosts.map((post) => (
            <div
              key={post.id}
              className="space-y-2 border-b border-zinc-300 last:border-0 pb-4 last:pb-0"
            >
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium">{post.title}</h3>
                  <p className="text-xs  line-clamp-2">{post.description}</p>
                </div>
                <div className="relative h-16 w-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  <span>{post.loves}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{post.comments}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{post.shares}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Communities Box */}
      {/* <div className="bg-zinc-900 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-zinc-200 mb-4 border-b border-zinc-800 pb-2">
          Recommended Communities
        </h2>
        <div className="space-y-3">
          {recommendedCommunities.map((community) => (
            <div
              key={community.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={community.avatar} />
                  <AvatarFallback>{community.name[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-zinc-200">
                    {community.name}
                  </p>
                  <p className="text-xs text-zinc-400">{community.status}</p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-primary-gradient text-white rounded-full px-6"
              >
                Join
              </Button>
            </div>
          ))}
        </div>
      </div> */}
    </aside>
  );
}
