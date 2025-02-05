"use client";

import Members from "@/components/community/members/Members";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export default function MembersPage() {
  const activeCommunityId = useSelector(
    (state: RootState) => state.channel.activeCommunityId
  );

  return (
    <div className="min-h-screen bg-black py-20 text-center text-zinc-200">
      {activeCommunityId ? (
        <Members communityId={activeCommunityId} />
      ) : (
        <p className="text-center text-zinc-400">Select a community</p>
      )}
    </div>
  );
}
