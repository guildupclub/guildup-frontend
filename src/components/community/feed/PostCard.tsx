"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircleMore, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommentSection } from "./CommentSection";
import { FaEdit, FaShare } from "react-icons/fa";
import { StringConstants } from "@/components/common/CommonText";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import DOMPurify from "dompurify";
import { IoEllipsisVerticalSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


interface PostCardProps {
  post: {
    _id: string;
    title: string;
    body: string;
    user_id: string;
    up_votes: number;
    down_votes: number;
    reply_count: number;
    created_At: string;
    is_locked: boolean;
    post_type: string;
    media?: {
      publicUrl: string;
      fileType: string;
    };
  };
  onDelete?: (postId: string) => void;
  onUpdate?: (updatedPost: any) => void;
}

export function PostCard({ post, onDelete, onUpdate }: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [relativeTime, setRelativeTime] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { data: session } = useSession();
  const activeCommunity = useSelector(
    (state: RootState) => state.channel.activeCommunity
  );
  const userId = useSelector((state: RootState) => state.user.user._id);

  const name = activeCommunity?.name;
  const getInitials = (name: string) => {
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

  const handleMenuClick = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const openDeleteConfirmation = () => {
    setShowDeleteDialog(true);
    setIsMenuOpen(false); // Close the menu when opening the dialog
  };

  // const openEditDialog = () => {
  //   setShowEditDialog(true);
  //   setIsMenuOpen(false); // Close the menu when opening the dialog
  // };

  const handleDeletePost = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/delete`,
        {
          postId: post._id,
          communityId: activeCommunity?.id,
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

  const handlePostUpdate = (updatedPost: any) => {
    // Update the post in the parent component
    if (onUpdate) {
      onUpdate({
        ...post,
        ...updatedPost,
      });
    }
  };

  const parsedBody =
    post.body.startsWith('"') && post.body.endsWith('"')
      ? post.body.slice(1, -1)
      : post.body;
  const sanitizedBody = DOMPurify.sanitize(parsedBody.trim());

  const isCurrentUserAuthor = session?.user?.id === post.user_id;

  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-purple-500">
            <AvatarImage src={activeCommunity?.image || "/placeholder.svg"} />
            <AvatarFallback>{getInitials(name || "")}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-muted-foreground leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-medium">{activeCommunity?.name}</span>
              <Badge variant="outline" className="text-xs bg-transparent">
                {StringConstants.HOST}
              </Badge>
            </div>
            <span className="text-sm">{relativeTime}</span>
          </div>
          <div className="relative">
            <button onClick={handleMenuClick}>
              <IoEllipsisVerticalSharp />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg p-4 z-10">
                <ul className="space-y-2">
                  {/* <li
                    onClick={openEditDialog}
                    className="flex items-center gap-2 cursor-pointer hover:text-purple-500"
                  >
                    <FaEdit className="w-5 h-5" />
                    <span>Edit</span>
                  </li>
                  <li className="flex items-center gap-2 cursor-pointer hover:text-purple-500">
                    <FaShare className="w-5 h-5" />
                    <span>{StringConstants.SHARE}</span>
                  </li> */}

                  <li
                    onClick={openDeleteConfirmation}
                    className="flex items-center gap-2 cursor-pointer text-center justify-center hover:text-purple-500"
                  >
                    <MdDelete className="w-5 h-5" />
                    <span>Delete</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-3 text-muted-foreground">
          <div
            className="text-sm text-accent mt-2"
            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
          />

          {post?.media?.publicUrl && post?.media?.fileType === "image" && (
            <img
              src={post.media.publicUrl || "/placeholder.svg"}
              alt="Post Image"
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

        {/* Actions */}
        <div className="flex items-center gap-6 mt-4 text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-purple-400 gap-2 hover:bg-transparent"
            onClick={() => setLiked(!liked)}
          >
            <Heart
              className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : ""}`}
            />
            <span>
              {post.up_votes} {StringConstants.LIKE}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hover:text-purple-400 gap-2 hover:bg-transparent"
            onClick={() => setIsCommenting(!isCommenting)}
          >
            <MessageCircleMore className="h-5 w-5" />
            <span>
              {post.reply_count} {StringConstants.COMMENT}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-purple-400 gap-2 hover:bg-transparent"
          >
            <Send className="-5 w-5" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {isCommenting && (
        <div className="border-t border-zinc-800">
          <CommentSection postId={post._id} />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? you won&apos;t be able to
              undo this action.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
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

      {/* Edit Post Dialog */}
      {/* <EditPost
        isOpen={showEditDialog}
        setIsOpen={setShowEditDialog}
        postId={post._id}
        postToEdit={post}
        onPostUpdated={handlePostUpdate} */}
      {/* /> */}
    </div>
  );
}
