'use client';
import React, { createContext, useContext, useEffect, useRef, ReactNode, useCallback, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCookieConsent } from './CookieConsentContext';
import { 
  initializePostHog, 
  enablePostHog, 
  disablePostHog, 
  trackPageView,
  trackEvent,
  trackButtonClick,
  trackPageEngagement,
  trackPagePerformance,
  identifyUser,
  resetUser,
  getPageName,
  getPageCategory,
  getPostHog
} from '../lib/posthog';

interface PostHogContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackPageView: (pageName?: string, additionalData?: Record<string, any>) => void;
  trackButtonClick: (buttonName: string, location?: string, additionalData?: Record<string, any>) => void;
  trackPageEngagement: (action: string, element?: string, value?: number) => void;
  identifyUser: (userId: string, userProperties?: Record<string, any>) => void;
  resetUser: () => void;
  isEnabled: boolean;
}

const PostHogContext = createContext<PostHogContextType | undefined>(undefined);

export function PostHogProvider({ children }: { children: ReactNode }) {
  const { preferences, hasConsented } = useCookieConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageStartTime = useRef<number>(Date.now());
  const previousPath = useRef<string>('');

  // Memoize enabled state to prevent unnecessary re-renders
  const isEnabled = useMemo(() => {
    return preferences.analytics && hasConsented;
  }, [preferences.analytics, hasConsented]);

  // Initialize PostHog only once
  useEffect(() => {
    initializePostHog(preferences.analytics);
  }, []); // Remove preferences.analytics from dependency

  // Handle consent changes with useCallback
  const handleConsentChange = useCallback(() => {
    if (!hasConsented) return;

    if (preferences.analytics) {
      enablePostHog();
    } else {
      disablePostHog();
    }
  }, [preferences.analytics, hasConsented]);

  useEffect(() => {
    handleConsentChange();
  }, [handleConsentChange]);

  // Enhanced page tracking with performance metrics - use useCallback
  const handlePageTracking = useCallback(() => {
    if (!isEnabled) return;

    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    
    // Track page exit time if this is not the first page
    if (previousPath.current && previousPath.current !== pathname) {
      const timeSpent = Date.now() - pageStartTime.current;
      trackEvent('page_exit', {
        page: previousPath.current,
        page_name: getPageName(previousPath.current),
        page_category: getPageCategory(previousPath.current),
        time_spent: timeSpent,
        next_page: pathname,
        timestamp: new Date().toISOString()
      });
    }

    // Track new page view
    trackPageView(currentUrl, {
      page_name: getPageName(pathname),
      page_category: getPageCategory(pathname),
      search_params: searchParams.toString(),
      previous_page: previousPath.current || 'direct',
      session_start: !previousPath.current
    });

    // Track page performance after a short delay
    const performanceTimeout = setTimeout(() => {
      trackPagePerformance();
    }, 1000);

    // Update refs
    pageStartTime.current = Date.now();
    previousPath.current = pathname;

    // Cleanup timeout
    return () => clearTimeout(performanceTimeout);
  }, [pathname, searchParams, isEnabled]);

  useEffect(() => {
    const cleanup = handlePageTracking();
    return cleanup;
  }, [handlePageTracking]);

  // Track page visibility changes - memoize handler
  const handleVisibilityChange = useCallback(() => {
    if (!isEnabled) return;
    
    trackPageEngagement(
      document.hidden ? 'page_hidden' : 'page_visible',
      'window',
      Date.now() - pageStartTime.current
    );
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isEnabled, handleVisibilityChange]);

  // Track scroll engagement - memoize handler
  const handleScroll = useCallback(() => {
    if (!isEnabled) return;

    const scrollPercentage = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    
    if (scrollPercentage > 25 && scrollPercentage % 25 === 0) {
      trackPageEngagement('scroll_depth', `${scrollPercentage}%`, scrollPercentage);
    }
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;

    let scrollTimeout: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isEnabled, handleScroll]);

  // Memoize all context functions to prevent re-renders
  const contextValue: PostHogContextType = useMemo(() => ({
    trackEvent: (eventName: string, properties?: Record<string, any>) => {
      if (!isEnabled) return;
      trackEvent(eventName, {
        page: pathname,
        page_name: getPageName(pathname),
        page_category: getPageCategory(pathname),
        ...properties
      });
    },
    trackPageView: (pageName?: string, additionalData?: Record<string, any>) => {
      if (!isEnabled) return;
      trackPageView(pageName, additionalData);
    },
    trackButtonClick: (buttonName: string, location?: string, additionalData?: Record<string, any>) => {
      if (!isEnabled) return;
      trackButtonClick(buttonName, location || pathname, additionalData);
    },
    trackPageEngagement: (action: string, element?: string, value?: number) => {
      if (!isEnabled) return;
      trackPageEngagement(action, element, value);
    },
    identifyUser: (userId: string, userProperties?: Record<string, any>) => {
      if (!isEnabled) return;
      identifyUser(userId, userProperties);
    },
    resetUser: () => {
      resetUser();
    },
    isEnabled,
  }), [isEnabled, pathname]); // Only depend on isEnabled and pathname

  return (
    <PostHogContext.Provider value={contextValue}>
      {children}
    </PostHogContext.Provider>
  );
}

export const usePostHog = () => {
  const context = useContext(PostHogContext);
  if (context === undefined) {
    throw new Error('usePostHog must be used within a PostHogProvider');
  }
  return context;
};

// Hook for automatic button tracking - memoize the returned function
export const useTrackClick = () => {
  const { trackButtonClick, isEnabled } = usePostHog();
  
  return useCallback((buttonName: string, location?: string, additionalData?: Record<string, any>) => {
    if (isEnabled) {
      trackButtonClick(buttonName, location, additionalData);
    }
  }, [trackButtonClick, isEnabled]);
}; 