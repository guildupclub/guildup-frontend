"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageSquare, ImageIcon, Mic } from "lucide-react";
import { StringConstants } from "@/components/common/CommonText";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comment, setComment] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  return (
    <div className="p-4 space-y-4">
      {/* Comment Input */}
      <div className="flex gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 bg-zinc-900/50 rounded-lg p-2">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type..."
              className="min-h-[40px] bg-transparent border-0 focus-visible:ring-0 resize-none p-0"
            />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-zinc-400">
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-zinc-400">
                <Mic className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Comments */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>RV</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">RaviVerma</span>
              <span className="text-sm text-zinc-400">2h ago</span>
            </div>
            <p className="mt-1 text-zinc-300">
              Great video! Never realized how much inflation could affect my
              savings.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-purple-400 h-auto py-1"
              >
                <Heart className="w-4 h-4 mr-1" />
                <span className="text-xs">15</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-purple-400 h-auto py-1"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                <span className="text-xs">{StringConstants.REPLY}</span>
              </Button>
            </div>

            {/* Nested Reply */}
            <div className="mt-3 pl-6">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">ArchanaRanade</span>
                    <span className="text-sm text-zinc-400">1h ago</span>
                  </div>
                  <p className="mt-1 text-zinc-300">Yes, Ravi!</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-purple-400 h-auto py-1"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      <span className="text-xs">10</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-purple-400 h-auto py-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      <span className="text-xs">{StringConstants.REPLY}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
