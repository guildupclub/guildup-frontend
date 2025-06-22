"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { 
  useJoinCommunity, 
  useLeaveCommunity,
  useCommunityStats,
  useCommunityMember
} from "@/hooks/api/useCommunityQueries";
import { useRouteParams } from "@/hooks/useRouteParams";
import { formatCompactNumber } from "@/utils/formatters";
import { StringConstants } from "../common/CommonText";
import Loader from "../Loader";

// Components
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AddOfferingDialog } from "./AddOfferingdialog";
import { EditCommunityModal } from "../form/editCommunity";
import EditOfferingModal from "./UpdateOffering";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import { Edit, Share2 } from "lucide-react";
import type { Community } from "@/types/community.types";

interface ProfileCardProps {
  community: Community;
  communityId: string;
  onRefetch?: () => void;
}

interface Offering {
  _id: string;
  title: string;
  description: string;
  type: string;
  price: {
    amount: number;
    currency: string;
  };
  discounted_price: string;
  when: Date;
  duration: number;
  is_free: boolean;
  tags: string[];
  rating: number;
  total_ratings: number;
}

export function ProfileCard({ 
  community, 
  communityId: propCommunityId, 
  onRefetch 
}: ProfileCardProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { communityId: routeCommunityId } = useRouteParams();
  
  // Use community ID from props or route
  const activeCommunityId = propCommunityId || routeCommunityId;
  
  // Fetch additional data that's not included in basic community info
  const {
    data: communityStats,
    isLoading: isStatsLoading
  } = useCommunityStats(activeCommunityId || '', !!activeCommunityId);

  const {
    data: userMembership,
    isLoading: isMembershipLoading
  } = useCommunityMember(
    activeCommunityId || '', 
    user?._id || '', 
    !!(activeCommunityId && user?._id)
  );
  
  const joinCommunityMutation = useJoinCommunity();
  const leaveCommunityMutation = useLeaveCommunity();

  // Local state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOfferingModal, setSelectedOfferingModal] = useState<any>(null);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);

  // Check if user is member of the community - use membership query result if available
  const isUserMember = userMembership ? true : (user?.community_joined?.includes(activeCommunityId || '') || false);
  const isOwner = community?.owner_id === user?._id;

  const handleJoinCommunity = useCallback(async () => {
    if (!activeCommunityId || !user) return;
    
    try {
      await joinCommunityMutation.mutateAsync({
        communityId: activeCommunityId,
      });
      // Refetch community data to update member count
      onRefetch?.();
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error('Join community error:', error);
    }
  }, [activeCommunityId, user, joinCommunityMutation, onRefetch]);

  const handleLeaveCommunity = useCallback(async () => {
    if (!activeCommunityId || !user) return;
    
    try {
      await leaveCommunityMutation.mutateAsync(activeCommunityId);
      // Refetch community data to update member count
      onRefetch?.();
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error('Leave community error:', error);
    }
  }, [activeCommunityId, user, leaveCommunityMutation, onRefetch]);

  const handleShareClick = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: community?.name || 'Community',
          text: community?.description || 'Check out this community',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showSuccess('Link copied to clipboard!');
      }
    } catch (error) {
      showError('Failed to share');
    }
  }, [community?.name, community?.description, showSuccess, showError]);

  // Get member count from stats or fallback to community data
  const memberCount = communityStats?.member_count ?? community?.member_count ?? 0;
  const postCount = communityStats?.post_count ?? 0;

  const isLoading = isMembershipLoading || isStatsLoading;
  const isMutating = joinCommunityMutation.isPending || leaveCommunityMutation.isPending;

  return (
    <TooltipProvider>
      <div className="bg-card rounded-lg shadow-sm border">
        {/* Community Header */}
        <div className="relative">
          {/* Background Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
            {community.background_image && (
              <Image
                src={community.background_image}
                alt="Community background"
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
          
          {/* Community Avatar */}
          <div className="absolute -bottom-8 left-6">
            <div className="w-16 h-16 bg-white rounded-full p-1 shadow-lg">
              <Image
                src={community.image || '/defaultCommunityIcon.png'}
                alt={community.name || 'Community'}
                width={56}
                height={56}
                className="rounded-full object-cover"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShareClick}
                  className="bg-white/90 hover:bg-white"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share community</TooltipContent>
            </Tooltip>
            
            {isOwner && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit community</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Community Info */}
        <div className="p-6 pt-12">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{community.name}</h1>
              {community.category && (
                <p className="text-muted-foreground text-sm">
                  {community.category}
                </p>
              )}
            </div>
            
            {!isOwner && user && (
              <Button
                onClick={isUserMember ? handleLeaveCommunity : handleJoinCommunity}
                variant={isUserMember ? "outline" : "default"}
                disabled={isMutating}
                className="ml-4"
              >
                {isMutating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {isUserMember ? 'Leaving...' : 'Joining...'}
                  </div>
                ) : (
                  isUserMember ? 'Leave' : 'Join'
                )}
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-4">
            <div className="text-center">
              <div className="font-semibold">
                {isLoading ? (
                  <div className="w-8 h-4 bg-gray-200 animate-pulse rounded" />
                ) : (
                  formatCompactNumber(memberCount)
                )}
              </div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
            
            {postCount > 0 && (
              <div className="text-center">
                <div className="font-semibold">
                  {isLoading ? (
                    <div className="w-8 h-4 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    formatCompactNumber(postCount)
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
            )}
          </div>

          {/* Description */}
          {community.description && (
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {community.description}
            </p>
          )}

          {/* Tags */}
          {community.tags && community.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {community.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <EditCommunityModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            profile={{
              name: community.name,
              description: community.description,
              category: community.category,
              rules: Array.isArray(community.rules) ? community.rules.join('\n') : (community.rules || ''),
              additional_tags: community.tags || [],
              image: community.image || '',
              bgImage: community.background_image || '',
              instagram_followers: '',
              youtube_followers: '',
              linkedin_followers: '',
              community: {
                name: community.name,
                description: community.description,
                category: community.category,
                rules: community.rules || '',
                tags: community.tags || [],
                image: community.image,
                bgImage: community.background_image,
              }
            }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
