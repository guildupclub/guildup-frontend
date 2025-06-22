export interface Channel {
  _id: string;
  id: string; // Normalized id
  name: string;
  description?: string;
  type: 'chat' | 'post';
  community_id: string;
  created_by: string;
  is_private: boolean;
  is_locked: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
  last_activity_at?: string;
}

export interface Message {
  _id: string;
  channel_id: string;
  user_id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'emoji';
  reply_to?: string;
  edited_at?: string;
  created_at: string;
  user: {
    _id: string;
    name: string;
    image?: string;
    avatar?: string;
  };
  reactions: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface Post {
  _id: string;
  channel_id?: string;
  community_id?: string;
  user_id: string;
  title?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'link';
  images?: string[];
  video_url?: string;
  link_preview?: LinkPreview;
  up_votes: number;
  down_votes: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
  user: {
    _id: string;
    name: string;
    image?: string;
    avatar?: string;
  };
  is_pinned: boolean;
  is_locked: boolean;
}

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image?: string;
  site_name?: string;
}

export interface CreateChannelData {
  name: string;
  description?: string;
  type: 'chat' | 'post';
  community_id: string;
  is_private: boolean;
}

export interface CreateMessageData {
  channel_id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  reply_to?: string;
}

export interface CreatePostData {
  channel_id?: string;
  community_id?: string;
  title?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'link';
  images?: File[];
  video_url?: string;
}

// Type aliases for service compatibility
export type ChannelMessage = Message;
export type ChannelPost = Post;

// Request types for API calls
export interface CreateChannelRequest {
  name: string;
  description?: string;
  type: 'chat' | 'post';
  community_id: string;
  is_private: boolean;
}

export interface UpdateChannelRequest {
  name?: string;
  description?: string;
  is_private?: boolean;
  is_locked?: boolean;
}

export interface SendMessageRequest {
  channelId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'emoji';
  reply_to?: string;
}

export interface CreatePostRequest {
  channelId?: string;
  community_id?: string;
  title?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'link';
  images?: string[];
  video_url?: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  type?: 'text' | 'image' | 'video' | 'link';
  images?: string[];
  video_url?: string;
}

export interface ChannelContextType {
  // State
  selectedChannel: Channel | null;
  currentMessages: ChannelMessage[];
  currentPosts: ChannelPost[];
  isLoading: boolean;
  error: string | null;
  hasMoreMessages: boolean;
  hasMorePosts: boolean;

  // Actions
  selectChannel: (channel: Channel | null) => void;
  setMessages: (messages: ChannelMessage[]) => void;
  addMessage: (message: ChannelMessage) => void;
  updateMessage: (message: ChannelMessage) => void;
  deleteMessage: (messageId: string) => void;
  setPosts: (posts: ChannelPost[]) => void;
  addPost: (post: ChannelPost) => void;
  updatePost: (post: ChannelPost) => void;
  deletePost: (postId: string) => void;
  fetchChannel: (channelId: string) => Promise<Channel>;
  fetchChannelMessages: (channelId: string, page?: number, limit?: number) => Promise<ChannelMessage[]>;
  fetchChannelPosts: (channelId: string, page?: number, limit?: number) => Promise<ChannelPost[]>;
  createChannel: (data: CreateChannelRequest) => Promise<Channel>;
  updateChannel: (channelId: string, data: UpdateChannelRequest) => Promise<Channel>;
  sendMessage: (data: SendMessageRequest) => Promise<ChannelMessage>;
  createPost: (data: CreatePostRequest) => Promise<ChannelPost>;
  resetChannelState: () => void;

  // Mutation states
  isCreating: boolean;
  isUpdating: boolean;
  isSendingMessage: boolean;
  isCreatingPost: boolean;
} 