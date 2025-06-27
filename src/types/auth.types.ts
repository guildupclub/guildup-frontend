export interface User {
  id: string;
  _id: string; // Keep for backward compatibility
  name: string;
  email: string;
  image?: string;
  avatar?: string;
  cover?: string;
  about?: string;
  phone?: string;
  location?: string;
  user_interests: string[];
  community_joined: string[];
  is_creator: boolean;
  custom_feeds: string[];
  year_of_experience?: string;
  session_conducted?: string;
  languages?: string[];
  emailVerified?: string | null;
  createdAt: string;
  updatedAt: string;
  isNewUser?: boolean;
  // Additional fields from UserProfile
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  communityCount?: number;
  isFollowing?: boolean;
  isBlocked?: boolean;
  joinedAt?: string;
  // User interaction fields
  save?: string[];
  share?: string[];
  upvote?: string[];
  downvote?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expires: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  signup: (credentials: SignupCredentials) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UserStats {
  postCount: number;
  commentCount: number;
  followerCount: number;
  followingCount: number;
  communityCount: number;
  totalLikes: number;
  totalViews: number;
  joinedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: {
    mentions: boolean;
    messages: boolean;
    communities: boolean;
    followers: boolean;
    posts: boolean;
  };
  pushNotifications: {
    mentions: boolean;
    messages: boolean;
    communities: boolean;
    followers: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: 'everyone' | 'friends' | 'none';
    allowFollows: boolean;
  };
}

export interface UserNotification {
  id: string;
  userId: string;
  type: 'mention' | 'message' | 'follow' | 'community' | 'post' | 'comment';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface UpdateUserRequest {
  name?: string;
  about?: string;
  phone?: string;
  location?: string;
  user_interests?: string[];
  year_of_experience?: string;
  languages?: string[];
} 