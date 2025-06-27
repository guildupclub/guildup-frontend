import { apiClient } from './apiClient';
import type { 
  FeedPost, 
  Comment, 
  CreatePostData, 
  CreateCommentData, 
  VoteData, 
  ShareData, 
  FeedFilters 
} from '@/types/feed.types';
import type { PaginatedResponse } from '@/types/api.types';

interface FeedQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  type?: 'all' | 'following' | 'trending' | 'saved';
  category?: string;
  timeframe?: 'today' | 'week' | 'month' | 'all';
  sort?: 'newest' | 'popular' | 'trending';
}

class FeedService {
  async getGlobalFeed(params: FeedQueryParams): Promise<PaginatedResponse<FeedPost>> {
    return apiClient.post<PaginatedResponse<FeedPost>>('/v1/feed/global', params);
  }

  async getCommunityFeed(communityId: string, params: FeedQueryParams): Promise<PaginatedResponse<FeedPost>> {
    return apiClient.post<PaginatedResponse<FeedPost>>('/v1/feed/community', {
      communityId,
      ...params,
    });
  }

  async getPersonalFeed(userId: string, params: FeedQueryParams): Promise<PaginatedResponse<FeedPost>> {
    return apiClient.post<PaginatedResponse<FeedPost>>('/v1/feed/personal', {
      userId,
      ...params,
    });
  }

  async getPost(postId: string, userId?: string): Promise<FeedPost> {
    return apiClient.post<FeedPost>('/v1/posts/get', {
      postId,
      userId,
    });
  }

  async createPost(data: CreatePostData): Promise<FeedPost> {
    return apiClient.post<FeedPost>('/v1/posts/create', data);
  }

  async updatePost(postId: string, data: Partial<CreatePostData>): Promise<FeedPost> {
    return apiClient.patch<FeedPost>('/v1/posts/update', {
      postId,
      ...data,
    });
  }

  async deletePost(postId: string): Promise<void> {
    return apiClient.post<void>('/v1/posts/delete', { postId });
  }

  async votePost(data: VoteData): Promise<{ success: boolean; newCount: number }> {
    return apiClient.post<{ success: boolean; newCount: number }>('/v1/posts/vote', data);
  }

  async toggleSavePost(postId: string): Promise<{ is_saved: boolean }> {
    return apiClient.post<{ is_saved: boolean }>('/v1/posts/save', { postId });
  }

  async sharePost(data: ShareData): Promise<{ success: boolean; shareUrl?: string }> {
    return apiClient.post<{ success: boolean; shareUrl?: string }>('/v1/posts/share', data);
  }

  async getSavedPosts(userId: string, params: FeedQueryParams): Promise<PaginatedResponse<FeedPost>> {
    return apiClient.post<PaginatedResponse<FeedPost>>('/v1/posts/saved', {
      userId,
      ...params,
    });
  }

  async getTrendingPosts(timeframe: 'today' | 'week' | 'month' = 'today', userId?: string): Promise<FeedPost[]> {
    return apiClient.post<FeedPost[]>('/v1/posts/trending', {
      timeframe,
      userId,
    });
  }

  async getPostComments(postId: string, userId?: string): Promise<Comment[]> {
    return apiClient.post<Comment[]>('/v1/comments/get', {
      postId,
      userId,
    });
  }

  async createComment(data: CreateCommentData): Promise<Comment> {
    return apiClient.post<Comment>('/v1/comments/create', data);
  }

  async deleteComment(commentId: string): Promise<void> {
    return apiClient.post<void>('/v1/comments/delete', { commentId });
  }

  async voteComment(data: VoteData): Promise<{ success: boolean; newCount: number }> {
    return apiClient.post<{ success: boolean; newCount: number }>('/v1/comments/vote', data);
  }

  async searchPosts(query: string, filters?: FeedFilters, params?: FeedQueryParams): Promise<PaginatedResponse<FeedPost>> {
    return apiClient.post<PaginatedResponse<FeedPost>>('/v1/posts/search', {
      query,
      ...filters,
      ...params,
    });
  }
}

export const feedService = new FeedService();
export { FeedService }; 