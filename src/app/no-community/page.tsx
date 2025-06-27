"use client";

import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaUsers, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "sonner";
import { Dialog } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { StringConstants } from "@/components/common/CommonText";
import CreatorForm from "@/components/form/CreatorForm";
import { useUserCommunities } from "@/hooks/api/useCommunityQueries";

const NoCommunitySelected = () => {
  const { user, isAuthenticated, login } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Try to fetch user communities to check if they actually have any
  const {
    data: userCommunitiesData,
    isLoading: communitiesLoading,
    error: communitiesError
  } = useUserCommunities(
    user?.id || '',
    undefined,
    isAuthenticated && !!user?.id
  );

  const communities = userCommunitiesData?.data || [];
  const hasCommunities = communities.length > 0;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If user has communities but ended up here, redirect to first community
  useEffect(() => {
    if (hasCommunities && !communitiesLoading) {
      const firstCommunity = communities[0];
      if (firstCommunity) {
        const communityParam = `${firstCommunity.name.replace(/\s+/g, '-').toLowerCase()}-${firstCommunity._id}`;
        window.location.href = `/community/${communityParam}/feed`;
      }
    }
  }, [hasCommunities, communities, communitiesLoading]);

  const handleCreateCommunity = () => {
    if (!isAuthenticated) {
      login({ email: "", password: "" });
      return;
    }
    setIsDialogOpen(true);
  };

  const handleSignIn = () => {
    login({ email: "", password: "" });
  };

  if (!isMounted) {
    return null;
  }

  // Show loading state while checking communities
  if (communitiesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Checking your communities...</p>
      </div>
    );
  }

  // Show error state if there's an API error
  if (communitiesError && isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center max-w-md mx-auto px-4">
        <FaExclamationTriangle className="text-6xl text-yellow-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Unable to Load Communities</h2>
        <p className="text-gray-600 mb-4">
          We're having trouble loading your communities. This might be a temporary issue.
        </p>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
          <Button asChild>
            <Link href="/">
              Explore Communities
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show sign-in prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center max-w-md mx-auto px-4">
        <FaUsers className="text-6xl text-gray-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Join the Community</h2>
        <p className="text-gray-600 mb-4">
          Sign in to join communities, connect with like-minded people, and start meaningful conversations.
        </p>
        <div className="flex gap-4">
          <Button onClick={handleSignIn}>
            Sign In
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              Explore First
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show community creation options for authenticated users with no communities
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center max-w-md mx-auto px-4">
      <FaUsers className="text-6xl text-gray-500 mb-4" />
      <h2 className="text-2xl font-semibold mb-2">No Communities Yet</h2>
      <p className="text-gray-600 mb-4">
        You haven't joined any communities yet. Explore existing communities or create your own to get started!
      </p>
      
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Button asChild className="w-full">
          <Link href="/">
            🔍 Explore Communities
          </Link>
        </Button>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button 
            variant="outline" 
            onClick={handleCreateCommunity}
            className="w-full"
          >
            <span className="text-amber-500 mr-2">👋</span>
            {StringConstants.CREATE_A_PAGE}
          </Button>
          {isAuthenticated && <CreatorForm onClose={() => setIsDialogOpen(false)} />}
        </Dialog>
        
        <div className="text-sm text-gray-500 mt-2">
          <p>💡 Tip: Join communities that match your interests to connect with experts and enthusiasts!</p>
        </div>
      </div>
    </div>
  );
};

export default NoCommunitySelected;
