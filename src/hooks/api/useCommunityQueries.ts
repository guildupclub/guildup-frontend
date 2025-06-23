import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import type { 
  Community, 
  CommunityMember, 
  CreateCommunityRequest, 
  UpdateCommunityRequest,
  JoinCommunityRequest,
  CommunityStats,
  Category
} from '@/types/community.types';
import type { PaginatedResponse } from '@/types/api.types';
import { communityService } from '@/services/communityService';
import { QUERY_KEYS, CACHE_TIME } from '@/utils/constants';
import { useToast } from '@/contexts/ToastContext';

// GET QUERIES

export function useCommunities(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  is_public?: boolean;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, params],
    queryFn: () => communityService.getCommunities(params),
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

export function useInfiniteCommunities(params?: {
  limit?: number;
  category?: string;
  search?: string;
  is_public?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      communityService.getCommunities({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = lastPage.data.length === (params?.limit || 20);
      return hasMore ? allPages.length + 1 : undefined;
    },
    staleTime: CACHE_TIME.MEDIUM,
  });
}

export function useCommunity(communityId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITY, communityId],
    queryFn: () => communityService.getCommunity(communityId),
    enabled: enabled && !!communityId,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

export function useCommunityMembers(
  communityId: string, 
  params?: {
    page?: number;
    limit?: number;
    role?: 'owner' | 'moderator' | 'member';
    search?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITY_MEMBERS, communityId, params],
    queryFn: () => communityService.getCommunityMembers(communityId, params),
    enabled: enabled && !!communityId,
    staleTime: CACHE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
  });
}

export function useCommunityMember(communityId: string, userId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITY_MEMBERS, communityId, userId],
    queryFn: () => communityService.getCommunityMember(communityId, userId),
    enabled: enabled && !!communityId && !!userId,
    staleTime: CACHE_TIME.SHORT,
  });
}

export function useCommunityStats(communityId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITY, communityId, 'stats'],
    queryFn: () => communityService.getCommunityStats(communityId),
    enabled: enabled && !!communityId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

export function useUserCommunities(
  userId: string,
  params?: {
    page?: number;
    limit?: number;
    role?: 'owner' | 'moderator' | 'member';
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, userId, 'communities', params],
    queryFn: () => communityService.getUserCommunities(userId, params),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (user not found) or 401 (unauthorized)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status === 404 || status === 401) {
          return false;
        }
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Prevent excessive refetching
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}

export function useSearchCommunities(
  query: string,
  params?: {
    page?: number;
    limit?: number;
    category?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, 'search', query, params],
    queryFn: () => communityService.searchCommunities(query, params),
    enabled: enabled && !!query && query.length > 2,
    staleTime: CACHE_TIME.SHORT,
  });
}

export function useFeaturedCommunities(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, 'featured', limit],
    queryFn: () => communityService.getFeaturedCommunities(limit),
    staleTime: CACHE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  });
}

export function useTrendingCommunities(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, 'trending', limit],
    queryFn: () => communityService.getTrendingCommunities(limit),
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => communityService.getCategories(),
    staleTime: CACHE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  });
}

// MUTATION HOOKS

export function useCreateCommunity() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateCommunityRequest) => communityService.createCommunity(data),
    onSuccess: (community) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITIES] });
      queryClient.setQueryData([QUERY_KEYS.COMMUNITY, community._id], community);
      showSuccess('Community created successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to create community');
    },
  });
}

export function useUpdateCommunity() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ communityId, data }: { communityId: string; data: UpdateCommunityRequest }) =>
      communityService.updateCommunity(communityId, data),
    onSuccess: (community) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITIES] });
      queryClient.setQueryData([QUERY_KEYS.COMMUNITY, community._id], community);
      showSuccess('Community updated successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update community');
    },
  });
}

export function useDeleteCommunity() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (communityId: string) => communityService.deleteCommunity(communityId),
    onSuccess: (_, communityId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITIES] });
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.COMMUNITY, communityId] });
      showSuccess('Community deleted successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to delete community');
    },
  });
}

export function useJoinCommunity() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: JoinCommunityRequest) => communityService.joinCommunity(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITY, variables.communityId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITY_MEMBERS, variables.communityId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITIES] });
      showSuccess('Successfully joined community!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to join community');
    },
  });
}

export function useLeaveCommunity() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (communityId: string) => communityService.leaveCommunity(communityId),
    onSuccess: (_, communityId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITY, communityId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITY_MEMBERS, communityId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITIES] });
      showSuccess('Successfully left community');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to leave community');
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      communityId, 
      userId, 
      role 
    }: { 
      communityId: string; 
      userId: string; 
      role: 'owner' | 'moderator' | 'member';
    }) => communityService.updateMemberRole(communityId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.COMMUNITY_MEMBERS, variables.communityId] 
      });
      showSuccess('Member role updated successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update member role');
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ communityId, userId }: { communityId: string; userId: string }) =>
      communityService.removeMember(communityId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.COMMUNITY_MEMBERS, variables.communityId] 
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITY, variables.communityId] });
      showSuccess('Member removed successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to remove member');
    },
  });
}

export function useUploadCommunityImage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      communityId, 
      file, 
      type, 
      onProgress 
    }: { 
      communityId: string; 
      file: File; 
      type: 'image' | 'background_image';
      onProgress?: (progress: number) => void;
    }) => communityService.uploadCommunityImage(communityId, file, type, onProgress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITY, variables.communityId] });
      showSuccess('Image uploaded successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to upload image');
    },
  });
}

export function useGenerateInviteCode() {
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ communityId, expiresIn }: { communityId: string; expiresIn?: number }) =>
      communityService.generateInviteCode(communityId, expiresIn),
    onSuccess: () => {
      showSuccess('Invite code generated successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to generate invite code');
    },
  });
}

export function useValidateInviteCode(code: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, 'invite', code],
    queryFn: () => communityService.validateInviteCode(code),
    enabled: enabled && !!code,
    staleTime: 0, // Always fresh for invite codes
    retry: false,
  });
}

export function useJoinByInviteCode() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (code: string) => communityService.joinByInviteCode(code),
    onSuccess: (community) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITIES] });
      queryClient.setQueryData([QUERY_KEYS.COMMUNITY, community._id], community);
      showSuccess(`Successfully joined ${community.name}!`);
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to join community');
    },
  });
} 