'use client';
import React, { useEffect, useRef, useCallback } from 'react';
import { useTracking } from '@/hooks/useTracking';

interface PageTrackerProps {
  pageName?: string;
  pageCategory?: string;
  metadata?: Record<string, any>;
  trackScrollDepth?: boolean;
  trackTimeOnPage?: boolean;
  trackClicks?: boolean;
}

export const PageTracker: React.FC<PageTrackerProps> = ({
  pageName,
  pageCategory,
  metadata = {},
  trackScrollDepth = true,
  trackTimeOnPage = true,
  trackClicks = true
}) => {
  const { trackCustomEvent, trackEngagement, isEnabled } = useTracking();
  const startTime = useRef<number>(Date.now());
  const scrollDepthTracked = useRef<Set<number>>(new Set());
  const timeTracked = useRef<Set<number>>(new Set());

  // Memoize the metadata to prevent unnecessary re-renders
  const stableMetadata = useRef(metadata);
  useEffect(() => {
    stableMetadata.current = metadata;
  });

  // Track page entry - use useCallback to prevent re-renders
  const trackPageEntry = useCallback(() => {
    if (!isEnabled) return;

    trackCustomEvent('page_tracker_initialized', {
      page_name: pageName,
      page_category: pageCategory,
      ...stableMetadata.current
    });
    
    startTime.current = Date.now();
  }, [isEnabled, pageName, pageCategory, trackCustomEvent]);

  useEffect(() => {
    trackPageEntry();
  }, [trackPageEntry]);

  // Track time spent on page - optimize with useCallback
  useEffect(() => {
    if (!isEnabled || !trackTimeOnPage) return;

    const intervals = [10, 30, 60, 120, 300]; // seconds
    
    const timeTrackers = intervals.map(seconds => 
      setTimeout(() => {
        if (!timeTracked.current.has(seconds)) {
          trackEngagement('time_on_page', `${seconds}s`, seconds);
          timeTracked.current.add(seconds);
        }
      }, seconds * 1000)
    );

    return () => {
      timeTrackers.forEach(clearTimeout);
    };
  }, [isEnabled, trackTimeOnPage, trackEngagement]);

  // Track scroll depth - memoize handler
  const handleScroll = useCallback(() => {
    if (!isEnabled || !trackScrollDepth) return;

    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    
    const milestones = [25, 50, 75, 90, 100];
    milestones.forEach(milestone => {
      if (scrollPercent >= milestone && !scrollDepthTracked.current.has(milestone)) {
        trackEngagement('scroll_milestone', `${milestone}%`, milestone);
        scrollDepthTracked.current.add(milestone);
      }
    });
  }, [isEnabled, trackScrollDepth, trackEngagement]);

  useEffect(() => {
    if (!isEnabled || !trackScrollDepth) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, isEnabled, trackScrollDepth]);

  // Track clicks on the page - memoize handler
  const handleClick = useCallback((event: MouseEvent) => {
    if (!isEnabled || !trackClicks) return;

    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const className = target.className;
    const id = target.id;
    const textContent = target.textContent?.slice(0, 50) || '';

    trackEngagement('element_clicked', tagName, 1, {
      element_class: className,
      element_id: id,
      element_text: textContent,
      page_name: pageName,
      page_category: pageCategory
    });
  }, [isEnabled, trackClicks, trackEngagement, pageName, pageCategory]);

  useEffect(() => {
    if (!isEnabled || !trackClicks) return;

    document.addEventListener('click', handleClick, { passive: true });
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick, isEnabled, trackClicks]);

  // Track page exit - memoize handler
  const handleBeforeUnload = useCallback(() => {
    if (!isEnabled) return;

    const timeSpent = Date.now() - startTime.current;
    trackCustomEvent('page_exit_tracker', {
      page_name: pageName,
      page_category: pageCategory,
      time_spent: timeSpent,
      scroll_depth_achieved: Math.max(...Array.from(scrollDepthTracked.current), 0),
      ...stableMetadata.current
    });
  }, [isEnabled, pageName, pageCategory, trackCustomEvent]);

  useEffect(() => {
    if (!isEnabled) return;

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleBeforeUnload, isEnabled]);

  return null; // This component doesn't render anything
};

// Hook for easy page tracking - add useCallback optimization
export const usePageTracker = (
  pageName?: string,
  pageCategory?: string,
  metadata?: Record<string, any>
) => {
  const { trackCustomEvent, isEnabled } = useTracking();

  // Memoize the tracking call
  const trackPageHook = useCallback(() => {
    if (!isEnabled) return;

    trackCustomEvent('page_hook_tracker', {
      page_name: pageName,
      page_category: pageCategory,
      ...metadata
    });
  }, [isEnabled, pageName, pageCategory, metadata, trackCustomEvent]);

  useEffect(() => {
    trackPageHook();
  }, [trackPageHook]);

  return { isTracking: isEnabled };
}; 