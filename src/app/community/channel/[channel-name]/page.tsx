"use client";
import { Feed } from "@/components/community/feed/Feed";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import CommunityChat from "@/components/community/CommunityChat";

export default function FeedPage() {
  const activeCommunityId = useSelector(
    (state: RootState) => state.channel.activeCommunityId
  );
  return (
    <div className="py-16">
      <CommunityChat />
    </div>
  );
}
