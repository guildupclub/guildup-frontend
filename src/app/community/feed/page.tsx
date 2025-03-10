"use client";

import { Feed } from "@/components/community/feed/Feed";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaUsers } from "react-icons/fa";
import { StringConstants } from "@/components/common/CommonText";

export default function FeedPage() {
  const { data: session } = useSession();
  const activeCommunity = useSelector(
    (state: RootState) => state.channel.activeCommunity
  );
  const userFollowedCommunities = useSelector(
    (state: RootState) => state.user.userFollowedCommunities
  );

  const activeCommunityId = activeCommunity?.id;

  // Show message for users without communities
  if (!session || (userFollowedCommunities && userFollowedCommunities.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="flex flex-col items-center space-y-6 max-w-md text-center">
          <FaUsers className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">
            {!session ? "Welcome to Community Feed" : "No Communities Joined"}
          </h1>
          <p className="text-muted-foreground">
            {!session 
              ? "Join our community to start interacting with other members"
              : "Join some communities to see their posts and interact with members"}
          </p>
          <div className="flex gap-4">
            <Link
              href="/explore"
              className="px-4 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {StringConstants.EXPLORE_CREATOR}
            </Link>
            {!session && (
              <Link
                href="/api/auth/signin"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
               {StringConstants.SIGN_IN}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {activeCommunityId ? (
        <Feed communityId={activeCommunityId} />
      ) : (
        <p className="text-center text-muted">{StringConstants.SELECT_A_PAGE}</p>
      )}
    </div>
  );
} 