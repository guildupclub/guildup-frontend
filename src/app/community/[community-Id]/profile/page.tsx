"use client";

import { ProfileCard } from "@/components/profile/ProfileCard";
import { useRouteParams } from "@/hooks/useRouteParams";
import { useCommunity } from "@/hooks/api/useCommunityQueries";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";

export default function Page() {
  const { communityId } = useRouteParams();
  const { user } = useAuth();
  
  // Fetch community data using the new query hook
  const {
    data: community,
    isLoading,
    error,
    refetch
  } = useCommunity(communityId || "", !!communityId);

  console.log("@community", community);
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background grow max-w-screen w-full md:ml-6 md:py-24 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background grow max-w-screen w-full md:ml-6 md:py-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading community</h2>
          <p className="text-gray-600">{error instanceof Error ? error.message : 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!community && !isLoading) {
    return (
      <div className="min-h-screen bg-background grow max-w-screen w-full md:ml-6 md:py-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Community not found</h2>
          <p className="text-gray-600">The community you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grow max-w-screen w-full md:ml-6 md:py-24">
      {community && (
        <ProfileCard 
          community={community}
          communityId={communityId || ''}
          onRefetch={refetch}
        />
      )}
    </div>
  );
}
