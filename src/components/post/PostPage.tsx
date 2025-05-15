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
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import moment from "moment";
import DOMPurify from "dompurify";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type { RootState } from "@/redux/store";

// Import your components and constants
import CommentSection from "@/components/homePageLayout/CommentSection/CommentSection";
import { setCommunityData } from "@/redux/communitySlice";
import { setActiveCommunity } from "@/redux/channelSlice";
import { StringConstants } from "@/components/common/CommonText";
import { API_FRONTEND_URL } from "@/config/constants";
import { push, update, ref } from "firebase/database";
import database from "../../../firebase";
import { removeSpecialCharacters } from "@/components/utils/StringUtils";
import { sendNotification } from "@/components/utils/notification";
import { signIn } from "next-auth/react";
export default function PostPage({ id }: { id: string }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;
  const queryClient = useQueryClient();
  const [postDetails, setPostDetails] = useState<any>({
    post: {},
    comments: [],
  });
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = !!userId;

  const { data: postDetailsData, refetch } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/${id}`
      );
      return response.data.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (postDetailsData) {
      setPostDetails(postDetailsData);
    }
  }, [postDetailsData]);

  // Reset login prompt when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      setShowLoginPrompt(false);
    }
  }, [isAuthenticated]);

  const post = postDetails?.post || {};
  const community = post?.community_id || {};
  const postUser = post?.user_id || {};

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

  // Function to send notification
  const sendLikeNotification = async () => {
    try {
      // Make sure we have the post owner's data
      if (
        !post.user_id ||
        !post.user_id.email ||
        user?._id === post.user_id._id
      ) {
        console.log("Skipping notification: missing user data or self-like");
        return;
      }

      const email = removeSpecialCharacters(post?.user_id?.email);
      console.log("Sending notification to:", email);

      const notificationsRef = ref(database, `notification/${email}`);
      const newNotificationRef = push(notificationsRef);

      await update(newNotificationRef, {
        userId: post.user_id._id,
        type: "post_like",
        message: `${user?.name} liked your post`,
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          postId: post._id,
          userId: user?._id,
          userName: user?.name,
          userImage: user?.image,
        },
      });

      console.log("Like notification sent successfully");
    } catch (error) {
      console.error("Error sending like notification:", error);
    }
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }

      const wasLiked = isLiked;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/vote`,
        {
          userId: user._id,
          postId: post._id,
          action: isLiked ? "down_vote" : "up_vote",
          communityId: post.community_id._id,
        }
      );

      if (!wasLiked) {
        await sendLikeNotification();
      }

      return response.data;
    },
    onMutate: async () => {
      // Optimistically update the UI
      setPostDetails((prev) => {
        const newPost = { ...prev.post };

        if (isLiked) {
          // Unlike: Remove user from upvote_userId and decrement up_votes
          newPost.upvote_userId = newPost.upvote_userId.filter(
            (id) => id !== user?._id
          );
          newPost.up_votes = (newPost.up_votes || 0) - 1;
        } else {
          // Like: Add user to upvote_userId and increment up_votes
          newPost.upvote_userId = [...(newPost.upvote_userId || []), user?._id];
          newPost.up_votes = (newPost.up_votes || 0) + 1;
        }

        return {
          ...prev,
          post: newPost,
        };
      });
    },
    onError: (err) => {
      console.error("Like mutation error:", err);
      // Revert optimistic update by refetching
      refetch();
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
      refetch();
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/post`,
        {
          postId: post._id,
          comment: newComment,
          userId: user._id,
        }
      );
      return response.data.data;
    },
    onSuccess: async (newComment) => {
      setNewComment("");

      // Optimistically update the UI
      setPostDetails((prev) => ({
        ...prev,
        post: {
          ...prev.post,
          reply_count: (prev.post.reply_count || 0) + 1,
        },
      }));

      // Refetch to get the updated data
      refetch();

      // Send notification if needed
      if (post.user_id?._id !== user?._id) {
        await sendNotification(post.user_id?.email, {
          userId: post.user_id._id,
          type: "post_comment",
          message: `${user?.name} commented on your post`,
          read: false,
          createdAt: new Date().toISOString(),
          data: {
            postId: post._id,
            userId: user?._id,
            userName: user?.name,
            userImage: user?.image,
            commentId: newComment._id,
          },
        });
      }
    },
    onError: (error) => {
      console.error("Comment mutation error:", error);
      refetch();
    },
  });

  const handleLikeClick = () => {
    if (!isAuthenticated) {
      console.log("User not authenticated, showing login prompt");
      setShowLoginPrompt(true);
      return;
    }

    console.log("Attempting to like post with user:", user?._id);
    likeMutation.mutate();
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      console.log("User not authenticated, showing login prompt");
      setShowLoginPrompt(true);
      return;
    }

    console.log("Attempting to comment with user:", user?._id);
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

  const handleLogin = () => {
    // Redirect to login page or open login modal
    router.push("/login");
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendComment();
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen px-4">
      <div className="bg-card rounded-xl my-16 w-[700px] ">
        {showLoginPrompt && (
          <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-3 text-center">
            Please{" "}
            <button
              onClick={() =>
                signIn(undefined, {
                  callbackUrl: `${window.location.origin}?hero=2`,
                })
              }
              className="font-bold underline"
            >
              log in
            </button>{" "}
            to like or comment on posts.
          </div>
        )}

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
                  <AvatarImage src={user?.image || "/placeholder.svg"} />
                  <AvatarFallback>
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
