"use client";

import { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Plus,
  Send,
  MessageCircleMore,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setCommunityData } from "@/redux/communitySlice";
import { setActiveCommunity } from "@/redux/channelSlice";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { API_FRONTEND_URL } from "@/config/constants";
import moment from "moment";
import DOMPurify from "dompurify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CommentSection from "./CommentSection/CommentSection";
import { StringConstants } from "../common/CommonText";

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
      _id: string;
    };
  };
  ref: any;
  userID: string;
}

export function PostCard({ post, ref, userID }: PostCardProps) {
  const community_id = post.community_id?._id;
  const community_name = post.community_id?.name;
  const COMMUNITY_PROFILE_PATH = `/community/${community_id}/profile`;
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { user } = useSelector((state: any) => state.user);
  const queryClient = useQueryClient();

  const dispatch = useDispatch();
  const router = useRouter();

  // Use React Query to fetch post data including likes and comments
  const { data: postData } = useQuery({
    queryKey: ["post", post._id],
    initialData: post,
    refetchOnWindowFocus: false,
  });

  // Check if the current user has liked the post
  const isLiked =
    postData?.upvote_userId?.some((id: string) => id === user?._id) || false;

  const handleClickCommunity = useCallback(() => {
    if (!community_id) {
      console.error("Invalid community data:");
      return;
    }

    dispatch(
      setCommunityData({
        communityId: community_id,
        userId: userID,
      })
    );

    dispatch(
      setActiveCommunity({
        id: community_id,
        name: community_name,
        image: post.community_id.image,
        background_image: post.community_id.background_image,
        user_isBankDetailsAdded: false,
        user_iscalendarConnected: false,
      })
    );

    router.push(COMMUNITY_PROFILE_PATH);
  }, [dispatch, router, post]);

  // Update the comment submission function to use React Query

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: async (comment: string) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/post`,
        {
          postId: post._id,
          comment,
          userId: user?._id,
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: ["comments", post._id] });
      // Also invalidate post data to update comment count
      queryClient.invalidateQueries({ queryKey: ["post", post._id] });
    },
  });

  const handleSendComment = () => {
    if (!newComment.trim() || !user?._id) return;
    commentMutation.mutate(newComment);
    setNewComment("");
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

  // Use React Query mutation for likes
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/vote`,
        {
          userId: user._id,
          postId: post._id,
          action: isLiked ? "down_vote" : "up_vote",
          communityId: post.community_id,
        }
      );
      return response.data;
    },
    onMutate: async () => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["post", post._id] });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData(["post", post._id]);

      // Optimistically update to the new value
      queryClient.setQueryData(["post", post._id], (old: any) => {
        const newUpVotes = isLiked ? old.up_votes - 1 : old.up_votes + 1;
        const newUpvoteUserIds = isLiked
          ? old.upvote_userId.filter((id: string) => id !== user._id)
          : [...old.upvote_userId, user._id];

        return {
          ...old,
          up_votes: newUpVotes,
          upvote_userId: newUpvoteUserIds,
        };
      });

      // Return the previous value so we can roll back if something goes wrong
      return { previousPost };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPost) {
        queryClient.setQueryData(["post", post._id], context.previousPost);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: ["post", post._id] });
    },
  });

  const handleLikeClick = () => {
    if (!user?._id) return;
    likeMutation.mutate();
  };

  const handleShareClick = async () => {
    const shareUrl = `${API_FRONTEND_URL}/feeds`;

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
  const parsedBody =
    post.body.startsWith('"') && post.body.endsWith('"')
      ? post.body.slice(1, -1)
      : post.body;
  const sanitizedBody = DOMPurify.sanitize(parsedBody.trim());

  return (
    <div className="bg-card rounded-xl mb-4" ref={ref}>
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-10">
            <Avatar className="h-10 w-10 border-2 border-purple-500">
              <AvatarImage src={post?.community_id?.image} />
              <AvatarFallback>{fallbackLetter}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3
                  onClick={handleClickCommunity}
                  className="font-medium text-muted cursor-pointer"
                >
                  {post?.community_id?.name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {moment(post.created_At).format("YYYY MMM DD, hh:mm A")}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-background"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Post content with bottom padding */}
      <div className="px-4 pb-6">
        <p
          className="text-sm text-accent"
          dangerouslySetInnerHTML={{ __html: sanitizedBody }}
        />

        {post?.media?.publicUrl && (
          <div className="mt-4">
            {post?.media?.fileType === "image" && (
              <Image
                src={post.media.publicUrl || "/placeholder.svg"}
                alt="Post Image"
                width={500}
                height={400}
                className="w-full max-h-[400px] rounded-lg object-contain"
              />
            )}
            {post?.media?.fileType === "video" && (
              <video
                controls
                controlsList="nodownload"
                className="w-full max-h-[400px] rounded-lg object-contain"
              >
                <source src={post?.media?.publicUrl} type="video/mp4" />
              </video>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center px-4 md:px-16 py-3 border-t border-zinc-300/50 mx-4 justify-between">
        {/* Left Icon */}
        <button
          className="flex items-center gap-2 text-muted-foreground hover:text-zinc-300 rounded-full p-2"
          onClick={handleLikeClick}
        >
          <Heart
            className={`h-5 w-5 ${isLiked ? "text-red-500 fill-red-500" : ""}`}
          />
          <span className="text-sm">
            {formatNumber(postData?.up_votes || 0)} {StringConstants.LIKE}
          </span>
        </button>

        {/* Middle Icon */}
        <button
          className="flex items-center gap-2 text-muted-foreground"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircleMore className="h-5 w-5" />
          <span className="text-sm">
            {post.reply_count} {StringConstants.COMMENT}
          </span>
        </button>

        {/* Right Icon */}
        <button
          className="flex items-center gap-2 text-muted-foreground"
          onClick={handleShareClick}
        >
          <Send className="h-5 w-5" /> {StringConstants.SHARE}
        </button>
      </div>

      {showComments && (
        <div className="border-t border-zinc-300/50">
          <div className="px-4 py-4">
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image} />
                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
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
                    onClick={handleSendComment}
                    disabled={commentMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="px-4">
              {showComments && <CommentSection postId={post._id} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
