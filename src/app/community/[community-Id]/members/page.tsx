"use client";

import Members from "@/components/community/members/Members";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { StringConstants } from "@/components/common/CommonText";
import { useParams } from "next/navigation";

export default function MembersPage() {
  const params = useParams();
  const communityParam = params["community-Id"] as string;
  const lastHyphenIndex = communityParam ? communityParam.lastIndexOf("-") : -1;
  const activeCommunityId =
    lastHyphenIndex !== -1
      ? communityParam.substring(lastHyphenIndex + 1)
      : null;

  return (
    <div className="min-h-screen bg-background md:py-20 text-center ps-2 w-full">
      {activeCommunityId ? (
        <Members communityId={activeCommunityId} />
      ) : (
        <p className="text-center text-muted">
          {StringConstants.SELECT_A_COMMUNITY}
        </p>
      )}
    </div>
  );
}
