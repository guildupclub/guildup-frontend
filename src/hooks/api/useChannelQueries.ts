import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import type { 
  Channel, 
  ChannelMessage, 
  ChannelPost,
  CreateChannelRequest,
  UpdateChannelRequest,
  SendMessageRequest,
  CreatePostRequest,
  UpdatePostRequest
} from '@/types/channel.types';
import type { PaginatedResponse } from '@/types/api.types';
import { channelService } from '@/services/channelService';
import { QUERY_KEYS, CACHE_TIME } from '@/utils/constants';
import { useToast } from '@/contexts/ToastContext';

// CHANNEL QUERIES

export function useChannels(
  communityId: string,
  params?: {
    page?: number;
    limit?: number;
    type?: 'chat' | 'post';
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHANNELS, communityId, params],
    queryFn: () => channelService.getChannels(communityId, params),
    enabled: enabled && !!communityId,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

export function useChannel(channelId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHANNEL, channelId],
    queryFn: () => channelService.getChannel(channelId),
    enabled: enabled && !!channelId,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

// MESSAGE QUERIES

export function useChannelMessages(
  channelId: string,
  params?: {
    page?: number;
    limit?: number;
    before?: string;
    after?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHANNEL_MESSAGES, channelId, params],
    queryFn: () => channelService.getChannelMessages(channelId, params),
    enabled: enabled && !!channelId,
    staleTime: CACHE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
  });
}

export function useInfiniteChannelMessages(
  channelId: string,
  params?: {
    limit?: number;
  },
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.CHANNEL_MESSAGES, channelId, 'infinite', params],
    queryFn: ({ pageParam }) => 
      channelService.getChannelMessages(channelId, { 
        ...params, 
        before: pageParam 
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      const messages = lastPage.data;
      return messages.length > 0 ? messages[0]._id : undefined;
    },
    enabled: enabled && !!channelId,
    staleTime: CACHE_TIME.SHORT,
  });
}

export function useMessage(channelId: string, messageId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHANNEL_MESSAGES, channelId, messageId],
    queryFn: () => channelService.getMessage(channelId, messageId),
    enabled: enabled && !!channelId && !!messageId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

// POST QUERIES

export function useChannelPosts(
  channelId: string,
  params?: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'popular';
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHANNEL_POSTS, channelId, params],
    queryFn: () => channelService.getChannelPosts(channelId, params),
    enabled: enabled && !!channelId,
    staleTime: CACHE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
  });
}

export function useInfiniteChannelPosts(
  channelId: string,
  params?: {
    limit?: number;
    sort?: 'newest' | 'oldest' | 'popular';
  },
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.CHANNEL_POSTS, channelId, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      channelService.getChannelPosts(channelId, { ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = lastPage.data.length === (params?.limit || 20);
      return hasMore ? allPages.length + 1 : undefined;
    },
    enabled: enabled && !!channelId,
    staleTime: CACHE_TIME.SHORT,
  });
}

export function usePost(channelId: string, postId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHANNEL_POSTS, channelId, postId],
    queryFn: () => channelService.getPost(channelId, postId),
    enabled: enabled && !!channelId && !!postId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

export function usePostComments(
  channelId: string,
  postId: string,
  params?: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'popular';
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMENTS, channelId, postId, params],
    queryFn: () => channelService.getPostComments(channelId, postId, params),
    enabled: enabled && !!channelId && !!postId,
    staleTime: CACHE_TIME.SHORT,
  });
}

// SEARCH QUERIES

export function useSearchMessages(
  channelId: string,
  query: string,
  params?: {
    page?: number;
    limit?: number;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHANNEL_MESSAGES, channelId, 'search', query, params],
    queryFn: () => channelService.searchMessages(channelId, query, params),
    enabled: enabled && !!channelId && !!query && query.length > 2,
    staleTime: CACHE_TIME.SHORT,
  });
}

export function useSearchPosts(
  channelId: string,
  query: string,
  params?: {
    page?: number;
    limit?: number;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHANNEL_POSTS, channelId, 'search', query, params],
    queryFn: () => channelService.searchPosts(channelId, query, params),
    enabled: enabled && !!channelId && !!query && query.length > 2,
    staleTime: CACHE_TIME.SHORT,
  });
}

// PERMISSIONS

export function useChannelPermissions(channelId: string, userId?: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHANNEL, channelId, 'permissions', userId],
    queryFn: () => channelService.getChannelPermissions(channelId, userId),
    enabled: enabled && !!channelId,
    staleTime: CACHE_TIME.MEDIUM,
  });
}

// MUTATION HOOKS

// Channel mutations
export function useCreateChannel() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateChannelRequest) => channelService.createChannel(data),
    onSuccess: (channel) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNELS, channel.community_id] 
      });
      queryClient.setQueryData([QUERY_KEYS.CHANNEL, channel._id], channel);
      showSuccess('Channel created successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to create channel');
    },
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ channelId, data }: { channelId: string; data: UpdateChannelRequest }) =>
      channelService.updateChannel(channelId, data),
    onSuccess: (channel) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNELS, channel.community_id] 
      });
      queryClient.setQueryData([QUERY_KEYS.CHANNEL, channel._id], channel);
      showSuccess('Channel updated successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update channel');
    },
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (channelId: string) => channelService.deleteChannel(channelId),
    onSuccess: (_, channelId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHANNELS] });
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.CHANNEL, channelId] });
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.CHANNEL_MESSAGES, channelId] });
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.CHANNEL_POSTS, channelId] });
      showSuccess('Channel deleted successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to delete channel');
    },
  });
}

export function useArchiveChannel() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ channelId, archived }: { channelId: string; archived: boolean }) =>
      channelService.archiveChannel(channelId, archived),
    onSuccess: (channel) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNELS, channel.community_id] 
      });
      queryClient.setQueryData([QUERY_KEYS.CHANNEL, channel._id], channel);
      showSuccess(`Channel ${channel.name} ${channel.is_locked ? 'archived' : 'unarchived'} successfully`);
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to archive channel');
    },
  });
}

// Message mutations
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => channelService.sendMessage(data),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNEL_MESSAGES, message.channel_id] 
      });
      // Optimistically add message to cache
      queryClient.setQueryData(
        [QUERY_KEYS.CHANNEL_MESSAGES, message.channel_id],
        (old: any) => {
          if (!old) return { data: [message] };
          return { ...old, data: [...old.data, message] };
        }
      );
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to send message');
    },
  });
}

export function useUpdateMessage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      channelId, 
      messageId, 
      data 
    }: { 
      channelId: string; 
      messageId: string; 
      data: { content: string };
    }) => channelService.updateMessage(channelId, messageId, data),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNEL_MESSAGES, message.channel_id] 
      });
      showSuccess('Message updated successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update message');
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ channelId, messageId }: { channelId: string; messageId: string }) =>
      channelService.deleteMessage(channelId, messageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNEL_MESSAGES, variables.channelId] 
      });
      showSuccess('Message deleted successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to delete message');
    },
  });
}

export function useReactToMessage() {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      channelId, 
      messageId, 
      emoji 
    }: { 
      channelId: string; 
      messageId: string; 
      emoji: string;
    }) => channelService.reactToMessage(channelId, messageId, emoji),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNEL_MESSAGES, message.channel_id] 
      });
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to add reaction');
    },
  });
}

export function useRemoveMessageReaction() {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      channelId, 
      messageId, 
      emoji 
    }: { 
      channelId: string; 
      messageId: string; 
      emoji: string;
    }) => channelService.removeMessageReaction(channelId, messageId, emoji),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNEL_MESSAGES, message.channel_id] 
      });
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to remove reaction');
    },
  });
}

// Post mutations
export function useCreatePost() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => channelService.createPost(data),
    onSuccess: (post) => {
      if (post.channel_id) {
        queryClient.invalidateQueries({ 
          queryKey: [QUERY_KEYS.CHANNEL_POSTS, post.channel_id] 
        });
      }
      showSuccess('Post created successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to create post');
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      channelId, 
      postId, 
      data 
    }: { 
      channelId: string; 
      postId: string; 
      data: UpdatePostRequest;
    }) => channelService.updatePost(channelId, postId, data),
    onSuccess: (post) => {
      if (post.channel_id) {
        queryClient.invalidateQueries({ 
          queryKey: [QUERY_KEYS.CHANNEL_POSTS, post.channel_id] 
        });
      }
      queryClient.setQueryData([QUERY_KEYS.CHANNEL_POSTS, post.channel_id, post._id], post);
      showSuccess('Post updated successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update post');
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ channelId, postId }: { channelId: string; postId: string }) =>
      channelService.deletePost(channelId, postId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNEL_POSTS, variables.channelId] 
      });
      showSuccess('Post deleted successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to delete post');
    },
  });
}

export function useVoteOnPost() {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      channelId, 
      postId, 
      voteType 
    }: { 
      channelId: string; 
      postId: string; 
      voteType: 'up' | 'down';
    }) => channelService.voteOnPost(channelId, postId, voteType),
    onSuccess: (post) => {
      if (post.channel_id) {
        queryClient.invalidateQueries({ 
          queryKey: [QUERY_KEYS.CHANNEL_POSTS, post.channel_id] 
        });
      }
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to vote on post');
    },
  });
}

export function useRemovePostVote() {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  return useMutation({
    mutationFn: ({ channelId, postId }: { channelId: string; postId: string }) =>
      channelService.removePostVote(channelId, postId),
    onSuccess: (post) => {
      if (post.channel_id) {
        queryClient.invalidateQueries({ 
          queryKey: [QUERY_KEYS.CHANNEL_POSTS, post.channel_id] 
        });
      }
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to remove vote');
    },
  });
}

// Comment mutations
export function useAddPostComment() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      channelId, 
      postId, 
      data 
    }: { 
      channelId: string; 
      postId: string; 
      data: { content: string; parentId?: string };
    }) => channelService.addPostComment(channelId, postId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.COMMENTS, variables.channelId, variables.postId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNEL_POSTS, variables.channelId] 
      });
      showSuccess('Comment added successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to add comment');
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      channelId, 
      postId, 
      commentId, 
      data 
    }: { 
      channelId: string; 
      postId: string; 
      commentId: string; 
      data: { content: string };
    }) => channelService.updateComment(channelId, postId, commentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.COMMENTS, variables.channelId, variables.postId] 
      });
      showSuccess('Comment updated successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update comment');
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      channelId, 
      postId, 
      commentId 
    }: { 
      channelId: string; 
      postId: string; 
      commentId: string;
    }) => channelService.deleteComment(channelId, postId, commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.COMMENTS, variables.channelId, variables.postId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNEL_POSTS, variables.channelId] 
      });
      showSuccess('Comment deleted successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to delete comment');
    },
  });
}

// File upload
export function useUploadFile() {
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      channelId, 
      file, 
      type, 
      onProgress 
    }: { 
      channelId: string; 
      file: File; 
      type: 'message' | 'post';
      onProgress?: (progress: number) => void;
    }) => channelService.uploadFile(channelId, file, type, onProgress),
    onSuccess: () => {
      showSuccess('File uploaded successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to upload file');
    },
  });
}

// Permissions
export function useUpdateChannelPermissions() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      channelId, 
      permissions 
    }: { 
      channelId: string; 
      permissions: Record<string, boolean>;
    }) => channelService.updateChannelPermissions(channelId, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CHANNEL, variables.channelId, 'permissions'] 
      });
      showSuccess('Permissions updated successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update permissions');
    },
  });
} 