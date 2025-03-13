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
  MessageCircleMore,
} from "lucide-react";
import { Comment } from "./Comment";
import CommentSection from "./CommentSection/CommentSection";
import { useSelector } from "react-redux";
import axios from "axios";
import { FaRegCommentDots, FaShare } from "react-icons/fa";
import Image from "next/image";
import { API_FRONTEND_URL } from "@/config/constants";
import moment from "moment";

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
    upvote_userId: any;
    replies?: any;
    media?: any;
    user_id: any;
    community_id: {
      name: string;
      image: string;
      background_image: string;
    };
  };
  ref: any;
}

export function PostCard({ post, ref }: PostCardProps) {
  const [likeCount, setLikeCount] = useState(post.up_votes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { user } = useSelector((state: any) => state.user);
  const [isLiked, setIsLiked] = useState(
    post.upvote_userId?.some((id: string) => id === user?.id) || false
  );
  const handleSendComment = async () => {
    console.log("@user", user);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/post`,
      {
        postId: post._id,
        comment: newComment,
        userId: user?._id,
      }
    );
    console.log("@commentResponse", response);
  };
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

  const handleLikeClick = async () => {
    setIsLiked(!isLiked);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/vote`,
      {
        userId: user._id,
        postId: post._id,
        action: isLiked ? "down_vote" : "up_vote",
        communityId: post.community_id,
      }
    );
    console.log("@resposneVote", response);
    setLikeCount((prevCount) => (isLiked ? prevCount - 1 : prevCount + 1));
  };

  const handleShareClick = async () => {
    const shareUrl = `${API_FRONTEND_URL}/posts/${post.slug}`;

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

  const communityName = post?.community_id?.name || "New Community";
  const fallbackLetter = communityName.trim().charAt(0).toUpperCase();

  return (
    <div className="bg-card rounded-xl mb-4" ref={ref}>
      <div className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10  border-2 border-purple-500">
            <AvatarImage src={post?.community_id?.image} />
            <AvatarFallback>
              <AvatarFallback>{fallbackLetter}</AvatarFallback>
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-muted">
                  {post?.community_id?.name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">
                  {moment(post.created_At).format("YYYY MMM DD, hh:mm A")}
                  </span>
                  <span className="text-xs  text-muted-foreground">•</span>
                  {/* <span className="text-xs  text-muted-foreground ">
                    Public
                  </span> */}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8  hover:bg-background"
              >
                <MoreVertical className="h-5 w-5  " />
              </Button>
            </div>
            <p className="text-sm text-accent mt-2">
              {renderBodyWithHashtags(post.body)}
            </p>

            {post?.media?.publicUrl && post?.media?.fileType === "image" && (
              <Image
                src={post.media.publicUrl}
                alt="Post Image"
                width={500} // Specify the width
                height={400} // Specify the height
                className="mt-4 w-full max-h-[400px] rounded-lg object-contain"
              />
            )}

            {/* Video Placeholder */}
            {post?.media?.publicUrl && post?.media?.fileType === "video" && (
              <video
                controls
                className="mt-4 w-full max-h-[400px] rounded-lg object-contain"
              >
                <source src={post?.media?.publicUrl} type="video/mp4" />
              </video>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center px-16 py-3 border-t border-zinc-300/50 mx-4 justify-between">
        {/* Left Icon */}
        <button
          className="flex items-center gap-2 text-muted-foreground hover:text-zinc-300 rounded-full p-2"
          onClick={handleLikeClick}
        >
          <Heart
            className={`h-5 w-5 ${isLiked ? "text-red-500 fill-red-500" : ""}`}
          />
          <span className="text-sm">{formatNumber(post.up_votes)} Like</span>
        </button>

        {/* Middle Icon */}
        <button
          className="flex items-center gap-2 text-muted-foreground"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircleMore className="h-5 w-5" />
          <span className="text-sm">
            {formatNumber(post?.replies?.length)} Comment
          </span>
        </button>

        {/* Right Icon */}
        <button
          className="flex items-center gap-2 text-muted-foreground"
          onClick={handleShareClick}
        >
          <Send className="h-5 w-5" /> Share
        </button>
      </div>

      {showComments && (
        <div className="border-t border-zinc-300/50">
          <div className="p-4">
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-background rounded-full px-4 py-2 text-sm text-accent focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted hover:text-accent"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted hover:text-accent"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-purple-500"
                    onClick={() => {
                      // Handle comment submission
                      handleSendComment();
                      setNewComment("");
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4">
            {showComments && <CommentSection postId={post._id} />}
          </div>
        </div>
      )}
    </div>
  );
}
