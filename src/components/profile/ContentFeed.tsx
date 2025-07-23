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
  user_name?: string;
  user_avatar?: string;
  content: string;
  text?: string;
  images?: string[];
  timestamp?: string;
  createdAt?: string;
  likes: number;
  comments: number;
  shares: number;
  upvotes?: number;
  downvotes?: number;
  isLiked?: boolean;
}

interface ContentFeedProps {
  communityId: string;
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

export function ContentFeed({ communityId, expertName = "Expert" }: ContentFeedProps) {
  // Fetch posts from backend
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["communityPosts", communityId],
    queryFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/community/post`,
        {
          communityId: communityId
        }
      );
      if (response.data.r === "s") {
        return response.data.data;
      }
      throw new Error("Failed to fetch posts");
    },
    enabled: !!communityId,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Content Feed</h2>
          <h3 className="text-3xl font-bold text-blue-600 mb-6">Check {expertName}'s Daily Updates</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Content Feed</h2>
          <h3 className="text-3xl font-bold text-blue-600 mb-6">Check {expertName}'s Daily Updates</h3>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Failed to load posts. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No posts state
  if (!posts || posts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Content Feed</h2>
          <h3 className="text-3xl font-bold text-blue-600 mb-6">Check {expertName}'s Daily Updates</h3>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">No posts available yet. Check back later for updates!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Content Feed</h2>
        <h3 className="text-3xl font-bold text-blue-600 mb-6">Check {expertName}'s Daily Updates</h3>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {posts.map((post: Post) => (
          <div key={post._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Post Header */}
            <div className="p-4 pb-3">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={post.author?.avatar || post.user_avatar || "/defaultCommunityIcon.png"}
                  alt={post.author?.name || post.user_name || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{post.author?.name || post.user_name || "Anonymous"}</h4>
                  <p className="text-xs text-gray-500">{post.timestamp || post.createdAt || ""}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Post Content */}
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {post.content || post.text || ""}
              </p>
            </div>

            {/* Post Images */}
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
                  <button className={`flex items-center gap-1 text-sm ${post.isLiked ? 'text-red-500' : 'text-blue-600'} hover:text-blue-700`}>
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{formatNumber(post.likes || post.upvotes || 0)}</span>
                  </button>
                  
                  <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                    <MessageCircle className="w-4 h-4" />
                    <span>{formatNumber(post.comments || 0)}</span>
                  </button>
                </div>

                <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                  <Share className="w-4 h-4" />
                  <span>{formatNumber(post.shares || 0)}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <div className="text-center">
        <button className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
          View More
        </button>
      </div>
    </div>
  );
} 