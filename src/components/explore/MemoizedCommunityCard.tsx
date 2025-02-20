import React from "react";
import { Card } from "../ui/card";
import Image from "next/image";

function MemoizedCommunityCard({
  community,
  onClick,
}: {
  community: any;
  onClick: (id: string) => void;
}) {
  return (
    <Card
      onClick={() => onClick(community._id)}
      className="mb-4 break-inside-avoid border-none rounded-lg w-full lg:w-[292px] overflow-hidden shadow-md"
    >
      <div className="p-3 px-6  pb-0 flex justify-center align-center">
        <div className="relative aspect-video h-[130px] lg:h-[100px] w-[100%] rounded-lg overflow-hidden">
          <Image
            src={community.image || "/defaultCommunityIcon.png"}
            alt={community.name}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Image
            src={community.icon || "/defaultCommunityIcon.png"}
            alt={community.name}
            width={24}
            height={24}
            className="rounded-full"
          />
          <h3 className="font-semibold text-muted  text-[18px]">
            {community.name}
          </h3>
        </div>
        <p className="text-sm mb-4 lg:h-[9vh] md:h-[4vh] sm:h-[4vh] overflow-hidden text-accent text-ellipsis line-clamp-3">
          {community.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {community.num_member} members
          </span>
        </div>
      </div>
    </Card>
  );
}

export default React.memo(MemoizedCommunityCard);
