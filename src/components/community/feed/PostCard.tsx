"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircleMore, Send, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import axios from "axios";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StringConstants } from "@/components/common/CommonText";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sendNotification } from "@/components/utils/notification";
import {
  processPostContent,
  youtubeEmbedStyles,
} from "@/components/utils/embed-utils";
import CommentSection from "@/components/homePageLayout/CommentSection/CommentSection";
import { BsSend } from "react-icons/bs";
import YouTubePlayer from "@/components/YouTubePlayer";

// Add this CSS class to your global CSS file
// .xs\:inline { @media (min-width: 480px) { display: inline; } }

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    body: string;
    user_id: any;
    up_votes: number;
    down_votes: number;
    reply_count: number;
    created_At: string;
    is_locked: boolean;
    post_type: string;
    upvote_userId?: string[];
    media?: {
      publicUrl: string;
      fileType: string;
    };
    community_id?: {
      name: string;
      image: string;
      background_image: string;
      _id: string;
    };
  };
  onDelete?: (postId: string) => void;
  onUpdate?: (updatedPost: any) => void;
}

export function PostCard({ post, onDelete, onUpdate }: PostCardProps) {
  const memberDetails = useSelector(
    (state: RootState) => state.member.memberDetails
  );
  const isAdmin = memberDetails?.is_owner || memberDetails?.is_moderator;
  const [isCommenting, setIsCommenting] = useState(false);
  const [relativeTime, setRelativeTime] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { data: session } = useSession();
  const activeCommunity = useSelector(
    (state: RootState) => state.channel.activeCommunity
  );
  const user = useSelector((state: RootState) => state.user?.user);
  const userId = user?._id;
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const name = activeCommunity?.name || post.community_id?.name;
  const communityImage = activeCommunity?.image || post.community_id?.image;

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    setRelativeTime(
      formatDistanceToNow(new Date(post.created_At), { addSuffix: true })
    );
  }, [post.created_At]);

  // Use React Query to fetch post data including likes and comments
  const { data: postData } = useQuery({
    queryKey: ["post", post._id],
    initialData: post,
    refetchOnWindowFocus: false,
  });

  // Check if the current user has liked the post
  const isLiked =
    postData?.upvote_userId?.some((id: string) => id === userId) || false;

  // Function to send notification
  const sendLikeNotification = async () => {
    try {
      // Make sure we have the post owner's data and it's not a self-like
      if (!post.user_id || !post.user_id.email || userId === post.user_id._id) {
        return;
      }

      await sendNotification(post.user_id.email, {
        userId: post.user_id._id,
        type: "post_like",
        message: `${user.name} liked your post`,
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          postId: post._id,
          userId: user._id,
          userName: user.name,
          userImage: user.image,
        },
      });
    } catch (error) {
      console.error("Error sending like notification:", error);
    }
  };

  // Use React Query mutation for likes
  const likeMutation = useMutation({
    mutationFn: async () => {
      // Store the current like state before the mutation
      const wasLiked = isLiked;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/vote`,
        {
          userId: userId,
          postId: post._id,
          action: isLiked ? "down_vote" : "up_vote",
          communityId: post.community_id?._id || activeCommunity?.id,
        }
      );

      // Only send notification if this was a like action (not an unlike)
      if (!wasLiked) {
        await sendLikeNotification();
      }

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
          ? old.upvote_userId?.filter((id: string) => id !== userId) || []
          : [...(old.upvote_userId || []), userId];

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
    mutationFn: async (comment: string) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/post`,
        {
          postId: post._id,
          comment,
          userId: userId,
        }
      );
      return response.data.data;
    },
    onSuccess: async (newComment) => {
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: ["comments", post._id] });
      // Also invalidate post data to update comment count
      queryClient.invalidateQueries({ queryKey: ["post", post._id] });

      // Send notification to post owner if commenter is not the post owner
      if (post.user_id?._id !== userId) {
        await sendNotification(post.user_id?.email, {
          userId: post.user_id._id,
          type: "post_comment",
          message: `${user.name} commented on your post`,
          read: false,
          createdAt: new Date().toISOString(),
          data: {
            postId: post._id,
            userId: user._id,
            userName: user.name,
            userImage: user.image,
            commentId: newComment._id,
          },
        });
      }
    },
  });

  const handleLikeClick = () => {
    if (!userId) return;
    likeMutation.mutate();
  };

  const handleSendComment = () => {
    if (!newComment.trim() || !userId) return;
    commentMutation.mutate(newComment);
    setNewComment("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendComment();
    }
  };

  const handleDeletePost = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/delete`,
        {
          postId: post._id,
          communityId: activeCommunity?.id || post.community_id?._id,
          userId: userId,
        }
      );

      toast.success("Post deleted successfully!");

      // Trigger removal from parent list
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (error) {
      toast.error("Failed to delete the post.");
      console.error("Delete error:", error);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleShareClick = async () => {
    const shareUrl = `${window.location.origin}/post/${post?._id}`;

    try {
      await navigator.share({
        title: post.title,
        text: post.body,
        url: shareUrl,
      });
    } catch (error) {
      console.log(error);
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!", {
        position: "bottom-center",
      });
    }
  };

  // Process post body to handle YouTube URLs using our utility function
  const { originalContent, youtubeEmbed } = processPostContent(post.body);

  const isCurrentUserAuthor = session?.user?.id === post.user_id?._id;
  const canModify = isAdmin || isCurrentUserAuthor;

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num?.toString();
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-purple-500 ring-2 ring-purple-100 dark:ring-purple-900/30">
            <AvatarImage src={communityImage || "/placeholder.svg"} />
            <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
              {getInitials(name || "")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-muted-foreground leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{name}</span>
              {isAdmin && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                >
                  {StringConstants.HOST}
                </Badge>
              )}
            </div>
            <span className="text-xs opacity-70">{relativeTime}</span>
          </div>
          {canModify && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full  "
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-gray-100">
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-muted-foreground cursor-pointer"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="mt-4 text-foreground">
          <div className="text-sm leading-relaxed">
            {/* Original content without YouTube URLs */}
            {originalContent && originalContent.trim() !== "" && (
              <div dangerouslySetInnerHTML={{ __html: originalContent }} />
            )}

            {/* YouTube embed if available */}
            {youtubeEmbed && (
              <div className="mt-4">
                <YouTubePlayer
                  embedUrl={youtubeEmbed.match(/src="([^"]+)"/)?.[1] || ""}
                />
              </div>
            )}
          </div>

          {post?.media?.publicUrl && post?.media?.fileType === "image" && (
            <img
              src={post.media.publicUrl || "/placeholder.svg"}
              alt="Post Image"
              className="mt-4 w-full max-h-[400px] rounded-lg object-contain"
            />
          )}
          {post?.media?.publicUrl && post?.media?.fileType === "video" && (
            <video
              controls
              controlsList="nodownload"
              className="w-full max-h-[420px] object-contain"
            >
              <source src={post?.media?.publicUrl} type="video/mp4" />
            </video>
          )}
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 px-2 sm:px-4 md:px-10">
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full px-2 sm:px-4 gap-1 sm:gap-2 transition-colors  ${
              isLiked
                ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            onClick={handleLikeClick}
          >
            <Heart
              className={`w-6 h-6 ${isLiked ? "fill-red-500" : ""} ${
                likeMutation.isPending ? "animate-pulse" : ""
              }`}
            />
            <span className="text-foreground ">
              {formatNumber(postData?.up_votes || 0)} {StringConstants.LIKE}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full px-2 sm:px-4 gap-1 sm:gap-2 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
              isCommenting
                ? "bg-zinc-100 text-foreground dark:bg-zinc-800 dark:text-zinc-200"
                : ""
            }`}
            onClick={() => setIsCommenting(!isCommenting)}
          >
            <MessageCircleMore className="h-6 w-6" />
            <span className="font-semibold ">
              {" "}
              {post.reply_count} {StringConstants.COMMENT}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-2 sm:px-4 gap-1 sm:gap-2 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={handleShareClick}
          >
            <BsSend className="h-6 w-6" />
            <span className="font-semibold">{StringConstants.SHARE}</span>
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {isCommenting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-zinc-100 dark:border-zinc-800 overflow-hidden"
          >
            <div className="px-5 py-4">
              <div className="flex gap-3 mb-4">
                <Avatar className="h-8 w-8 ring-2 ring-purple-100 dark:ring-purple-900/30">
                  <AvatarImage src={user?.image || "/placeholder.svg"} />
                  <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a comment..."
                    className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 text-purple-500 rounded-full ${
                        commentMutation.isPending ? "animate-pulse" : ""
                      }`}
                      onClick={handleSendComment}
                      disabled={commentMutation.isPending || !newComment.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="px-2">
                <CommentSection postId={post._id} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? You won&apos;t be able
              to undo this action.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePost}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add responsive styling for embedded iframes */}
      <style jsx global>
        {youtubeEmbedStyles}
      </style>
    </div>
  );
}
