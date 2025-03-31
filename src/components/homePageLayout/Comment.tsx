"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Plus, Send } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"

interface CommentProps {
  author: string
  level: number
  content: string
  timestamp: string
  likes: number
  commentId: string
  postId: string
  replies?: CommentProps[]
}

export function Comment({ author, level, content, timestamp, likes, commentId, postId, replies }: CommentProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState("")
  const queryClient = useQueryClient()
  const userId = useSelector((state: RootState) => state.user.user?._id)

  // Add reply mutation
  const replyMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/reply/replyComment`, {
        postId,
        commentId,
        text,
        userId,
      })
      return response.data.data
    },
    onSuccess: () => {
      // Invalidate and refetch comments and replies
      queryClient.invalidateQueries({ queryKey: ["replies", commentId] })
      queryClient.invalidateQueries({ queryKey: ["comments", postId] })
      // Also invalidate post data to update comment count
      queryClient.invalidateQueries({ queryKey: ["post", postId] })
    },
  })

  const handleReplySubmit = () => {
    if (!replyText.trim()) return

    replyMutation.mutate(replyText)
    setReplyText("")
    setIsReplying(false)
  }

  return (
    <div className="group">
      <div className="flex gap-3 py-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>{author[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-muted">{author}</span>
            <span className="text-xs text-accent">Level {level}</span>
            <span className="text-xs text-accent">{timestamp}</span>
          </div>
          <p className="text-sm text-accent mt-1">{content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button onClick={() => setIsLiked(!isLiked)} className="flex items-center gap-1 text-accent">
              <Heart className={`h-4 w-4 ${isLiked ? "text-red-500 fill-red-500" : ""}`} />
              <span className="text-xs">{likes}</span>
            </button>
            <button onClick={() => setIsReplying(!isReplying)} className="text-xs text-accent">
              Reply
            </button>
          </div>

          {isReplying && (
            <div className="mt-3 flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full bg-background rounded-full px-4 py-2 text-sm text-accent focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-accent">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-accent">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-purple-500"
                    onClick={handleReplySubmit}
                    disabled={replyMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {replies && replies.length > 0 && (
        <div className="ml-11 border-l-2 border-zinc-800">
          <div className="pl-4">
            {replies.map((reply, index) => (
              <Comment key={index} {...reply} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

