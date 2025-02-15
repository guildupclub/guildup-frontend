import React from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import guildup_logo from "../../../public/guildup_logo.svg";
interface PostCardProps {
  post: {
    _id: string;
    title: string;
    body: string;
    up_votes: number;
    down_votes: number;
    posted_at: string;
    type: string;
  };
  onClick: (id: string) => void;
}

function PostCard({ post, onClick }: PostCardProps) {
  return (
    <Card
    //   onClick={() => onClick(post._id)}
      className="mb-4 break-inside-avoid border-none rounded-lg bg-[#19191A]  w-[292px] overflow-hidden shadow-md cursor-pointer hover:bg-[#242425] transition-colors"
    >
      <div className="p-3 pb-0 flex justify-center align-center">
        <div className="relative aspect-video h-[100px] w-[100%] rounded-lg overflow-hidden">
          <Image
            src={guildup_logo}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Image
            src={guildup_logo}
            alt="User"
            width={24}
            height={24}
            className="rounded-full"
          />
          <h3 className="font-semibold text-white text-[18px] line-clamp-1">
            {post.title}
          </h3>
        </div>
        <p className="text-sm text-gray-400 mb-4 lg:h-[9vh] md:h-[4vh] sm:h-[4vh] overflow-hidden text-ellipsis line-clamp-3">
          {post.body}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(post.posted_at), { addSuffix: true })}
          </span>
          <span className="text-xs text-gray-500">
            {post.up_votes - post.down_votes} votes
          </span>
        </div>
      </div>
    </Card>
  );
}

export default React.memo(PostCard);
