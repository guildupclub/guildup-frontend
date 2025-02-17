"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Play, Mic, Send } from "lucide-react";

interface PostCardProps {
  id: string;
  author: string;
  time: string;
  level: number;
  content: string;
  likes: number;
  comments: number;
  avatar: string;
  onLike: (id: string) => void;
  onComment: (id: string, comment: string) => void;
}

export function PostCard({
  id,
  author,
  time,
  level,
  content,
  likes,
  comments,
  avatar,
  onLike,
  onComment,
}: PostCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [duration, setDuration] = useState("0:00");
  const [message, setMessage] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      onComment(id, message);
      setMessage("");
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(id);
  };

  return (
    <div className="rounded-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 ">
      <div className="space-y-2 p-2">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 rounded-full border border-zinc-800">
            <AvatarImage src={avatar} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-200">{author}</span>
              <span className="text-sm text-zinc-500">{time}</span>
              <span className="rounded bg-zinc-800/50 px-1.5 py-0.5 text-xs text-zinc-400">
                Level {level}
              </span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{content}</p>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 hover:bg-transparent px-0 ${
                  isLiked ? "text-red-500" : "text-zinc-400 hover:text-zinc-300"
                }`}
                onClick={handleLike}
              >
                <Heart className="h-4 w-4" />
                {likes + (isLiked ? 1 : 0)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-zinc-400 hover:text-zinc-300 hover:bg-transparent px-0"
              >
                <MessageCircle className="h-4 w-4" />
                {comments}
              </Button>
            </div>
          </div>
        </div>

        <div className="ml-14 flex items-center gap-2 bg-black rounded-lg p-1">
          {isRecording ? (
            <div className="flex-1 flex items-center gap-2 text-zinc-400 text-sm">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              {duration}
            </div>
          ) : (
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type..."
              className="flex-1 bg-transparent border-0 text-sm text-zinc-200 placeholder:text-zinc-400 focus-visible:ring-0 px-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          )}
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-zinc-800"
              onClick={() => setIsRecording(!isRecording)}
            >
              <Mic className="h-4 w-4" />
            </Button>
            {isRecording ? (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-zinc-800"
              >
                <Play className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-zinc-800"
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
