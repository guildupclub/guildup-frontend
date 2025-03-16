"use client";
import { Feed } from "@/components/community/feed/Feed";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { StringConstants } from "@/components/common/CommonText";
import { useParams } from "next/navigation";

export default function FeedPage() {
  const params = useParams();
  const activeCommunityId =  params.id;

  return (
    <div className="min-h-screen bg-background">
      {activeCommunityId ? (
        <Feed communityId={activeCommunityId as string} />
      ) : (
        <p className="text-center">{StringConstants.SELECT_A_PAGE}</p>
      )}
    </div>
  );
}
