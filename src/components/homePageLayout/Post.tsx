"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, MoreVertical } from "lucide-react"
import Image from "next/image"

interface PostProps {
  title: string
  body: string
  created_At: string
  up_votes: number
  reply_count: number
  post_type: "text" | "media"
  mediaUrl?: string
}

export function Post({ title, body, created_At, up_votes, reply_count, post_type, mediaUrl }: PostProps) {
  return (
    <div className="p-4 border-b border-zinc-800">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-zinc-200">{title}</h3>
              <span className="text-xs text-zinc-500">• {new Date(created_At).toLocaleDateString()}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-sm text-zinc-300">{body}</p>
          {post_type === "media" && mediaUrl && (
            <div className="mt-3 relative aspect-video rounded-lg overflow-hidden">
              <Image src={mediaUrl || "/placeholder.svg"} alt="Post media" fill className="object-cover" />
            </div>
          )}
          <div className="flex items-center gap-4 mt-4">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-300">
              <Heart className="h-4 w-4 mr-1" />
              {up_votes}
            </Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-300">
              <MessageCircle className="h-4 w-4 mr-1" />
              {reply_count}
            </Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-300">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

