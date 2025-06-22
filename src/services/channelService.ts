import type { 
  Channel, 
  ChannelMessage, 
  ChannelPost,
  CreateChannelRequest,
  UpdateChannelRequest,
  SendMessageRequest,
  CreatePostRequest,
  UpdatePostRequest
} from '@/types/channel.types';
import type { PaginatedResponse } from '@/types/api.types';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/utils/constants';

export class ChannelService {
  // Get all channels for a community
  async getChannels(
    communityId: string,
    params?: {
      page?: number;
      limit?: number;
      type?: 'chat' | 'post';
    }
  ): Promise<PaginatedResponse<Channel>> {
    return apiClient.get<PaginatedResponse<Channel>>(
      `${API_ENDPOINTS.COMMUNITIES}/${communityId}/channels`,
      params
    );
  }

  // Get channel by ID
  async getChannel(channelId: string): Promise<Channel> {
    return apiClient.get<Channel>(`${API_ENDPOINTS.CHANNELS}/${channelId}`);
  }

  // Create new channel
  async createChannel(data: CreateChannelRequest): Promise<Channel> {
    return apiClient.post<Channel>(API_ENDPOINTS.CHANNELS, data);
  }

  // Update channel
  async updateChannel(channelId: string, data: UpdateChannelRequest): Promise<Channel> {
    return apiClient.put<Channel>(`${API_ENDPOINTS.CHANNELS}/${channelId}`, data);
  }

  // Delete channel
  async deleteChannel(channelId: string): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.CHANNELS}/${channelId}`);
  }

  // Archive/unarchive channel
  async archiveChannel(channelId: string, archived: boolean): Promise<Channel> {
    return apiClient.patch<Channel>(`${API_ENDPOINTS.CHANNELS}/${channelId}`, { archived });
  }

  // MESSAGES

  // Get channel messages
  async getChannelMessages(
    channelId: string,
    params?: {
      page?: number;
      limit?: number;
      before?: string; // Message ID for pagination
      after?: string;  // Message ID for pagination
    }
  ): Promise<PaginatedResponse<ChannelMessage>> {
    return apiClient.get<PaginatedResponse<ChannelMessage>>(
      `${API_ENDPOINTS.CHANNELS}/${channelId}/messages`,
      params
    );
  }

  // Get specific message
  async getMessage(channelId: string, messageId: string): Promise<ChannelMessage> {
    return apiClient.get<ChannelMessage>(`${API_ENDPOINTS.CHANNELS}/${channelId}/messages/${messageId}`);
  }

  // Send message
  async sendMessage(data: SendMessageRequest): Promise<ChannelMessage> {
    return apiClient.post<ChannelMessage>(`${API_ENDPOINTS.CHANNELS}/${data.channelId}/messages`, data);
  }

  // Update message
  async updateMessage(
    channelId: string, 
    messageId: string, 
    data: { content: string }
  ): Promise<ChannelMessage> {
    return apiClient.put<ChannelMessage>(`${API_ENDPOINTS.CHANNELS}/${channelId}/messages/${messageId}`, data);
  }

  // Delete message
  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.CHANNELS}/${channelId}/messages/${messageId}`);
  }

  // React to message
  async reactToMessage(
    channelId: string, 
    messageId: string, 
    emoji: string
  ): Promise<ChannelMessage> {
    return apiClient.post<ChannelMessage>(
      `${API_ENDPOINTS.CHANNELS}/${channelId}/messages/${messageId}/reactions`,
      { emoji }
    );
  }

  // Remove reaction from message
  async removeMessageReaction(
    channelId: string, 
    messageId: string, 
    emoji: string
  ): Promise<ChannelMessage> {
    return apiClient.delete<ChannelMessage>(
      `${API_ENDPOINTS.CHANNELS}/${channelId}/messages/${messageId}/reactions/${emoji}`
    );
  }

  // POSTS

  // Get channel posts
  async getChannelPosts(
    channelId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: 'newest' | 'oldest' | 'popular';
    }
  ): Promise<PaginatedResponse<ChannelPost>> {
    return apiClient.get<PaginatedResponse<ChannelPost>>(
      `${API_ENDPOINTS.CHANNELS}/${channelId}/posts`,
      params
    );
  }

  // Get specific post
  async getPost(channelId: string, postId: string): Promise<ChannelPost> {
    return apiClient.get<ChannelPost>(`${API_ENDPOINTS.CHANNELS}/${channelId}/posts/${postId}`);
  }

  // Create post
  async createPost(data: CreatePostRequest): Promise<ChannelPost> {
    return apiClient.post<ChannelPost>(`${API_ENDPOINTS.CHANNELS}/${data.channelId}/posts`, data);
  }

  // Update post
  async updatePost(
    channelId: string, 
    postId: string, 
    data: UpdatePostRequest
  ): Promise<ChannelPost> {
    return apiClient.put<ChannelPost>(`${API_ENDPOINTS.CHANNELS}/${channelId}/posts/${postId}`, data);
  }

  // Delete post
  async deletePost(channelId: string, postId: string): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.CHANNELS}/${channelId}/posts/${postId}`);
  }

  // Vote on post
  async voteOnPost(
    channelId: string, 
    postId: string, 
    voteType: 'up' | 'down'
  ): Promise<ChannelPost> {
    return apiClient.post<ChannelPost>(
      `${API_ENDPOINTS.CHANNELS}/${channelId}/posts/${postId}/vote`,
      { voteType }
    );
  }

  // Remove vote from post
  async removePostVote(channelId: string, postId: string): Promise<ChannelPost> {
    return apiClient.delete<ChannelPost>(`${API_ENDPOINTS.CHANNELS}/${channelId}/posts/${postId}/vote`);
  }

  // COMMENTS

  // Get post comments
  async getPostComments(
    channelId: string,
    postId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: 'newest' | 'oldest' | 'popular';
    }
  ): Promise<PaginatedResponse<any>> {
    return apiClient.get<PaginatedResponse<any>>(
      `${API_ENDPOINTS.CHANNELS}/${channelId}/posts/${postId}/comments`,
      params
    );
  }

  // Add comment to post
  async addPostComment(
    channelId: string,
    postId: string,
    data: { content: string; parentId?: string }
  ): Promise<any> {
    return apiClient.post<any>(
      `${API_ENDPOINTS.CHANNELS}/${channelId}/posts/${postId}/comments`,
      data
    );
  }

  // Update comment
  async updateComment(
    channelId: string,
    postId: string,
    commentId: string,
    data: { content: string }
  ): Promise<any> {
    return apiClient.put<any>(
      `${API_ENDPOINTS.CHANNELS}/${channelId}/posts/${postId}/comments/${commentId}`,
      data
    );
  }

  // Delete comment
  async deleteComment(channelId: string, postId: string, commentId: string): Promise<void> {
    return apiClient.delete<void>(
      `${API_ENDPOINTS.CHANNELS}/${channelId}/posts/${postId}/comments/${commentId}`
    );
  }

  // FILE UPLOADS

  // Upload file to channel
  async uploadFile(
    channelId: string,
    file: File,
    type: 'message' | 'post',
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; filename: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('channelId', channelId);

    return apiClient.upload<{ url: string; filename: string; size: number }>(
      `${API_ENDPOINTS.CHANNELS}/${channelId}/upload`,
      formData,
      onProgress
    );
  }

  // SEARCH

  // Search messages in channel
  async searchMessages(
    channelId: string,
    query: string,
    params?: {
      page?: number;
      limit?: number;
      userId?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<PaginatedResponse<ChannelMessage>> {
    return apiClient.get<PaginatedResponse<ChannelMessage>>(
      `${API_ENDPOINTS.CHANNELS}/${channelId}/messages/search`,
      { query, ...params }
    );
  }

  // Search posts in channel
  async searchPosts(
    channelId: string,
    query: string,
    params?: {
      page?: number;
      limit?: number;
      userId?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<PaginatedResponse<ChannelPost>> {
    return apiClient.get<PaginatedResponse<ChannelPost>>(
      `${API_ENDPOINTS.CHANNELS}/${channelId}/posts/search`,
      { query, ...params }
    );
  }

  // PERMISSIONS

  // Get channel permissions for user
  async getChannelPermissions(channelId: string, userId?: string): Promise<any> {
    const params = userId ? { userId } : {};
    return apiClient.get<any>(`${API_ENDPOINTS.CHANNELS}/${channelId}/permissions`, params);
  }

  // Update channel permissions
  async updateChannelPermissions(
    channelId: string,
    permissions: Record<string, boolean>
  ): Promise<any> {
    return apiClient.put<any>(`${API_ENDPOINTS.CHANNELS}/${channelId}/permissions`, permissions);
  }
}

// Create and export singleton instance
export const channelService = new ChannelService(); 