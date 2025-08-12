"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";

interface Post {
  _id: string;
  author?: {
    name?: string;
    avatar?: string;
  };
  user_id?: {
    _id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  user_name?: string;
  user_avatar?: string;
  content: string;
  text?: string;
  body?: string;
  title?: string;
  images?: string[];
  media?: {
    publicUrl: string;
    fileType: string;
  };
  timestamp?: string;
  createdAt?: string;
  created_At?: string;
  likes: number;
  comments: number;
  shares: number;
  upvotes?: number;
  downvotes?: number;
  up_votes?: number;
  reply_count?: number;
  isLiked?: boolean;
}

interface ContentFeedProps {
  expertId?: string;
  communityId?: string;
  expertName?: string;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
};

export function ContentFeed({ 
  expertId, 
  communityId, 
  expertName = "Expert" 
}: ContentFeedProps) {
  // Fetch posts from backend
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["userPosts", expertId, communityId],
    queryFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/user/posts`,
        {
          expertId,
          communityId
        }
      );
      if (response.data.r === "s") {
        return response.data.data;
      }
      throw new Error("Failed to fetch posts");
    },
    enabled: !!(expertId || communityId),
  });

  // Don't render anything if loading or no posts
  if (isLoading) {
    return null; // Don't show loading state, just don't render the section
  }

  if (error || !posts || posts.length === 0) {
    return null; // Don't show the section if no posts
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Content Feed</h2>
        <h3 className="text-3xl font-bold text-primary">
          Check {expertName}&apos;s Daily Updates &nbsp;
        </h3>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: Post) => (
          <div key={post._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Post Header */}
            <div className="p-4 pb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {(post.user_id?.name || post.user_name || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {post.user_id?.name || post.user_name || "Anonymous"}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {formatDate(post.createdAt || post.created_At || post.timestamp || '')}
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Post Content */}
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {post.content || post.text || post.body || post.title || ""}
              </p>
            </div>

            {/* Post Media */}
            {post.media && post.media.publicUrl && (
              <div className="relative">
                {post.media.fileType === 'image' ? (
                  <img
                    src={post.media.publicUrl}
                    alt="Post media"
                    className="w-full h-48 object-cover"
                  />
                ) : post.media.fileType === 'video' ? (
                  <video
                    src={post.media.publicUrl}
                    className="w-full h-48 object-cover"
                    controls
                  />
                ) : null}
              </div>
            )}

            {/* Post Images (fallback for old format) */}
            {post.images && post.images.length > 0 && (
              <div className="flex">
                {post.images.map((image, index) => (
                  <div key={index} className="flex-1 relative">
                    <img
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    {index === 1 && post.images && post.images.length > 2 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">+{post.images.length - 1}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Post Actions */}
            <div className="p-4 pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className={`flex items-center gap-1 text-sm ${post.isLiked ? 'text-red-500' : 'text-gray-600'} hover:text-red-500`}>
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{formatNumber(post.likes || post.upvotes || post.up_votes || 0)}</span>
                  </button>
                  
                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
                    <MessageCircle className="w-4 h-4" />
                    <span>{formatNumber(post.comments || post.reply_count || 0)}</span>
                  </button>
                </div>

                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
                  <Share className="w-4 h-4" />
                  <span>{formatNumber(post.shares || 0)}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 