"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Eye,
  Plus,
  Send,
} from "lucide-react";
import { Comment } from "./Comment";
import CommentSection from "./CommentSection/CommentSection";

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    body: string;
    created_At: string;
    up_votes: number;
    reply_count: number;
    post_type: string;
    slug: string;
  };
  ref:any;
}

export function PostCard({ post ,ref}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.up_votes || 12500);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Existing functions remain the same
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - postDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    }
    return `${Math.floor(diffInMinutes / 60)} hours ago`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num?.toString();
  };

  const renderBodyWithHashtags = (text: string) => {
    return text.split(" ").map((word, index) =>
      word.startsWith("#") ? (
        <span key={index} className="text-purple-500">
          {word}{" "}
        </span>
      ) : (
        word + " "
      )
    );
  };

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    setLikeCount((prevCount) => (isLiked ? prevCount - 1 : prevCount + 1));
  };

  const handleShareClick = async () => {
    const shareUrl = `https://your-website.com/posts/${post.slug}`;

    try {
      await navigator.share({
        title: post.title,
        text: post.body,
        url: shareUrl,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Example comments data


  return (
    <div className="bg-zinc-900 rounded-xl mb-4" ref={ref}>
      <div className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-zinc-200">{post.title}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-zinc-400">
                    {formatTimeAgo(post.created_At)}
                  </span>
                  <span className="text-xs text-zinc-500">•</span>
                  <span className="text-xs text-zinc-400">Public</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-zinc-300 mt-2">
              {renderBodyWithHashtags(post.body)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center px-4 py-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-6">
          <button
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 rounded-full p-2"
            onClick={handleLikeClick}
          >
            <Heart
              className={`h-5 w-5 ${
                isLiked ? "text-red-500 fill-red-500" : ""
              }`}
            />
            <span className="text-sm">{formatNumber(post.up_votes)} Love</span>
          </button>
          <button
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300"
            onClick={handleShareClick}
          >
            <Share2 className="h-5 w-5" />
            <span className="text-sm">Share</span>
          </button>
          <button
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">
              {formatNumber(post?.replies?.length )} Comments
            </span>
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2 text-zinc-400">
          <Eye className="h-5 w-5" />
          <span className="text-sm">25k Views</span>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-zinc-800/50">
          <div className="px-4">
          {showComments && <CommentSection postId={post._id} />}
          </div>
        </div>
      )}
    </div>
  );
}
