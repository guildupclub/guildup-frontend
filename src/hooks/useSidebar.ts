import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { RootState } from '@/redux/store';
import { setActiveChannel } from '@/redux/channelSlice';
import { clearMemberDetails, setMemberDetails } from '@/redux/memberSlice';
import { useRouteParams } from '@/hooks/useRouteParams';
import { useChannels, useCreateChannel, useDeleteChannel } from '@/hooks/api/useChannelQueries';
import { useCommunity, useCommunityMember } from '@/hooks/api/useCommunityQueries';
import { QUERY_KEYS } from '@/utils/constants';

export interface SidebarFormData {
  name: string;
  type: 'chat' | 'post';
  is_locked: boolean;
}

export function useSidebar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  
  // Get route parameters
  const { communityId, communityName } = useRouteParams();
  
  // Redux state
  const memberDetails = useSelector((state: RootState) => state.member.memberDetails);
  const activeChannel = useSelector((state: RootState) => state.channel.activeChannel);
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const sessionId = useSelector((state: RootState) => state.user.sessionId);
  
  // Local state
  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<SidebarFormData>({
    name: '',
    type: 'chat',
    is_locked: false,
  });

  // Computed values
  const isAdmin = memberDetails?.is_owner || memberDetails?.is_moderator || false;
  const communityParam = communityName && communityId ? `${communityName}-${communityId}` : '';
  
  // Navigation paths
  const navigationPaths = {
    COMMUNITY_PROFILE: communityParam ? `/community/${communityParam}/profile` : '/community',
    COMMUNITY_MEMBERS: communityParam ? `/community/${communityParam}/members` : '/community',
    COMMUNITY_CHANNEL: communityParam ? `/community/${communityParam}/channel` : '/community',
    COMMUNITY_FEED: communityParam ? `/community/${communityParam}/feed` : '/community',
  };

  // Queries
  const {
    data: communityDetails,
    isLoading: isLoadingCommunity,
    error: communityError,
  } = useCommunity(communityId || '', !!communityId);

  const {
    data: channelsData,
    isLoading: isLoadingChannels,
    error: channelsError,
  } = useChannels(communityId || '',userId);

  const {
    data: memberData,
    isLoading: isLoadingMember,
  } = useCommunityMember(communityId || '',!!communityId && !!userId);

  // Mutations
  const createChannelMutation = useCreateChannel();
  const deleteChannelMutation = useDeleteChannel();

  // Update member details when data changes
  useEffect(() => {
    if (memberData) {
      // Convert CommunityMember to MemberDetails format
      const memberDetails = {
        _id: memberData._id,
        userId: memberData.user_id,
        community_id: memberData.community_id,
        role: memberData.role,
        joinedAt: memberData.joined_at,
        status: memberData.is_active ? 'active' : 'inactive',
        isBanned: false,
        is_owner: memberData.role === 'owner',
        is_moderator: memberData.role === 'moderator',
      };
      dispatch(setMemberDetails(memberDetails));
    }
    
    return () => {
      if (!communityId) {
        dispatch(clearMemberDetails());
      }
    };
  }, [memberData, communityId, dispatch]);

  // Format channels data

  console.log("channelsData", channelsData);

  const channels = channelsData?.map((channel: any) => ({
    id: channel._id,
    name: channel.name,
    locked: channel.is_locked,
    type: channel.type,
  })) || [];

  // Navigation handler
  const handleNavigation = (route: string) => {
    router.push(route);
  };

  // Channel navigation handler
  const handleChannelNavigation = (channel: any) => {
    dispatch(setActiveChannel({
      id: channel.id,
      name: channel.name,
      type: channel.type,
    }));
    handleNavigation(`${navigationPaths.COMMUNITY_CHANNEL}/${channel.name}`);
  };

  // Create channel handler
  const handleCreateChannel = async () => {
    if (!formData.name.trim() || !communityId || !userId) return;

    try {
      await createChannelMutation.mutateAsync({
        name: formData.name,
        type: formData.type,
        community_id: communityId,
        is_private: formData.is_locked,
        userId,
        session: sessionId ?? undefined,
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        type: 'chat',
        is_locked: false,
      });
      setIsChannelOpen(false);
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  // Delete channel handler
  const handleDeleteChannel = async () => {
    if (!selectedChannelId || !communityId) return;

    try {
      await deleteChannelMutation.mutateAsync({
        channelId: selectedChannelId,
        communityId,
      });
      
      setShowDeleteDialog(false);
      setSelectedChannelId(null);
    } catch (error) {
      console.error('Error deleting channel:', error);
    }
  };

  // Check if path is active
  const isPathActive = (path: string) => pathname === path;

  return {
    // State
    isChannelOpen,
    setIsChannelOpen,
    isEventDialogOpen,
    setIsEventDialogOpen,
    selectedChannelId,
    setSelectedChannelId,
    showDeleteDialog,
    setShowDeleteDialog,
    isEditOpen,
    setIsEditOpen,
    formData,
    setFormData,
    
    // Computed
    isAdmin,
    communityParam,
    navigationPaths,
    channels,
    
    // Data
    communityDetails,
    isLoadingCommunity,
    communityError,
    isLoadingChannels,
    channelsError,
    memberDetails,
    activeChannel,
    
    // Handlers
    handleNavigation,
    handleChannelNavigation,
    handleCreateChannel,
    handleDeleteChannel,
    isPathActive,
    
    // Loading states
    isCreatingChannel: createChannelMutation.isPending,
    isDeletingChannel: deleteChannelMutation.isPending,
  };
} 