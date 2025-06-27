import type { 
  User, 
  UserProfile, 
  UpdateUserRequest,
  UserStats,
  UserPreferences,
  UserNotification
} from '@/types/auth.types';
import type { Community } from '@/types/community.types';
import type { PaginatedResponse } from '@/types/api.types';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/utils/constants';

export class UserService {
  // PROFILE MANAGEMENT

  // Get current user profile
  async getCurrentUser(userId: string): Promise<User> {
    return apiClient.get<User>(`${API_ENDPOINTS.AUTH}/profile`,{userId});
  }

  // Get user profile with direct endpoint match
  async getUserProfileById(userId: string): Promise<User> {
    return apiClient.get<User>(`${API_ENDPOINTS.AUTH}/profile?userId=${userId}`);
  }

  // Update profile using the edit endpoint
  async updateUserProfileById(userId: string, updateData: Record<string, any>): Promise<User> {
   return apiClient.patch<User>(`${API_ENDPOINTS.AUTH}/edit`, {
      updateData,
      userId,
    });

  }

  // Update avatar using direct endpoint
  async updateUserAvatar(userId: string, file: File): Promise<{ user: User; message: string }> {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('avatar', file);

    return apiClient.upload<{ user: User; message: string }>(`${API_ENDPOINTS.AUTH}/update-avatar`, formData);
    
  }

  // Get user by ID
  async getUser(userId: string): Promise<User> {
    return apiClient.get<User>(`${API_ENDPOINTS.USERS}/${userId}`);
  }

  // Get user profile by ID
  async getUserProfile(userId: string): Promise<UserProfile> {
    return apiClient.get<UserProfile>(`${API_ENDPOINTS.USERS}/${userId}/profile`);
  }

  // Update current user profile
  async updateProfile(data: UpdateUserRequest): Promise<User> {
    return apiClient.put<User>(`${API_ENDPOINTS.USERS}/me`, data);
  }

  // Update user avatar
  async updateAvatar(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return apiClient.upload<{ avatarUrl: string }>(
      `${API_ENDPOINTS.USERS}/me/avatar`,
      formData,
      onProgress
    );
  }

  // Update user cover image
  async updateCoverImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ coverImageUrl: string }> {
    const formData = new FormData();
    formData.append('coverImage', file);

    return apiClient.upload<{ coverImageUrl: string }>(
      `${API_ENDPOINTS.USERS}/me/cover`,
      formData,
      onProgress
    );
  }

  // Delete user account
  async deleteAccount(): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.USERS}/me`);
  }

  // USER STATS

  // Get user stats
  async getUserStats(userId: string): Promise<UserStats> {
    return apiClient.get<UserStats>(`${API_ENDPOINTS.USERS}/${userId}/stats`);
  }

  // Get user activity
  async getUserActivity(
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      type?: 'posts' | 'comments' | 'communities' | 'all';
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<PaginatedResponse<any>> {
    return apiClient.get<PaginatedResponse<any>>(
      `${API_ENDPOINTS.USERS}/${userId}/activity`,
      params
    );
  }

  // PREFERENCES

  // Get user preferences
  async getUserPreferences(): Promise<UserPreferences> {
    return apiClient.get<UserPreferences>(`${API_ENDPOINTS.USERS}/me/preferences`);
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    return apiClient.put<UserPreferences>(`${API_ENDPOINTS.USERS}/me/preferences`, preferences);
  }

  // NOTIFICATIONS

  // Get user notifications
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  }): Promise<PaginatedResponse<UserNotification>> {
    return apiClient.get<PaginatedResponse<UserNotification>>(
      `${API_ENDPOINTS.USERS}/me/notifications`,
      params
    );
  }

  // Mark notification as read
  async markNotificationRead(notificationId: string): Promise<void> {
    return apiClient.put<void>(`${API_ENDPOINTS.USERS}/me/notifications/${notificationId}/read`);
  }

  // Mark all notifications as read
  async markAllNotificationsRead(): Promise<void> {
    return apiClient.put<void>(`${API_ENDPOINTS.USERS}/me/notifications/read-all`);
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.USERS}/me/notifications/${notificationId}`);
  }

  // Get unread notification count
  async getUnreadNotificationCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>(`${API_ENDPOINTS.USERS}/me/notifications/unread-count`);
  }

  // SOCIAL FEATURES

  // Follow user
  async followUser(userId: string): Promise<void> {
    return apiClient.post<void>(`${API_ENDPOINTS.USERS}/${userId}/follow`);
  }

  // Unfollow user
  async unfollowUser(userId: string): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.USERS}/${userId}/follow`);
  }

  // Get user followers
  async getUserFollowers(
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>>(
      `${API_ENDPOINTS.USERS}/${userId}/followers`,
      params
    );
  }

  // Get user following
  async getUserFollowing(
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>>(
      `${API_ENDPOINTS.USERS}/${userId}/following`,
      params
    );
  }

  // Check if following user
  async isFollowing(userId: string): Promise<{ isFollowing: boolean }> {
    return apiClient.get<{ isFollowing: boolean }>(`${API_ENDPOINTS.USERS}/${userId}/is-following`);
  }

  // COMMUNITIES

  // Get user communities
  async getUserCommunities(
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      role?: 'owner' | 'moderator' | 'member';
    }
  ): Promise<PaginatedResponse<Community>> {
    // Use the correct endpoint that exists on the backend
    const response = await apiClient.get<Community[]>(
      `${API_ENDPOINTS.COMMUNITIES}/user/follow?userId=${userId}`
    );
    
    // Transform the response to match the expected PaginatedResponse format
    return {
      data: response || [],
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: response?.length || 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      }
    } as PaginatedResponse<Community>;
  }

  // SEARCH

  // Search users
  async searchUsers(
    query: string,
    params?: {
      page?: number;
      limit?: number;
      filters?: {
        location?: string;
        interests?: string[];
        verified?: boolean;
      };
    }
  ): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>>(
      `${API_ENDPOINTS.USERS}/search`,
      { query, ...params }
    );
  }

  // Get suggested users
  async getSuggestedUsers(limit?: number): Promise<User[]> {
    return apiClient.get<User[]>(`${API_ENDPOINTS.USERS}/suggestions`, { limit });
  }

  // BLOCKING

  // Block user
  async blockUser(userId: string): Promise<void> {
    return apiClient.post<void>(`${API_ENDPOINTS.USERS}/${userId}/block`);
  }

  // Unblock user
  async unblockUser(userId: string): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.USERS}/${userId}/block`);
  }

  // Get blocked users
  async getBlockedUsers(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>>(`${API_ENDPOINTS.USERS}/me/blocked`, params);
  }

  // Check if user is blocked
  async isBlocked(userId: string): Promise<{ isBlocked: boolean }> {
    return apiClient.get<{ isBlocked: boolean }>(`${API_ENDPOINTS.USERS}/${userId}/is-blocked`);
  }

  // REPORTING

  // Report user
  async reportUser(
    userId: string,
    data: {
      reason: string;
      description?: string;
      evidence?: string[];
    }
  ): Promise<void> {
    return apiClient.post<void>(`${API_ENDPOINTS.USERS}/${userId}/report`, data);
  }

  // VERIFICATION

  // Request email verification
  async requestEmailVerification(): Promise<void> {
    return apiClient.post<void>(`${API_ENDPOINTS.USERS}/me/verify-email`);
  }

  // Verify email with token
  async verifyEmail(token: string): Promise<void> {
    return apiClient.post<void>(`${API_ENDPOINTS.USERS}/verify-email/${token}`);
  }

  // Request phone verification
  async requestPhoneVerification(phoneNumber: string): Promise<void> {
    return apiClient.post<void>(`${API_ENDPOINTS.USERS}/me/verify-phone`, { phoneNumber });
  }

  // Verify phone with code
  async verifyPhone(code: string): Promise<void> {
    return apiClient.post<void>(`${API_ENDPOINTS.USERS}/me/verify-phone/confirm`, { code });
  }

  // PRIVACY

  // Update privacy settings
  async updatePrivacySettings(settings: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: 'everyone' | 'friends' | 'none';
    allowFollows: boolean;
  }): Promise<void> {
    return apiClient.put<void>(`${API_ENDPOINTS.USERS}/me/privacy`, settings);
  }

  // Get privacy settings
  async getPrivacySettings(): Promise<{
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: 'everyone' | 'friends' | 'none';
    allowFollows: boolean;
  }> {
    return apiClient.get(`${API_ENDPOINTS.USERS}/me/privacy`);
  }

  // SESSIONS

  // Get active sessions
  async getActiveSessions(): Promise<Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.USERS}/me/sessions`);
  }

  // Revoke session
  async revokeSession(sessionId: string): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.USERS}/me/sessions/${sessionId}`);
  }

  // Revoke all sessions (except current)
  async revokeAllSessions(): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.USERS}/me/sessions`);
  }
}

// Create and export singleton instance
export const userService = new UserService(); 