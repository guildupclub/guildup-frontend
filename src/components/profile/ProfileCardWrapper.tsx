"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCommunityData } from "@/redux/communitySlice";
import { ProfileCard } from "./ProfileCard";

interface ProfileCardWrapperProps {
  communityId: string;
  initialProfile?: any;
  initialOfferings?: any[];
}

/**
 * Client wrapper component that handles Redux state management
 * and passes initial server-rendered data to ProfileCard
 */
export function ProfileCardWrapper({ 
  communityId, 
  initialProfile,
  initialOfferings 
}: ProfileCardWrapperProps) {
  const dispatch = useDispatch();

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
    <ProfileCard 
      communityId={communityId}
      initialProfile={initialProfile}
      initialOfferings={initialOfferings}
    />
  );
}

