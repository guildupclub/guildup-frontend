"use client";

import { ProfileCard } from "@/components/profile/ProfileCard";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCommunityData } from "@/redux/communitySlice";

export default function Page() {
  const params = useParams();
  const communityId = params.id as string;
  const dispatch = useDispatch();
  
  // Set the community ID in Redux when the page loads
  useEffect(() => {
    if (communityId) {
      dispatch(setCommunityData({
        communityId: communityId,
        userId: null, // This will be updated when profile data loads
      }));
    }
  }, [communityId, dispatch]);

  return (
    <div className="min-h-screen bg-background grow max-w-screen w-full md:ml-6 md:py-24">
      <ProfileCard communityId={communityId} />
    </div>
  );
}
