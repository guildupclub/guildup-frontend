"use client";

import { ProfileCard } from "@/components/profile/ProfileCard";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCommunityData } from "@/redux/communitySlice";

export default function Page() {
  const params = useParams();
  const communityParam = params["community-Id"] as string;
  const dispatch = useDispatch();
  const lastHyphenIndex = communityParam ? communityParam.lastIndexOf("-") : -1;
  const communityName =
    lastHyphenIndex !== -1
      ? communityParam.substring(0, lastHyphenIndex)
      : null;
  const communityId =
    lastHyphenIndex !== -1
      ? communityParam.substring(lastHyphenIndex + 1)
      : null;

  useEffect(() => {
    if (communityId) {
      dispatch(
        setCommunityData({
          communityId: communityId,
          userId: "", 
        })
      );
    }
  }, [communityId, dispatch]);

  return (
    <div className="h-screen bg-white grow max-w-screen w-full md:ml-6 md:py-6">
      {communityId && <ProfileCard />}
    </div>
  );
}
