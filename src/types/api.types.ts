export interface ApiResponse<T = any> {
  r: 's' | 'e'; // success or error
  message?: string;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface InfiniteQueryData<T> {
  pages: PaginatedResponse<T>[];
  pageParams: (number | undefined)[];
  flattenedData?: T[];
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface NavigationContextType {
  activeTab: 'feed' | 'explore' | 'community' | 'profile';
  activeCommunity: {
    id: string;
    name: string;
    image?: string;
  } | null;
  activeChannel: {
    id: string;
    name: string;
    type: 'chat' | 'post';
  } | null;
  communitySubTab: 'feed' | 'members' | 'courses' | 'profile' | 'channels';
  setActiveTab: (tab: 'feed' | 'explore' | 'community' | 'profile') => void;
  setActiveCommunity: (community: { id: string; name: string; image?: string } | null) => void;
  setActiveChannel: (channel: { id: string; name: string; type: 'chat' | 'post' } | null) => void;
  setCommunitySubTab: (subTab: 'feed' | 'members' | 'courses' | 'profile' | 'channels') => void;
  navigateToFeed: () => void;
  navigateToExplore: () => void;
  navigateToCommunity: (communityId: string, communityName: string) => void;
  navigateToProfile: () => void;
  navigateToChannel: (communityId: string, communityName: string, channelId: string, channelName: string) => void;
}

export interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
  dismissToast: (id: string) => void;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  actualTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export interface RouteParams {
  communityId: string | null;
  communityName: string | null;
  channelId: string | null;
  channelName: string | null;
  postId: string | null;
  userId: string | null;
}

export interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
}

export interface MutationOptions<TData = any, TError = ApiError, TVariables = any> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
} 