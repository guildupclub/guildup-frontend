// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';

// Route Constants
export const ROUTES = {
  HOME: '/',
  FEED: '/feed',
  EXPLORE: '/explore',
  COMMUNITY: '/community',
  PROFILE: '/profile',
  AUTH: {
    SIGNIN: '/signin',
    SIGNUP: '/signup',
  },
  MARKETING: {
    ABOUT: '/about',
    CONTACT: '/contact-us',
    PRIVACY: '/privacy-policy',
    TERMS: '/terms-conditions',
  },
} as const;

// Navigation Tabs
export const MAIN_TABS = {
  FEED: 'feed',
  EXPLORE: 'explore',
  COMMUNITY: 'community',
  PROFILE: 'profile',
} as const;

export const COMMUNITY_SUB_TABS = {
  FEED: 'feed',
  MEMBERS: 'members',
  COURSES: 'courses',
  PROFILE: 'profile',
  CHANNELS: 'channels',
} as const;

// Channel Types
export const CHANNEL_TYPES = {
  CHAT: 'chat',
  POST: 'post',
} as const;

// Post Types
export const POST_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  LINK: 'link',
} as const;

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  EMOJI: 'emoji',
} as const;

// Vote Types
export const VOTE_TYPES = {
  UP: 'up',
  DOWN: 'down',
} as const;

// User Roles
export const USER_ROLES = {
  OWNER: 'owner',
  MODERATOR: 'moderator',
  MEMBER: 'member',
} as const;

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;

// Theme Types
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: '/v1/auth',
  USERS: '/v1/users',
  COMMUNITIES: '/v1/community',
  CHANNELS: '/v1/channel',
  POSTS: '/v1/posts',
  MESSAGES: '/v1/messages',
  COMMENTS: '/v1/comments',
  CATEGORIES: '/v1/category',
  FEED: '/v1/feed',
  EXPLORE: '/v1/explore',
  UPLOAD: '/v1/upload',
  OFFERINGS: '/v1/offering',
} as const;

// Query Keys
export const QUERY_KEYS = {
  AUTH: ['auth'],
  USER: ['user'],
  USERS: ['users'],
  COMMUNITIES: ['communities'],
  COMMUNITY: ['community'],
  COMMUNITY_MEMBERS: ['community-members'],
  CHANNELS: ['channels'],
  CHANNEL: ['channel'],
  CHANNEL_MESSAGES: ['channel-messages'],
  CHANNEL_POSTS: ['channel-posts'],
  POSTS: ['posts'],
  POST: ['post'],
  MESSAGES: ['messages'],
  COMMENTS: ['comments'],
  CATEGORIES: ['categories'],
  FEED: ['feed'],
  EXPLORE: ['explore'],
  NOTIFICATIONS: ['notifications'],
  SEARCH: ['search'],
  POPULAR: ['popular'],
  OFFERINGS: ['offering']
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  UI_PREFERENCES: 'ui_preferences',
  THEME: 'theme',
  NAVIGATION_STATE: 'navigation_state',
} as const;

// Default UI Preferences
export const DEFAULT_UI_PREFERENCES = {
  theme: 'system' as const,
  compactMode: false,
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium' as const,
  sidebarCollapsed: false,
  notifications: {
    desktop: true,
    email: true,
    push: true,
    mentions: true,
    communities: true,
    messages: true,
  },
  autoSave: true,
  language: 'en',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  INFINITE_SCROLL_THRESHOLD: 0.8,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_FILE_TYPES: ['application/pdf', 'text/plain', 'application/msword'],
} as const;

// Time Constants
export const TIME = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

// Cache Times (React Query)
export const CACHE_TIME = {
  SHORT: 5 * TIME.MINUTE,
  MEDIUM: 30 * TIME.MINUTE,
  LONG: 60 * TIME.MINUTE,
  VERY_LONG: 24 * TIME.HOUR,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  POST_CREATED: 'Post created successfully!',
  COMMENT_ADDED: 'Comment added successfully!',
  COMMUNITY_JOINED: 'Successfully joined community!',
  COMMUNITY_LEFT: 'Successfully left community!',
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_PWA: true,
  ENABLE_ANALYTICS: true,
  ENABLE_VIDEO_UPLOAD: true,
  ENABLE_REAL_TIME_CHAT: true,
} as const; 