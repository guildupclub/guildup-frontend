"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircleMore,
  MessageSquare,
  Send,
  Share2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommentSection } from "./CommentSection";
import { FaShare } from "react-icons/fa";
import { StringConstants } from "@/components/common/CommonText";
import { useSession } from "next-auth/react";

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
}

export function PostCard({ post }: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [relativeTime, setRelativeTime] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    setRelativeTime(
      formatDistanceToNow(new Date(post.created_At), { addSuffix: true })
    );
  }, [post.created_At]);

  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-purple-500">
            <AvatarImage src={session?.user?.image} />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">{session?.user?.name}</span>
              <Badge variant="outline" className="text-xs bg-transparent">
                {StringConstants.HOST}
              </Badge>
              <span className="text-sm">{relativeTime}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3 text-muted-foreground">
          <p>{post.body}</p>

          {post?.media?.publicUrl && post?.media?.fileType === "image" && (
            <img
              src={post.media.publicUrl}
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
            <span>{post.up_votes} {StringConstants.LIKE}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hover:text-purple-400 gap-2 hover:bg-transparent"
            onClick={() => setIsCommenting(!isCommenting)}
          >
            <MessageCircleMore className="h-5 w-5" />
            <span>{post.reply_count} {StringConstants.COMMENT}</span>
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
    </div>
  );
}
