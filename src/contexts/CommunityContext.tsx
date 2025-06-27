'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  CommunityContextType, 
  Community, 
  CommunityMember, 
  CreateCommunityRequest,
  UpdateCommunityRequest,
  JoinCommunityRequest
} from '@/types/community.types';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from '@/services/apiClient';
import { useToast } from './ToastContext';
import { QUERY_KEYS, API_ENDPOINTS } from '@/utils/constants';

// Community state
interface CommunityState {
  selectedCommunity: Community | null;
  currentMembers: CommunityMember[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: CommunityState = {
  selectedCommunity: null,
  currentMembers: [],
  isLoading: false,
  error: null,
};

// Action types
type CommunityAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_COMMUNITY'; payload: Community | null }
  | { type: 'SET_MEMBERS'; payload: CommunityMember[] }
  | { type: 'ADD_MEMBER'; payload: CommunityMember }
  | { type: 'REMOVE_MEMBER'; payload: string }
  | { type: 'UPDATE_MEMBER'; payload: CommunityMember }
  | { type: 'RESET' };

// Reducer
function communityReducer(state: CommunityState, action: CommunityAction): CommunityState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SELECTED_COMMUNITY':
      return { ...state, selectedCommunity: action.payload };
    case 'SET_MEMBERS':
      return { ...state, currentMembers: action.payload };
    case 'ADD_MEMBER':
      return {
        ...state,
        currentMembers: [...state.currentMembers, action.payload],
      };
    case 'REMOVE_MEMBER':
      return {
        ...state,
        currentMembers: state.currentMembers.filter(member => member._id !== action.payload),
      };
    case 'UPDATE_MEMBER':
      return {
        ...state,
        currentMembers: state.currentMembers.map(member =>
          member._id === action.payload._id ? action.payload : member
        ),
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Create context
const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

// Provider component
export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(communityReducer, initialState);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // Fetch community by ID
  const fetchCommunity = useCallback(async (communityId: string): Promise<Community> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.get<ApiResponse<Community>>(
        `${API_ENDPOINTS.COMMUNITIES}/${communityId}`
      );

      if (response.r === 'e') {
        throw new Error(response.error || 'Failed to fetch community');
      }
      if (!response.data) {
        throw new Error('Community not found');
      }

      return response.data as Community;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch community';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Fetch community members
  const fetchCommunityMembers = useCallback(async (communityId: string): Promise<CommunityMember[]> => {
    try {
      const response = await apiClient.get<ApiResponse<CommunityMember[]>>(
        `${API_ENDPOINTS.COMMUNITIES}/${communityId}/members`
      );

      if (response.r === 'e') {
        throw new Error(response.error || 'Failed to fetch members');
      }
      if (!response.data) {
        throw new Error('Members not found');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch members';
      showError(errorMessage);
      throw error;
    }
  }, [showError]);

  // Create community mutation
  const createCommunityMutation = useMutation({
    mutationFn: async (data: CreateCommunityRequest): Promise<Community> => {
      const response = await apiClient.post<ApiResponse<Community>>(
        API_ENDPOINTS.COMMUNITIES,
        data
      );

      if (response.r === 'e') {
        throw new Error(response.error || 'Failed to create community');
      }

      return response.data as Community;
    },
    onSuccess: (community: Community) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITIES] });
      dispatch({ type: 'SET_SELECTED_COMMUNITY', payload: community });
      showSuccess('Community created successfully!');
    },
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create community';
      showError(errorMessage);
    },
  });

  // Update community mutation
  const updateCommunityMutation = useMutation({
    mutationFn: async ({ communityId, data }: { communityId: string; data: UpdateCommunityRequest }): Promise<Community> => {
      const response = await apiClient.put<ApiResponse<Community>>(
        `${API_ENDPOINTS.COMMUNITIES}/${communityId}`,
        data
      );

      if (response.r === 'e') {
        throw new Error(response.error || 'Failed to update community');
      }

      return response.data as Community;
    },
    onSuccess: (community: Community) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITIES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITY, community._id] });
      dispatch({ type: 'SET_SELECTED_COMMUNITY', payload: community });
      showSuccess('Community updated successfully!');
    },
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update community';
      showError(errorMessage);
    },
  });

  // Join community mutation
  const joinCommunityMutation = useMutation({
    mutationFn: async (data: JoinCommunityRequest): Promise<void> => {
      const response = await apiClient.post<ApiResponse<void>>(
        `${API_ENDPOINTS.COMMUNITIES}/${data.communityId}/join`,
        data
      );

      if (response.r === 'e') {
        throw new Error(response.error || 'Failed to join community');
      }
    },
    onSuccess: (_: any, variables: JoinCommunityRequest) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITY, variables.communityId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITY_MEMBERS, variables.communityId] });
      showSuccess('Successfully joined community!');
    },
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join community';
      showError(errorMessage);
    },
  });

  // Leave community mutation
  const leaveCommunityMutation = useMutation({
    mutationFn: async (communityId: string): Promise<void> => {
      const response = await apiClient.post<ApiResponse<void>>(
        `${API_ENDPOINTS.COMMUNITIES}/${communityId}/leave`
      );

        if (response.r === 'e') {
        throw new Error(response.error || 'Failed to leave community');
      }
    },
    onSuccess: (_: any, communityId: string) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITY, communityId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMUNITY_MEMBERS, communityId] });
      showSuccess('Successfully left community');
    },
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to leave community';
      showError(errorMessage);
    },
  });

  // Context methods
  const selectCommunity = useCallback((community: Community | null) => {
    dispatch({ type: 'SET_SELECTED_COMMUNITY', payload: community });
  }, []);

  const setMembers = useCallback((members: CommunityMember[]) => {
    dispatch({ type: 'SET_MEMBERS', payload: members });
  }, []);

  const addMember = useCallback((member: CommunityMember) => {
    dispatch({ type: 'ADD_MEMBER', payload: member });
  }, []);

  const removeMember = useCallback((memberId: string) => {
    dispatch({ type: 'REMOVE_MEMBER', payload: memberId });
  }, []);

  const updateMember = useCallback((member: CommunityMember) => {
    dispatch({ type: 'UPDATE_MEMBER', payload: member });
  }, []);

  const createCommunity = useCallback((data: CreateCommunityRequest) => {
    return createCommunityMutation.mutateAsync(data);
  }, [createCommunityMutation]);

  const updateCommunity = useCallback((communityId: string, data: UpdateCommunityRequest) => {
    return updateCommunityMutation.mutateAsync({ communityId, data });
  }, [updateCommunityMutation]);

  const joinCommunity = useCallback((data: JoinCommunityRequest) => {
    return joinCommunityMutation.mutateAsync(data);
  }, [joinCommunityMutation]);

  const leaveCommunity = useCallback((communityId: string) => {
    return leaveCommunityMutation.mutateAsync(communityId);
  }, [leaveCommunityMutation]);

  const resetCommunityState = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const contextValue: CommunityContextType = React.useMemo(() => ({
    // State
    selectedCommunity: state.selectedCommunity,
    currentMembers: state.currentMembers,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    selectCommunity,
    setMembers,
    addMember,
    removeMember,
    updateMember,
    fetchCommunity,
    fetchCommunityMembers,
    createCommunity,
    updateCommunity,
    joinCommunity,
    leaveCommunity,
    resetCommunityState,

    // Mutation states
    isCreating: createCommunityMutation.isPending,
    isUpdating: updateCommunityMutation.isPending,
    isJoining: joinCommunityMutation.isPending,
    isLeaving: leaveCommunityMutation.isPending,
  }), [
    state.selectedCommunity,
    state.currentMembers,
    state.isLoading,
    state.error,
    selectCommunity,
    setMembers,
    addMember,
    removeMember,
    updateMember,
    fetchCommunity,
    fetchCommunityMembers,
    createCommunity,
    updateCommunity,
    joinCommunity,
    leaveCommunity,
    resetCommunityState,
    createCommunityMutation.isPending,
    updateCommunityMutation.isPending,
    joinCommunityMutation.isPending,
    leaveCommunityMutation.isPending,
  ]);

  return (
    <CommunityContext.Provider value={contextValue}>
      {children}
    </CommunityContext.Provider>
  );
}

// Hook to use community context
export function useCommunity(): CommunityContextType {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
} 