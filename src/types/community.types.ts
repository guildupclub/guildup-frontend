export interface Community<TCategory=string> {
  _id: string;
  user_id: string; // Owner/creator of the community
  category_id?: TCategory;
  icon_id?: string;
  image?: string;
  background_image?: string;
  name: string;
  description: string;
  rules?: string; // Changed from string[] to string to match schema
  owner_name?: string;
  post_count: number;
  post_reply_count: number;
  created_at: string;
  banned: boolean;
  restricted_to_mods: boolean;
  content_warning: boolean;
  low_quality: boolean;
  show_home: boolean;
  show_popular: boolean;
  subscription: boolean;
  subscription_price: number;
  moderation_level: 'none' | 'light' | 'heavy';
  additional_tags: string[];
  is_active: boolean;
  edited_at: string | null;
  nsfw: boolean;
  reports?: string[];
  banned_member?: string[];
  num_member: number;
  is_locked: boolean;
  total_subs: number;
  score: number;
  youtube_followers: number;
  instagram_followers: number;
  linkedin_followers: number;
  last_active: string;
  iscalendarConnected: boolean;
  calendar_oauth_access_token?: string | null;
  calendar_oauth_refresh_token?: string | null;
  calendar_oauth_token_expiry?: string | null;
  testimonials: string[];
  
  // Legacy fields for backward compatibility
  category?: string;
  owner_id?: string;
  member_count?: number;
  is_public?: boolean;
  updated_at?: string;
  tags?: string[];
}

export interface CommunityMember {
  _id: string;
  user_id: string;
  community_id: string;
  role: 'owner' | 'moderator' | 'member';
  joined_at: string;
  is_active: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    avatar?: string;
  };
}

export interface CommunityPermissions {
  can_post: boolean;
  can_comment: boolean;
  can_create_channels: boolean;
  can_moderate: boolean;
  can_manage_members: boolean;
  can_edit_community: boolean;
  can_delete_community: boolean;
}

export interface CreateCommunityData {
  name: string;
  description: string;
  category_id?: string;
  icon_id?: string;
  image?: File;
  background_image?: File;
  rules?: string;
  owner_name?: string;
  banned?: boolean;
  restricted_to_mods?: boolean;
  content_warning?: boolean;
  low_quality?: boolean;
  show_home?: boolean;
  show_popular?: boolean;
  subscription?: boolean;
  subscription_price?: number;
  moderation_level?: 'none' | 'light' | 'heavy';
  additional_tags?: string[];
  is_active?: boolean;
  nsfw?: boolean;
  is_locked?: boolean;
  youtube_followers?: number;
  instagram_followers?: number;
  linkedin_followers?: number;
  iscalendarConnected?: boolean;
  calendar_oauth_access_token?: string;
  calendar_oauth_refresh_token?: string;
  calendar_oauth_token_expiry?: string;
  testimonials?: string[];
  
  // Legacy fields for backward compatibility
  is_public?: boolean;
  tags?: string[];
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
  category_id?: string;
  icon_id?: string;
  image?: File;
  background_image?: string;
  rules?: string;
  owner_name?: string;
  banned?: boolean;
  restricted_to_mods?: boolean;
  content_warning?: boolean;
  low_quality?: boolean;
  show_home?: boolean;
  show_popular?: boolean;
  subscription?: boolean;
  subscription_price?: number;
  moderation_level?: 'none' | 'light' | 'heavy';
  additional_tags?: string[];
  is_active?: boolean;
  nsfw?: boolean;
  is_locked?: boolean;
  youtube_followers?: number;
  instagram_followers?: number;
  linkedin_followers?: number;
  iscalendarConnected?: boolean;
  calendar_oauth_access_token?: string;
  calendar_oauth_refresh_token?: string;
  calendar_oauth_token_expiry?: string;
  testimonials?: string[];
  
  // Legacy fields for backward compatibility
  is_public?: boolean;
  tags?: string[];
}

export interface CommunityStats {
  member_count: number;
  post_count: number;
  channel_count: number;
  active_members_today: number;
  growth_rate: number;
}

// API Request types
export interface CreateCommunityRequest {
  name: string;
  description: string;
  category_id?: string;
  icon_id?: string;
  image?: string;
  background_image?: string;
  rules?: string;
  owner_name?: string;
  banned?: boolean;
  restricted_to_mods?: boolean;
  content_warning?: boolean;
  low_quality?: boolean;
  show_home?: boolean;
  show_popular?: boolean;
  subscription?: boolean;
  subscription_price?: number;
  moderation_level?: 'none' | 'light' | 'heavy';
  additional_tags?: string[];
  is_active?: boolean;
  nsfw?: boolean;
  is_locked?: boolean;
  youtube_followers?: number;
  instagram_followers?: number;
  linkedin_followers?: number;
  iscalendarConnected?: boolean;
  calendar_oauth_access_token?: string;
  calendar_oauth_refresh_token?: string;
  calendar_oauth_token_expiry?: string;
  testimonials?: string[];
  
  // Legacy fields for backward compatibility
  is_public?: boolean;
  tags?: string[];
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  category_id?: string;
  icon_id?: string;
  image?: string;
  background_image?: string;
  rules?: string;
  owner_name?: string;
  banned?: boolean;
  restricted_to_mods?: boolean;
  content_warning?: boolean;
  low_quality?: boolean;
  show_home?: boolean;
  show_popular?: boolean;
  subscription?: boolean;
  subscription_price?: number;
  moderation_level?: 'none' | 'light' | 'heavy';
  additional_tags?: string[];
  is_active?: boolean;
  nsfw?: boolean;
  is_locked?: boolean;
  youtube_followers?: number;
  instagram_followers?: number;
  linkedin_followers?: number;
  iscalendarConnected?: boolean;
  calendar_oauth_access_token?: string;
  calendar_oauth_refresh_token?: string;
  calendar_oauth_token_expiry?: string;
  testimonials?: string[];
  
  // Legacy fields for backward compatibility
  is_public?: boolean;
  tags?: string[];
}

export interface JoinCommunityRequest {
  communityId: string;
  userId: string;
  inviteCode?: string;
}

export interface CommunityContextType {
  // State
  selectedCommunity: Community | null;
  currentMembers: CommunityMember[];
  isLoading: boolean;
  error: string | null;

  // Actions
  selectCommunity: (community: Community | null) => void;
  setMembers: (members: CommunityMember[]) => void;
  addMember: (member: CommunityMember) => void;
  removeMember: (memberId: string) => void;
  updateMember: (member: CommunityMember) => void;
  fetchCommunity: (communityId: string) => Promise<Community>;
  fetchCommunityMembers: (communityId: string) => Promise<CommunityMember[]>;
  createCommunity: (data: CreateCommunityRequest) => Promise<Community>;
  updateCommunity: (communityId: string, data: UpdateCommunityRequest) => Promise<Community>;
  joinCommunity: (data: JoinCommunityRequest) => Promise<void>;
  leaveCommunity: (communityId: string) => Promise<void>;
  resetCommunityState: () => void;

  // Mutation states
  isCreating: boolean;
  isUpdating: boolean;
  isJoining: boolean;
  isLeaving: boolean;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
} 