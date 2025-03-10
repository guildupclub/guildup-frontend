"use client";
import { Feed } from "@/components/community/feed/Feed";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { StringConstants } from "@/components/common/CommonText";

export default function FeedPage() {
  const activeCommunity = useSelector(
    (state: RootState) => state.channel.activeCommunity
  );

  const activeCommunityId = activeCommunity?.id;
  return (
    <div className="min-h-screen bg-background">
      {activeCommunityId ? (
        <Feed communityId={activeCommunityId} />
      ) : (
        <p className="text-center">{StringConstants.SELECT_A_PAGE}</p>
      )}
    </div>
  );
}
