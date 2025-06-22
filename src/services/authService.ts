import { apiClient } from './apiClient';
import type { User, LoginCredentials } from '@/types/auth.types';

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

class AuthService {
  /**
   * Sign up a new user
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/v1/auth/signup', data);
  }

  /**
   * Sign in user
   */
  async signin(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/v1/auth/signin', credentials);
  }

  /**
   * Sign out user
   */
  async signout(): Promise<void> {
    return apiClient.post<void>('/v1/auth/signout');
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<User> {
    return apiClient.post<User>('/v1/auth/profile', { userId });
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    return apiClient.patch<User>('/v1/auth/edit', {
      userId,
      updateData: data,
    });
  }

  /**
   * Update user avatar
   */
  async updateAvatar(
    userId: string, 
    avatarFile: File,
    onProgress?: (progress: number) => void
  ): Promise<User> {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('avatar', avatarFile);

    return apiClient.upload<User>('/v1/auth/update-avatar', formData, onProgress);
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/v1/auth/refresh', { refreshToken });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    return apiClient.post<void>('/v1/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return apiClient.post<void>('/v1/auth/reset-password', {
      token,
      password: newPassword,
    });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    return apiClient.post<void>('/v1/auth/verify-email', { token });
  }

  /**
   * Request email verification
   */
  async requestEmailVerification(email: string): Promise<void> {
    return apiClient.post<void>('/v1/auth/request-verification', { email });
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    return apiClient.post<void>('/v1/auth/change-password', {
      userId,
      currentPassword,
      newPassword,
    });
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string, password: string): Promise<void> {
    return apiClient.post<void>('/v1/auth/delete-account', {
      userId,
      password,
    });
  }

  /**
   * Get user's joined communities
   */
  async getUserCommunities(userId: string): Promise<any[]> {
    return apiClient.post<any[]>('/v1/community/user/follow', { userId });
  }

  /**
   * Update user interests
   */
  async updateUserInterests(userId: string, interests: string[]): Promise<User> {
    return apiClient.patch<User>('/v1/auth/edit', {
      userId,
      updateData: { user_interests: interests },
    });
  }

  /**
   * Toggle creator status
   */
  async toggleCreatorStatus(userId: string, isCreator: boolean): Promise<User> {
    return apiClient.patch<User>('/v1/auth/edit', {
      userId,
      updateData: { is_creator: isCreator },
    });
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Export the class for testing or creating new instances
export { AuthService }; 