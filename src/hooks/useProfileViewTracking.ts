import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTracking } from './useTracking';
import axios from 'axios';

interface ProfileViewStats { 
  total_views: number;
  unique_views: number;
  today_views: number;
  today_unique_views: number;
  last_7_days_views: number;
  last_7_days_unique_views: number;
  last_viewed: string | null;
}

interface UseProfileViewTrackingOptions {
  communityId: string;
  communityName?: string;
  autoTrack?: boolean;
  trackingDelay?: number;
}

export const useProfileViewTracking = ({
  communityId,
  communityName,
  autoTrack = true,
  trackingDelay = 2000, // 2 seconds delay to ensure genuine page visit
}: UseProfileViewTrackingOptions) => {
  const { data: session } = useSession();
  const { trackCustomEvent, trackPageView, identifyUser, isEnabled } = useTracking();
  
  const [stats, setStats] = useState<ProfileViewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hasTracked = useRef(false);
  const trackingTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Generate unique session identifier
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    let sessionId = localStorage.getItem('guildup_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guildup_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Get user fingerprint for unique identification
  const getUserFingerprint = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('GuildUp fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join('|');
    
    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `fp_${Math.abs(hash)}`;
  }, []);

  // Track profile view with backend
  const trackProfileView = useCallback(async (immediate = false) => {
    if (!communityId || hasTracked.current) return;
    
    const executeTracking = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const sessionId = getSessionId();
        const fingerprint = getUserFingerprint();
        const userId = session?.user?._id || null;
        
        // Track with PostHog first
        if (isEnabled) {
          trackCustomEvent('profile_view', {
            community_id: communityId,
            community_name: communityName || 'Unknown',
            user_id: userId,
            session_id: sessionId,
            fingerprint: fingerprint,
            is_authenticated: !!userId,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            referrer: document.referrer,
          });
          
          // Enhanced page view tracking for profiles
          trackPageView(window.location.pathname, {
            page_type: 'community_profile',
            community_id: communityId,
            community_name: communityName,
            profile_owner: 'community',
          });
        }
        
        // Track with backend
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/track-profile-view`,
          {
            communityId,
            userId,
            sessionId,
            userAgent: navigator.userAgent,
            ipAddress: null, // Will be detected by backend
            fingerprint,
            timestamp: new Date().toISOString(),
            pageUrl: window.location.href,
            referrer: document.referrer,
          }
        );
        
        if (response.data.r === 's') {
          setStats(response.data.data.stats);
          hasTracked.current = true;
          
          // Track successful view recording
          if (isEnabled) {
            trackCustomEvent('profile_view_recorded', {
              community_id: communityId,
              is_unique_view: response.data.data.isUniqueView,
              total_views: response.data.data.stats.total_views,
              unique_views: response.data.data.stats.unique_views,
            });
          }
        }
        
      } catch (err: any) {
        const errorMessage = err.response?.data?.e || err.message || 'Failed to track profile view';
        setError(errorMessage);
        console.error('Profile view tracking error:', err);
        
        // Track error with PostHog
        if (isEnabled) {
          trackCustomEvent('profile_view_error', {
            community_id: communityId,
            error: errorMessage,
            timestamp: new Date().toISOString(),
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (immediate) {
      await executeTracking();
    } else {
      // Clear any existing timeout
      if (trackingTimeout.current) {
        clearTimeout(trackingTimeout.current);
      }
      
      // Set delay to ensure genuine page visit
      trackingTimeout.current = setTimeout(executeTracking, trackingDelay);
    }
  }, [
    communityId,
    communityName,
    session,
    trackingDelay,
    isEnabled,
    trackCustomEvent,
    trackPageView,
    getSessionId,
    getUserFingerprint,
  ]);

  // Get profile view stats
  const getProfileStats = useCallback(async () => {
    if (!communityId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/profile-view-stats`,
        { communityId }
      );
      
      if (response.data.r === 's') {
        setStats(response.data.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.e || err.message || 'Failed to fetch profile stats';
      setError(errorMessage);
      console.error('Profile stats fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  // Auto-track on mount if enabled
  useEffect(() => {
    if (autoTrack && communityId && !hasTracked.current) {
      trackProfileView();
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (trackingTimeout.current) {
        clearTimeout(trackingTimeout.current);
      }
    };
  }, [autoTrack, communityId, trackProfileView]);

  // Identify user for PostHog when session changes
  useEffect(() => {
    if (session?.user && isEnabled) {
      identifyUser(session.user._id, {
        email: session.user.email,
        name: session.user.name,
        is_creator: session.user.is_creator,
        viewing_community: communityId,
      });
    }
  }, [session, isEnabled, identifyUser, communityId]);

  // Reset tracking state when community changes
  useEffect(() => {
    hasTracked.current = false;
    setStats(null);
    setError(null);
  }, [communityId]);

  return {
    // State
    stats,
    isLoading,
    error,
    hasTracked: hasTracked.current,
    
    // Actions
    trackProfileView,
    getProfileStats,
    
    // Helpers
    isTrackingEnabled: isEnabled,
    userId: session?.user?._id || null,
    sessionId: getSessionId(),
  };
}; 