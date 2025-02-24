import React from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";

interface CommunityCardProps {
  community: {
    _id: string;
    name: string;
    description: string;
    num_member: number;
    image?: string;
    icon?: string;
  };
  onClick: (id: string) => void;
}

function CommunityCard({ community, onClick }: CommunityCardProps) {
  return (
    <Card className="mb-4 break-inside-avoid border-none rounded-lg bg-card w-[292px] overflow-hidden shadow-md cursor-pointer transition-colors">
      {/* Cover Image */}
      <div className="p-3 pb-0 flex justify-center items-center">
        <div className="relative aspect-video h-[100px] w-full rounded-lg overflow-hidden">
          <Image
            src={community.image || "/defaultCommunityIcon.png"}
            alt={community.name}
            fill
            className="object-cover"
            priority={false}
            unoptimized
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Community Name & Icon */}
        <div className="flex items-center space-x-2 mb-2">
          <Image
            src={community.icon || "/defaultCommunityIcon.png"}
            alt={community.name}
            width={24}
            height={24}
            className="rounded-full"
          />
          <h3
            className="font-semibold text-accent text-[18px] cursor-pointer "
            onClick={() => onClick(community._id)}
          >
            {community.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-accent mb-4 max-h-[72px] overflow-hidden text-ellipsis">
          {community.description}
        </p>

        {/* Members Count */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {community.num_member} members
          </span>
        </div>
      </div>
    </Card>
  );
}

export default React.memo(CommunityCard);
