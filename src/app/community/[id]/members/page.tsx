"use client";

import Members from "@/components/community/members/Members";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { StringConstants } from "@/components/common/CommonText";
import { useParams } from "next/navigation";

export default function MembersPage() {

  const params= useParams()
  const activeCommunityId = params.id as string;

  return (
    <div className="min-h-screen bg-background py-20 text-center px-4">
      {activeCommunityId ? (
        <Members communityId={activeCommunityId} />
      ) : (
        <p className="text-center text-muted">{StringConstants.SELECT_A_COMMUNITY}</p>
      )}
    </div>
  );
}
