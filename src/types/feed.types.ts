import { Post, LinkPreview } from './channel.types';
import { User } from './auth.types';

export interface FeedPost extends Post {
  community?: {
    _id: string;
    name: string;
    image?: string;
  };
  user_vote?: 'up' | 'down' | null;
  is_saved?: boolean;
  is_shared?: boolean;
}

export interface Comment {
  _id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string; // For nested comments
  level: number;
  up_votes: number;
  down_votes: number;
  created_at: string;
  updated_at: string;
  user: {
    _id: string;
    name: string;
    image?: string;
    avatar?: string;
  };
  replies?: Comment[];
  user_vote?: 'up' | 'down' | null;
}

export interface FeedFilters {
  type?: 'all' | 'following' | 'trending' | 'saved';
  category?: string;
  timeframe?: 'today' | 'week' | 'month' | 'all';
  sort?: 'newest' | 'popular' | 'trending';
}

export interface CreateCommentData {
  post_id: string;
  content: string;
  parent_id?: string;
}

export interface VoteData {
  post_id?: string;
  comment_id?: string;
  type: 'up' | 'down';
}

export interface ShareData {
  post_id: string;
  platform?: 'twitter' | 'facebook' | 'linkedin' | 'copy';
  message?: string;
}

export interface FeedMetrics {
  total_posts: number;
  total_engagement: number;
  top_categories: Array<{
    category: string;
    count: number;
  }>;
  user_activity: {
    posts_created: number;
    comments_made: number;
    votes_cast: number;
  };
}

export interface TrendingTopic {
  _id: string;
  name: string;
  hashtag: string;
  post_count: number;
  engagement_rate: number;
  growth_rate: number;
}

export interface FeedContextType {
  posts: FeedPost[];
  isLoading: boolean;
  hasNextPage: boolean;
  filters: FeedFilters;
  setFilters: (filters: Partial<FeedFilters>) => void;
  loadMore: () => void;
  refreshFeed: () => void;
  voteOnPost: (postId: string, voteType: 'up' | 'down') => Promise<void>;
  savePost: (postId: string) => Promise<void>;
  sharePost: (shareData: ShareData) => Promise<void>;
} 