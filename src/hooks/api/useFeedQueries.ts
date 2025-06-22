import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedService } from '@/services/feedService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { FeedPost, FeedFilters, VoteData, ShareData } from '@/types/feed.types';
import type { CreatePostData } from '@/types/channel.types';
import type { PaginatedResponse } from '@/types/api.types';
import { QUERY_KEYS, CACHE_TIME, PAGINATION } from '@/utils/constants';

/**
 * Get global feed with infinite scroll
 */
export function useGlobalFeed(filters?: FeedFilters) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.FEED, 'global', user?.id, filters],
    queryFn: ({ pageParam = 1 }) =>
      feedService.getGlobalFeed({
        page: pageParam,
        limit: PAGINATION.DEFAULT_PAGE_SIZE,
        userId: user?.id,
        ...filters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<FeedPost>) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    staleTime: CACHE_TIME.SHORT,
    enabled: !!user?.id,
  });
}

/**
 * Get community-specific feed
 */
export function useCommunityFeed(communityId: string, filters?: FeedFilters) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.FEED, 'community', communityId, user?.id, filters],
    queryFn: ({ pageParam = 1 }) =>
      feedService.getCommunityFeed(communityId, {
        page: pageParam,
        limit: PAGINATION.DEFAULT_PAGE_SIZE,
        userId: user?.id,
        ...filters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<FeedPost>) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    staleTime: CACHE_TIME.SHORT,
    enabled: !!communityId && !!user?.id,
  });
}

/**
 * Get user's personal feed (following)
 */
export function usePersonalFeed(filters?: FeedFilters) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.FEED, 'personal', user?.id, filters],
    queryFn: ({ pageParam = 1 }) =>
      feedService.getPersonalFeed(user!.id, {
        page: pageParam,
        limit: PAGINATION.DEFAULT_PAGE_SIZE,
        ...filters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<FeedPost>) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    staleTime: CACHE_TIME.SHORT,
    enabled: !!user?.id,
  });
}

/**
 * Get a single post
 */
export function usePost(postId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.POST, postId, user?.id],
    queryFn: () => feedService.getPost(postId, user?.id),
    staleTime: CACHE_TIME.MEDIUM,
    enabled: !!postId,
  });
}

/**
 * Get post comments
 */
export function usePostComments(postId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.COMMENTS, postId, user?.id],
    queryFn: () => feedService.getPostComments(postId, user?.id),
    staleTime: CACHE_TIME.SHORT,
    enabled: !!postId,
  });
}

/**
 * Get saved posts
 */
export function useSavedPosts() {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.POSTS, 'saved', user?.id],
    queryFn: ({ pageParam = 1 }) =>
      feedService.getSavedPosts(user!.id, {
        page: pageParam,
        limit: PAGINATION.DEFAULT_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<FeedPost>) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    staleTime: CACHE_TIME.MEDIUM,
    enabled: !!user?.id,
  });
}

/**
 * Create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: CreatePostData) => feedService.createPost(data),
    onSuccess: (newPost) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEED });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
      
      showSuccess('Post created successfully!');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
}

/**
 * Vote on a post
 */
export function useVotePost() {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  return useMutation({
    mutationFn: (data: VoteData) => feedService.votePost(data),
    onSuccess: () => {
      // Invalidate feed queries to update vote counts
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEED });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST });
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
}

/**
 * Save/unsave a post
 */
export function useSavePost() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (postId: string) => feedService.toggleSavePost(postId),
    onSuccess: (result) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEED });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.POSTS, 'saved'] });
      
      showSuccess(result.is_saved ? 'Post saved!' : 'Post unsaved!');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
}

/**
 * Share a post
 */
export function useSharePost() {
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: ShareData) => feedService.sharePost(data),
    onSuccess: () => {
      showSuccess('Post shared successfully!');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
}

/**
 * Delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (postId: string) => feedService.deletePost(postId),
    onSuccess: () => {
      // Invalidate all feed queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEED });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
      
      showSuccess('Post deleted successfully!');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
}

/**
 * Get trending posts
 */
export function useTrendingPosts(timeframe: 'today' | 'week' | 'month' = 'today') {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.FEED, 'trending', timeframe, user?.id],
    queryFn: () => feedService.getTrendingPosts(timeframe, user?.id),
    staleTime: CACHE_TIME.MEDIUM,
  });
} 