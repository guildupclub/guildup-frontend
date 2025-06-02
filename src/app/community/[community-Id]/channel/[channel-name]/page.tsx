"use client";
import { Feed } from "@/components/community/feed/Feed";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import CommunityChat from "@/components/community/CommunityChat";
import CommunityChat2 from "@/components/community/ChatCommunity";

export default function FeedPage() {
  const activeChannel = useSelector(
    (state: RootState) => state.channel.activeChannel
  );

  const activeChanneltype = activeChannel?.type || "discussion";

  return (
    <div className="md:py-16 w-full">
      {activeChanneltype == "discussion" ? (
        <CommunityChat />
      ) : (
        <CommunityChat2 />
      )}
    </div>
  );
}
