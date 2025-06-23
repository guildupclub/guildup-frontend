import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import type { 
  UpdateUserRequest,
  UserPreferences
} from '@/types/auth.types';
import { userService } from '@/services/userService';
import { QUERY_KEYS, CACHE_TIME } from '@/utils/constants';
import { useToast } from '@/contexts/ToastContext';

// PROFILE QUERIES

export function useCurrentUser(enabled = true, userId?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, 'current', userId],
    queryFn: () => userService.getCurrentUser(userId!),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

export function useUser(userId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, userId],
    queryFn: () => userService.getUser(userId),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

export function useUserProfile(userId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, userId, 'profile'],
    queryFn: () => userService.getUserProfile(userId),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

export function useUserProfileById(userId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, 'profile', userId],
    queryFn: () => userService.getUserProfileById(userId),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

// STATS QUERIES

export function useUserStats(userId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, userId, 'stats'],
    queryFn: () => userService.getUserStats(userId),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

export function useUserActivity(
  userId: string,
  params?: {
    page?: number;
    limit?: number;
    type?: 'posts' | 'comments' | 'communities' | 'all';
    dateFrom?: string;
    dateTo?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, userId, 'activity', params],
    queryFn: () => userService.getUserActivity(userId, params),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.SHORT,
  });
}

// PREFERENCES QUERIES

export function useUserPreferences(enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, 'preferences'],
    queryFn: () => userService.getUserPreferences(),
    enabled,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

export function usePrivacySettings(enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, 'privacy'],
    queryFn: () => userService.getPrivacySettings(),
    enabled,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

// NOTIFICATIONS QUERIES

export function useNotifications(
  params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, params],
    queryFn: () => userService.getNotifications(params),
    enabled,
    staleTime: CACHE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
  });
}

export function useInfiniteNotifications(
  params?: {
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  },
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      userService.getNotifications({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = lastPage.data.length === (params?.limit || 20);
      return hasMore ? allPages.length + 1 : undefined;
    },
    enabled,
    staleTime: CACHE_TIME.SHORT,
  });
}

export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, 'unread-count'],
    queryFn: () => userService.getUnreadNotificationCount(),
    enabled,
    staleTime: CACHE_TIME.SHORT,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// SOCIAL QUERIES

export function useUserFollowers(
  userId: string,
  params?: { page?: number; limit?: number },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, userId, 'followers', params],
    queryFn: () => userService.getUserFollowers(userId, params),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

export function useUserFollowing(
  userId: string,
  params?: { page?: number; limit?: number },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, userId, 'following', params],
    queryFn: () => userService.getUserFollowing(userId, params),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

export function useIsFollowing(userId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, userId, 'is-following'],
    queryFn: () => userService.isFollowing(userId),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

export function useIsBlocked(userId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, userId, 'is-blocked'],
    queryFn: () => userService.isBlocked(userId),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

export function useBlockedUsers(
  params?: { page?: number; limit?: number },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, 'blocked', params],
    queryFn: () => userService.getBlockedUsers(params),
    enabled,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

// COMMUNITIES QUERIES

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
    queryFn: () => userService.getUserCommunities(userId, params),
    enabled: enabled && !!userId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

// SEARCH QUERIES

export function useSearchUsers(
  query: string,
  params?: {
    page?: number;
    limit?: number;
    filters?: {
      location?: string;
      interests?: string[];
      verified?: boolean;
    };
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, 'search', query, params],
    queryFn: () => userService.searchUsers(query, params),
    enabled: enabled && !!query && query.length > 2,
    staleTime: CACHE_TIME.SHORT,
  });
}

export function useSuggestedUsers(limit?: number, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, 'suggestions', limit],
    queryFn: () => userService.getSuggestedUsers(limit),
    enabled,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

// SESSIONS QUERIES

export function useActiveSessions(enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, 'sessions'],
    queryFn: () => userService.getActiveSessions(),
    enabled,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

// MUTATION HOOKS

// Profile mutations
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      showSuccess('Profile updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating profile:', error);
      showError(error.message || 'Failed to update profile');
    },
  });
}

export function useUpdateProfileById() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ userId, updateData }: { userId: string; updateData: Record<string, any> }) => 
      userService.updateUserProfileById(userId, updateData),
    onSuccess: (updatedUser, { userId }) => {
      // Update the specific user query cache
      queryClient.setQueryData([QUERY_KEYS.USER, 'profile', userId], updatedUser);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      showSuccess('Profile updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating profile:', error);
      showError(error.message || 'Failed to update profile');
    },
  });
}

export function useUpdateUserAvatar() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) => 
      userService.updateUserAvatar(userId, file),
    onSuccess: ({ user, message }, { userId }) => {
      // Update the specific user query cache
      queryClient.setQueryData([QUERY_KEYS.USER, 'profile', userId], user);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      showSuccess(message);
    },
    onError: (error: any) => {
      console.error('Error updating avatar:', error);
      showError(error.message || 'Error uploading profile picture.');
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      file, 
      onProgress 
    }: { 
      file: File; 
      onProgress?: (progress: number) => void;
    }) => userService.updateAvatar(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      showSuccess('Avatar updated successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update avatar');
    },
  });
}

export function useUpdateCoverImage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      file, 
      onProgress 
    }: { 
      file: File; 
      onProgress?: (progress: number) => void;
    }) => userService.updateCoverImage(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      showSuccess('Cover image updated successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update cover image');
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
      showSuccess('Account deleted successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to delete account');
    },
  });
}

// Preferences mutations
export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (preferences: Partial<UserPreferences>) => 
      userService.updatePreferences(preferences),
    onSuccess: (preferences) => {
      queryClient.setQueryData([QUERY_KEYS.USER, 'preferences'], preferences);
      showSuccess('Preferences updated successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update preferences');
    },
  });
}

export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (settings: {
      profileVisibility: 'public' | 'private' | 'friends';
      showEmail: boolean;
      showPhone: boolean;
      allowMessages: 'everyone' | 'friends' | 'none';
      allowFollows: boolean;
    }) => userService.updatePrivacySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, 'privacy'] });
      showSuccess('Privacy settings updated successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update privacy settings');
    },
  });
}

// Notification mutations
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => userService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: () => userService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      showSuccess('All notifications marked as read');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to mark notifications as read');
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (notificationId: string) => userService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      showSuccess('Notification deleted');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to delete notification');
    },
  });
}

// Social mutations
export function useFollowUser() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (userId: string) => userService.followUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, userId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, userId, 'followers'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, userId, 'is-following'] });
      showSuccess('User followed successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to follow user');
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (userId: string) => userService.unfollowUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, userId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, userId, 'followers'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, userId, 'is-following'] });
      showSuccess('User unfollowed successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to unfollow user');
    },
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (userId: string) => userService.blockUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, userId, 'is-blocked'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, 'blocked'] });
      showSuccess('User blocked successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to block user');
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (userId: string) => userService.unblockUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, userId, 'is-blocked'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, 'blocked'] });
      showSuccess('User unblocked successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to unblock user');
    },
  });
}

export function useReportUser() {
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      userId, 
      data 
    }: { 
      userId: string; 
      data: {
        reason: string;
        description?: string;
        evidence?: string[];
      };
    }) => userService.reportUser(userId, data),
    onSuccess: () => {
      showSuccess('User reported successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to report user');
    },
  });
}

// Verification mutations
export function useRequestEmailVerification() {
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: () => userService.requestEmailVerification(),
    onSuccess: () => {
      showSuccess('Verification email sent');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to send verification email');
    },
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (token: string) => userService.verifyEmail(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      showSuccess('Email verified successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to verify email');
    },
  });
}

export function useRequestPhoneVerification() {
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (phoneNumber: string) => userService.requestPhoneVerification(phoneNumber),
    onSuccess: () => {
      showSuccess('Verification code sent to your phone');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to send verification code');
    },
  });
}

export function useVerifyPhone() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (code: string) => userService.verifyPhone(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      showSuccess('Phone number verified successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to verify phone number');
    },
  });
}

// Session mutations
export function useRevokeSession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (sessionId: string) => userService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, 'sessions'] });
      showSuccess('Session revoked successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to revoke session');
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: () => userService.revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER, 'sessions'] });
      showSuccess('All sessions revoked successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to revoke sessions');
    },
  });
} 