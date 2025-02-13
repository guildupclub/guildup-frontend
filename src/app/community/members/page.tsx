"use client";

import Members from "@/components/community/members/Members";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export default function MembersPage() {
  const activeCommunity = useSelector(
    (state: RootState) => state.channel.activeCommunity
  );

  const activeCommunityId = activeCommunity?.id;

  return (
    <div className="min-h-screen bg-black py-20 text-center text-zinc-200 px-4">
      {activeCommunityId ? (
        <Members communityId={activeCommunityId} />
      ) : (
        <p className="text-center text-zinc-400">Select a community</p>
      )}
    </div>
  );
}
