'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  ChannelContextType, 
  Channel, 
  ChannelMessage, 
  ChannelPost,
  CreateChannelRequest,
  UpdateChannelRequest,
  SendMessageRequest,
  CreatePostRequest
} from '@/types/channel.types';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from '@/services/apiClient';
import { useToast } from './ToastContext';
import { QUERY_KEYS, API_ENDPOINTS } from '@/utils/constants';

// Channel state
interface ChannelState {
  selectedChannel: Channel | null;
  currentMessages: ChannelMessage[];
  currentPosts: ChannelPost[];
  isLoading: boolean;
  error: string | null;
  hasMoreMessages: boolean;
  hasMorePosts: boolean;
}

// Initial state
const initialState: ChannelState = {
  selectedChannel: null,
  currentMessages: [],
  currentPosts: [],
  isLoading: false,
  error: null,
  hasMoreMessages: true,
  hasMorePosts: true,
};

// Action types
type ChannelAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_CHANNEL'; payload: Channel | null }
  | { type: 'SET_MESSAGES'; payload: ChannelMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChannelMessage }
  | { type: 'UPDATE_MESSAGE'; payload: ChannelMessage }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'SET_POSTS'; payload: ChannelPost[] }
  | { type: 'ADD_POST'; payload: ChannelPost }
  | { type: 'UPDATE_POST'; payload: ChannelPost }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'SET_HAS_MORE_MESSAGES'; payload: boolean }
  | { type: 'SET_HAS_MORE_POSTS'; payload: boolean }
  | { type: 'RESET' };

// Reducer
function channelReducer(state: ChannelState, action: ChannelAction): ChannelState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SELECTED_CHANNEL':
      return { ...state, selectedChannel: action.payload };
    case 'SET_MESSAGES':
      return { ...state, currentMessages: action.payload };
    case 'ADD_MESSAGE':
      return {
        ...state,
        currentMessages: [...state.currentMessages, action.payload],
      };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        currentMessages: state.currentMessages.map(message =>
          message.id === action.payload.id ? action.payload : message
        ),
      };
    case 'DELETE_MESSAGE':
      return {
        ...state,
        currentMessages: state.currentMessages.filter(message => message.id !== action.payload),
      };
    case 'SET_POSTS':
      return { ...state, currentPosts: action.payload };
    case 'ADD_POST':
      return {
        ...state,
        currentPosts: [action.payload, ...state.currentPosts],
      };
    case 'UPDATE_POST':
      return {
        ...state,
        currentPosts: state.currentPosts.map(post =>
          post.id === action.payload.id ? action.payload : post
        ),
      };
    case 'DELETE_POST':
      return {
        ...state,
        currentPosts: state.currentPosts.filter(post => post.id !== action.payload),
      };
    case 'SET_HAS_MORE_MESSAGES':
      return { ...state, hasMoreMessages: action.payload };
    case 'SET_HAS_MORE_POSTS':
      return { ...state, hasMorePosts: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Create context
const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

// Provider component
export function ChannelProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(channelReducer, initialState);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // Fetch channel by ID
  const fetchChannel = useCallback(async (channelId: string): Promise<Channel> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.get<ApiResponse<Channel>>(
        `${API_ENDPOINTS.CHANNELS}/${channelId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch channel');
      }

      return response.data.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch channel';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Fetch channel messages
  const fetchChannelMessages = useCallback(async (
    channelId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<ChannelMessage[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ChannelMessage[]>>(
        `${API_ENDPOINTS.CHANNELS}/${channelId}/messages`,
        { params: { page, limit } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch messages');
      }

      return response.data.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      showError(errorMessage);
      throw error;
    }
  }, [showError]);

  // Fetch channel posts
  const fetchChannelPosts = useCallback(async (
    channelId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<ChannelPost[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ChannelPost[]>>(
        `${API_ENDPOINTS.CHANNELS}/${channelId}/posts`,
        { params: { page, limit } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch posts');
      }

      return response.data.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch posts';
      showError(errorMessage);
      throw error;
    }
  }, [showError]);

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: async (data: CreateChannelRequest): Promise<Channel> => {
      const response = await apiClient.post<ApiResponse<Channel>>(
        API_ENDPOINTS.CHANNELS,
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create channel');
      }

      return response.data.data;
    },
    onSuccess: (channel) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHANNELS] });
      dispatch({ type: 'SET_SELECTED_CHANNEL', payload: channel });
      showSuccess('Channel created successfully!');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create channel';
      showError(errorMessage);
    },
  });

  // Update channel mutation
  const updateChannelMutation = useMutation({
    mutationFn: async ({ channelId, data }: { channelId: string; data: UpdateChannelRequest }): Promise<Channel> => {
      const response = await apiClient.put<ApiResponse<Channel>>(
        `${API_ENDPOINTS.CHANNELS}/${channelId}`,
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update channel');
      }

      return response.data.data;
    },
    onSuccess: (channel) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHANNELS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHANNEL, channel.id] });
      dispatch({ type: 'SET_SELECTED_CHANNEL', payload: channel });
      showSuccess('Channel updated successfully!');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update channel';
      showError(errorMessage);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageRequest): Promise<ChannelMessage> => {
      const response = await apiClient.post<ApiResponse<ChannelMessage>>(
        `${API_ENDPOINTS.CHANNELS}/${data.channelId}/messages`,
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send message');
      }

      return response.data.data;
    },
    onSuccess: (message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNEL_MESSAGES, message.channelId] 
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      showError(errorMessage);
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostRequest): Promise<ChannelPost> => {
      const response = await apiClient.post<ApiResponse<ChannelPost>>(
        `${API_ENDPOINTS.CHANNELS}/${data.channelId}/posts`,
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create post');
      }

      return response.data.data;
    },
    onSuccess: (post) => {
      dispatch({ type: 'ADD_POST', payload: post });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNEL_POSTS, post.channelId] 
      });
      showSuccess('Post created successfully!');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      showError(errorMessage);
    },
  });

  // Context methods
  const selectChannel = useCallback((channel: Channel | null) => {
    dispatch({ type: 'SET_SELECTED_CHANNEL', payload: channel });
  }, []);

  const setMessages = useCallback((messages: ChannelMessage[]) => {
    dispatch({ type: 'SET_MESSAGES', payload: messages });
  }, []);

  const addMessage = useCallback((message: ChannelMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const updateMessage = useCallback((message: ChannelMessage) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: message });
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    dispatch({ type: 'DELETE_MESSAGE', payload: messageId });
  }, []);

  const setPosts = useCallback((posts: ChannelPost[]) => {
    dispatch({ type: 'SET_POSTS', payload: posts });
  }, []);

  const addPost = useCallback((post: ChannelPost) => {
    dispatch({ type: 'ADD_POST', payload: post });
  }, []);

  const updatePost = useCallback((post: ChannelPost) => {
    dispatch({ type: 'UPDATE_POST', payload: post });
  }, []);

  const deletePost = useCallback((postId: string) => {
    dispatch({ type: 'DELETE_POST', payload: postId });
  }, []);

  const createChannel = useCallback((data: CreateChannelRequest) => {
    return createChannelMutation.mutateAsync(data);
  }, [createChannelMutation]);

  const updateChannel = useCallback((channelId: string, data: UpdateChannelRequest) => {
    return updateChannelMutation.mutateAsync({ channelId, data });
  }, [updateChannelMutation]);

  const sendMessage = useCallback((data: SendMessageRequest) => {
    return sendMessageMutation.mutateAsync(data);
  }, [sendMessageMutation]);

  const createPost = useCallback((data: CreatePostRequest) => {
    return createPostMutation.mutateAsync(data);
  }, [createPostMutation]);

  const resetChannelState = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const contextValue: ChannelContextType = {
    // State
    selectedChannel: state.selectedChannel,
    currentMessages: state.currentMessages,
    currentPosts: state.currentPosts,
    isLoading: state.isLoading,
    error: state.error,
    hasMoreMessages: state.hasMoreMessages,
    hasMorePosts: state.hasMorePosts,

    // Actions
    selectChannel,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    setPosts,
    addPost,
    updatePost,
    deletePost,
    fetchChannel,
    fetchChannelMessages,
    fetchChannelPosts,
    createChannel,
    updateChannel,
    sendMessage,
    createPost,
    resetChannelState,

    // Mutation states
    isCreating: createChannelMutation.isPending,
    isUpdating: updateChannelMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
    isCreatingPost: createPostMutation.isPending,
  };

  return (
    <ChannelContext.Provider value={contextValue}>
      {children}
    </ChannelContext.Provider>
  );
}

// Hook to use channel context
export function useChannel(): ChannelContextType {
  const context = useContext(ChannelContext);
  if (context === undefined) {
    throw new Error('useChannel must be used within a ChannelProvider');
  }
  return context;
} 