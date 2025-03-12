"use client";

import { Feed } from "@/components/community/feed/Feed";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaUsers } from "react-icons/fa";
import { StringConstants } from "@/components/common/CommonText";
import { useRouter } from "next/navigation";

export default function FeedPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const activeCommunity = useSelector(
    (state: RootState) => state.channel.activeCommunity
  );
  const userFollowedCommunities = useSelector(
    (state: RootState) => state.user.userFollowedCommunities
  );

  const activeCommunityId = activeCommunity?.id;

  // Show message for users without communities
  if (
    !session ||
    (userFollowedCommunities && userFollowedCommunities.length === 0)
  ) {
    return router.push("/no-community");
  }

  return (
    <div className="min-h-screen flex grow bg-background">
      {activeCommunityId ? (
        <Feed communityId={activeCommunityId} />
      ) : (
        <p className="text-center text-muted">
          {StringConstants.SELECT_A_PAGE}
        </p>
      )}
    </div>
  );
}
