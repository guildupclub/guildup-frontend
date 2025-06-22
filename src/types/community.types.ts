export interface Community {
  _id: string;
  name: string;
  description: string;
  image?: string;
  background_image?: string;
  category: string;
  category_id: string;
  owner_id: string;
  member_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  tags: string[];
  rules?: string[];
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
  category_id: string;
  is_public: boolean;
  image?: File;
  background_image?: File;
  tags: string[];
  rules?: string[];
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
  category_id?: string;
  is_public?: boolean;
  image?: File;
  background_image?: string;
  tags?: string[];
  rules?: string[];
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
  category_id: string;
  is_public: boolean;
  image?: string;
  background_image?: string;
  tags: string[];
  rules?: string[];
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  category_id?: string;
  is_public?: boolean;
  image?: string;
  background_image?: string;
  tags?: string[];
  rules?: string[];
}

export interface JoinCommunityRequest {
  communityId: string;
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