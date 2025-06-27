import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type { Community, Category } from '@/types/community.types';
import type { FeedPost } from '@/types/feed.types'; 
import type { User } from '@/types/auth.types';
import type { PaginatedResponse } from '@/types/api.types';
import { communityService } from '@/services/communityService';
import { feedService } from '@/services/feedService';
import { userService } from '@/services/userService';
import { QUERY_KEYS, CACHE_TIME } from '@/utils/constants';

// FEATURED CONTENT QUERIES

export function useFeaturedCommunities(limit?: number, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, 'featured', limit],
    queryFn: () => communityService.getFeaturedCommunities(limit),
    enabled,
    staleTime: CACHE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  });
}

export function useTrendingCommunities(limit?: number, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, 'trending', limit],
    queryFn: () => communityService.getTrendingCommunities(limit),
    enabled,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

export function useTrendingPosts(
  params?: {
    timeframe?: 'today' | 'week' | 'month';
    userId?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.POSTS, 'trending', params],
    queryFn: () => feedService.getTrendingPosts(params?.timeframe, params?.userId),
    enabled,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

export function useSuggestedUsers(limit?: number, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, 'suggestions', limit],
    queryFn: () => userService.getSuggestedUsers(limit),
    enabled,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

// CATEGORIES QUERIES

export function useCategories(enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => communityService.getCategories(),
    enabled,
    staleTime: CACHE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  });
}

export function useCommunitiesByCategory(
  category: string,
  params?: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'popular' | 'members';
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, 'category', category, params],
    queryFn: () => communityService.getCommunities({ 
      ...params, 
      category,
      is_public: true 
    }),
    enabled: enabled && !!category,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

export function useInfiniteCommunitiesByCategory(
  category: string,
  params?: {
    limit?: number;
    sort?: 'newest' | 'popular' | 'members';
  },
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, 'category', category, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      communityService.getCommunities({ 
        ...params, 
        page: pageParam,
        category,
        is_public: true 
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = lastPage.data.length === (params?.limit || 20);
      return hasMore ? allPages.length + 1 : undefined;
    },
    enabled: enabled && !!category,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

// DISCOVERY QUERIES

export function useDiscoverCommunities(
  params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    is_public?: boolean;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, 'discover', params],
    queryFn: () => communityService.getCommunities({ 
      ...params, 
      is_public: true 
    }),
    enabled,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

export function useInfiniteDiscoverCommunities(
  params?: {
    limit?: number;
    category?: string;
    search?: string;
    is_public?: boolean;
  },
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, 'discover', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      communityService.getCommunities({ 
        ...params, 
        page: pageParam,
        is_public: true 
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = lastPage.data.length === (params?.limit || 20);
      return hasMore ? allPages.length + 1 : undefined;
    },
    enabled,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

export function useDiscoverPosts(
  params?: {
    page?: number;
    limit?: number;
    userId?: string;
    type?: 'all' | 'following' | 'trending' | 'saved';
    category?: string;
    timeframe?: 'today' | 'week' | 'month' | 'all';
    sort?: 'newest' | 'popular' | 'trending';
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.POSTS, 'discover', params],
    queryFn: () => feedService.getGlobalFeed(params || {}),
    enabled,
    staleTime: CACHE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
  });
}

export function useInfiniteDiscoverPosts(
  params?: {
    limit?: number;
    userId?: string;
    type?: 'all' | 'following' | 'trending' | 'saved';
    category?: string;
    timeframe?: 'today' | 'week' | 'month' | 'all';
    sort?: 'newest' | 'popular' | 'trending';
  },
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.POSTS, 'discover', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      feedService.getGlobalFeed({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = lastPage.data.length === (params?.limit || 20);
      return hasMore ? allPages.length + 1 : undefined;
    },
    enabled,
    staleTime: CACHE_TIME.SHORT,
  });
}

// SEARCH QUERIES

export function useGlobalSearch(
  query: string,
  params?: {
    type?: 'all' | 'communities' | 'posts' | 'users';
    page?: number;
    limit?: number;
    category?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH, 'global', query, params],
    queryFn: async () => {
      const { type = 'all' } = params || {};
      
      if (type === 'communities') {
        return { 
          communities: await communityService.searchCommunities(query, {
            page: params?.page,
            limit: params?.limit,
            category: params?.category,
          })
        };
      }
      
      if (type === 'posts') {
        return { 
          posts: await feedService.searchPosts(query, 
            { category: params?.category },
            { page: params?.page, limit: params?.limit }
          )
        };
      }
      
      if (type === 'users') {
        return { 
          users: await userService.searchUsers(query, {
            page: params?.page,
            limit: params?.limit,
          })
        };
      }
      
      // Return all results for 'all' type
      const [communities, posts, users] = await Promise.all([
        communityService.searchCommunities(query, {
          page: params?.page,
          limit: Math.floor((params?.limit || 20) / 3),
          category: params?.category,
        }),
        feedService.searchPosts(query, 
          { category: params?.category },
          { page: params?.page, limit: Math.floor((params?.limit || 20) / 3) }
        ),
        userService.searchUsers(query, {
          page: params?.page,
          limit: Math.floor((params?.limit || 20) / 3),
        }),
      ]);
      
      return { communities, posts, users };
    },
    enabled: enabled && !!query && query.length > 2,
    staleTime: CACHE_TIME.SHORT,
  });
}

export function useSearchSuggestions(
  query: string,
  type: 'communities' | 'posts' | 'users' = 'communities',
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH, 'suggestions', type, query],
    queryFn: async () => {
      const limit = 5; // Small limit for suggestions
      
      switch (type) {
        case 'communities':
          return communityService.searchCommunities(query, { limit });
        case 'posts':
          return feedService.searchPosts(query, {}, { limit });
        case 'users':
          return userService.searchUsers(query, { limit });
        default:
          return { data: [] };
      }
    },
    enabled: enabled && !!query && query.length > 1,
    staleTime: CACHE_TIME.SHORT,
  });
}

// POPULAR CONTENT QUERIES

export function usePopularCommunitiesThisWeek(limit?: number, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.POPULAR, 'week', 'communities', limit],
    queryFn: () => communityService.getTrendingCommunities(limit),
    enabled,
    staleTime: CACHE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  });
}

export function usePopularPostsThisWeek(enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.POPULAR, 'week', 'posts'],
    queryFn: () => feedService.getTrendingPosts('week'),
    enabled,
    staleTime: CACHE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  });
}

export function usePopularCommunitiesThisMonth(limit?: number, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.POPULAR, 'month', 'communities', limit],
    queryFn: () => communityService.getTrendingCommunities(limit),
    enabled,
    staleTime: CACHE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  });
}

export function usePopularPostsThisMonth(enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.POPULAR, 'month', 'posts'],
    queryFn: () => feedService.getTrendingPosts('month'),
    enabled,
    staleTime: CACHE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  });
}

// LOCATION-BASED QUERIES

export function useNearbyCommunities(
  location: {
    latitude: number;
    longitude: number;
    radius?: number; // in km
  },
  params?: {
    page?: number;
    limit?: number;
    category?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, 'nearby', location, params],
    queryFn: () => communityService.getCommunities({
      ...params,
      is_public: true,
    }),
    enabled: enabled && !!location.latitude && !!location.longitude,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

// RECOMMENDATION QUERIES

export function useRecommendedCommunities(
  userId?: string,
  params?: {
    limit?: number;
    category?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMUNITIES, 'recommended', userId, params],
    queryFn: () => communityService.getCommunities({
      ...params,
      is_public: true,
    }),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.LONG,
  });
}

export function useRecommendedPosts(
  userId?: string,
  params?: {
    limit?: number;
    category?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.POSTS, 'recommended', userId, params],
    queryFn: () => feedService.getGlobalFeed({ ...params, userId }),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.MEDIUM,
  });
} 