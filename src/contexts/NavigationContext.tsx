'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { NavigationContextType } from '@/types/api.types';
import { MAIN_TABS, COMMUNITY_SUB_TABS, ROUTES } from '@/utils/constants';
import { createCommunityParam } from '@/utils/helpers';

// Navigation state
interface NavigationState {
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
}

// Initial state
const initialState: NavigationState = {
  activeTab: 'feed',
  activeCommunity: null,
  activeChannel: null,
  communitySubTab: 'feed',
};

// Action types
type NavigationAction =
  | { type: 'SET_ACTIVE_TAB'; payload: 'feed' | 'explore' | 'community' | 'profile' }
  | { type: 'SET_ACTIVE_COMMUNITY'; payload: { id: string; name: string; image?: string } | null }
  | { type: 'SET_ACTIVE_CHANNEL'; payload: { id: string; name: string; type: 'chat' | 'post' } | null }
  | { type: 'SET_COMMUNITY_SUB_TAB'; payload: 'feed' | 'members' | 'courses' | 'profile' | 'channels' }
  | { type: 'CLEAR_NAVIGATION' };

// Reducer
function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.payload,
        // Clear community-specific state when leaving community tab
        ...(action.payload !== 'community' && {
          activeCommunity: null,
          activeChannel: null,
          communitySubTab: 'feed',
        }),
      };
    case 'SET_ACTIVE_COMMUNITY':
      return {
        ...state,
        activeCommunity: action.payload,
        activeChannel: null, // Clear channel when switching communities
        communitySubTab: 'feed', // Reset to feed tab
      };
    case 'SET_ACTIVE_CHANNEL':
      return {
        ...state,
        activeChannel: action.payload,
        communitySubTab: 'channels', // Auto-switch to channels tab
      };
    case 'SET_COMMUNITY_SUB_TAB':
      return {
        ...state,
        communitySubTab: action.payload,
        // Clear channel if not on channels tab
        ...(action.payload !== 'channels' && { activeChannel: null }),
      };
    case 'CLEAR_NAVIGATION':
      return initialState;
    default:
      return state;
  }
}

// Create context
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Provider component
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(navigationReducer, initialState);
  const router = useRouter();
  const pathname = usePathname();

  // Auto-detect active tab from pathname
  React.useEffect(() => {
    if (pathname.startsWith('/feed')) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'feed' });
    } else if (pathname.startsWith('/explore')) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'explore' });
    } else if (pathname.startsWith('/community')) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'community' });
    } else if (pathname.startsWith('/profile')) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'profile' });
    }
  }, [pathname]);

  const setActiveTab = useCallback((tab: 'feed' | 'explore' | 'community' | 'profile') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const setActiveCommunity = useCallback((community: { id: string; name: string; image?: string } | null) => {
    dispatch({ type: 'SET_ACTIVE_COMMUNITY', payload: community });
  }, []);

  const setActiveChannel = useCallback((channel: { id: string; name: string; type: 'chat' | 'post' } | null) => {
    dispatch({ type: 'SET_ACTIVE_CHANNEL', payload: channel });
  }, []);

  const setCommunitySubTab = useCallback((subTab: 'feed' | 'members' | 'courses' | 'profile' | 'channels') => {
    dispatch({ type: 'SET_COMMUNITY_SUB_TAB', payload: subTab });
  }, []);

  const navigateToFeed = useCallback(() => {
    router.push(ROUTES.FEED);
    setActiveTab('feed');
  }, [router, setActiveTab]);

  const navigateToExplore = useCallback(() => {
    router.push(ROUTES.EXPLORE);
    setActiveTab('explore');
  }, [router, setActiveTab]);

  const navigateToCommunity = useCallback((communityId: string, communityName: string) => {
    const communityParam = createCommunityParam(communityName, communityId);
    router.push(`${ROUTES.COMMUNITY}/${communityParam}`);
    setActiveTab('community');
    setActiveCommunity({ id: communityId, name: communityName });
  }, [router, setActiveTab, setActiveCommunity]);

  const navigateToProfile = useCallback(() => {
    router.push(ROUTES.PROFILE);
    setActiveTab('profile');
  }, [router, setActiveTab]);

  const navigateToChannel = useCallback((
    communityId: string,
    communityName: string,
    channelId: string,
    channelName: string
  ) => {
    const communityParam = createCommunityParam(communityName, communityId);
    router.push(`${ROUTES.COMMUNITY}/${communityParam}/channels/${channelId}`);
    setActiveTab('community');
    setActiveCommunity({ id: communityId, name: communityName });
    setActiveChannel({ id: channelId, name: channelName, type: 'chat' }); // Default to chat, can be updated
  }, [router, setActiveTab, setActiveCommunity, setActiveChannel]);

  const contextValue: NavigationContextType = React.useMemo(() => ({
    activeTab: state.activeTab,
    activeCommunity: state.activeCommunity,
    activeChannel: state.activeChannel,
    communitySubTab: state.communitySubTab,
    setActiveTab,
    setActiveCommunity,
    setActiveChannel,
    setCommunitySubTab,
    navigateToFeed,
    navigateToExplore,
    navigateToCommunity,
    navigateToProfile,
    navigateToChannel,
  }), [
    state.activeTab,
    state.activeCommunity,
    state.activeChannel,
    state.communitySubTab,
    setActiveTab,
    setActiveCommunity,
    setActiveChannel,
    setCommunitySubTab,
    navigateToFeed,
    navigateToExplore,
    navigateToCommunity,
    navigateToProfile,
    navigateToChannel,
  ]);

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

// Hook to use navigation context
export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
} 