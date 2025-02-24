"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommentSection } from "./CommentSection";

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
  };
}

export function PostCard({ post }: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-purple-500">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="">UN</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium ">User Name</span>
              <Badge variant="outline" className="text-xs bg-transparent ">
                Host
              </Badge>
              <span className="text-sm">
                {formatDistanceToNow(new Date(post.created_At), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3 text-muted-foreground">
          <p className="">{post.body}</p>
          {post.post_type === "video" && (
            <div className="mt-4 aspect-video bg-background rounded-lg overflow-hidden">
              {/* Video player would go here */}
              <div className="w-full h-full flex items-center justify-center ">
                Video Content
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 mt-4 text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className=" hover:text-purple-400 gap-2 hover:bg-transparent"
            onClick={() => setLiked(!liked)}
          >
            <Heart
              className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : ""}`}
            />
            <span>{post.up_votes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hover:text-purple-400 gap-2 hover:bg-transparent"
            onClick={() => setIsCommenting(!isCommenting)}
          >
            <MessageSquare className="w-5 h-5" />
            <span>{post.reply_count}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className=" hover:text-purple-400 gap-2 hover:bg-transparent"
          >
            <Share2 className="w-5 h-5" />
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
