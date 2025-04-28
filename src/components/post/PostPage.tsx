"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  MessageCircleMore,
  MoreVertical,
  Plus,
  Send,
} from "lucide-react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import moment from "moment";
import DOMPurify from "dompurify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Import your components and constants
import CommentSection from "@/components/homePageLayout/CommentSection/CommentSection";
import { setCommunityData } from "@/redux/communitySlice";
import { setActiveCommunity } from "@/redux/channelSlice";
import { StringConstants } from "@/components/common/CommonText";
import { API_FRONTEND_URL } from "@/config/constants";

export default function PostPage({ id }: { id: string }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [postDetails, setPostDetails] = useState<any>({
    post: {},
    comments: [],
  });
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const fetchPost = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/${id}`
      );
      setPostDetails(response.data.data);
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const post = postDetails?.post || {};
  const community = post?.community_id || {};
  const user = post?.user_id || {};

  // Check if the current user has liked the post
  const isLiked = post?.upvote_userId?.includes(user?._id);

  const handleClickCommunity = useCallback(() => {
    if (!community?._id) {
      console.error("Invalid community data");
      return;
    }

    dispatch(
      setCommunityData({
        communityId: community._id,
        userId: user?._id,
      })
    );

    dispatch(
      setActiveCommunity({
        id: community._id,
        name: community.name,
        image: community.image,
        background_image: community.background_image,
        user_isBankDetailsAdded: false,
        user_iscalendarConnected: false,
      })
    );
    router.push(`/community/${community._id}/profile`);
  }, [dispatch, router, community, user]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num?.toString();
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/vote`,
        {
          userId: user._id,
          postId: post._id,
          action: isLiked ? "down_vote" : "up_vote",
          communityId: post.community_id._id,
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

  const commentMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/comment`,
        {
          userId: user._id,
          postId: post._id,
          body: newComment,
          communityId: post.community_id._id,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["post", post._id] });
    },
  });

  const handleLikeClick = () => {
    if (!user?._id) return;
    likeMutation.mutate();
  };

  const handleSendComment = () => {
    if (!newComment.trim() || !user?._id) return;
    commentMutation.mutate();
  };

  const handleShareClick = async () => {
    const shareUrl = `${API_FRONTEND_URL}/feeds`;

    try {
      await navigator.share({
        title: post?.title,
        text: post?.body,
        url: shareUrl,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const communityName = community?.name || "New Community";
  const fallbackLetter = communityName.trim().charAt(0).toUpperCase();
  const parsedBody =
    post?.body?.startsWith('"') && post?.body?.endsWith('"')
      ? post?.body?.slice(1, -1)
      : post?.body || "";
  const sanitizedBody = DOMPurify.sanitize(parsedBody.trim());

  if (!post._id) {
    return <div className="p-4 text-center">Loading post...</div>;
  }

  return (
    <div className="flex justify-center items-start min-h-screen px-4">
      <div className="bg-card rounded-xl my-16 w-[700px] ">
        <div className="p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10">
              <Avatar className="h-10 w-10 border-2 border-purple-500">
                <AvatarImage src={community?.image || "/placeholder.svg"} />
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
                    {community?.name}
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
              className={`h-5 w-5 ${
                isLiked ? "text-red-500 fill-red-500" : ""
              }`}
            />
            <span className="text-sm">
              {formatNumber(post?.up_votes || 0)} {StringConstants.LIKE}
            </span>
          </button>

          {/* Middle Icon */}
          <button
            className="flex items-center gap-2 text-muted-foreground"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircleMore className="h-5 w-5" />
            <span className="text-sm">
              {post.reply_count || 0} {StringConstants.COMMENT}
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
                      onClick={handleSendComment}
                      disabled={commentMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="px-4 mt-4">
                {showComments && <CommentSection postId={post._id} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
