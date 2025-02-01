"use client";
import { Feed } from "@/components/community/feed/Feed";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export default function FeedPage() {
  const activeCommunityId = useSelector(
    (state: RootState) => state.channel.activeCommunityId
  );
  return (
    <div className="min-h-screen bg-black">
      {activeCommunityId ? (
        <Feed communityId={activeCommunityId} />
      ) : (
        <p className="text-center text-zinc-400">Select a community</p>
      )}
    </div>
  );
}
