import { usePostHog } from '@/contexts/PostHogProvider';
import { useCallback } from 'react';

export const useTracking = () => {
  const { 
    trackEvent, 
    trackButtonClick, 
    trackPageView, 
    trackPageEngagement, 
    identifyUser, 
    isEnabled 
  } = usePostHog();

  // Track button clicks with automatic location detection
  const trackClick = useCallback((
    buttonName: string, 
    additionalData?: Record<string, any>
  ) => {
    if (!isEnabled) return;
    
    const location = window.location.pathname;
    trackButtonClick(buttonName, location, {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...additionalData
    });
  }, [trackButtonClick, isEnabled]);

  // Track form submissions
  const trackFormSubmit = useCallback((
    formName: string, 
    formData?: Record<string, any>
  ) => {
    if (!isEnabled) return;
    
    trackEvent('form_submitted', {
      form_name: formName,
      timestamp: new Date().toISOString(),
      ...formData
    });
  }, [trackEvent, isEnabled]);

  // Track search actions
  const trackSearch = useCallback((
    searchTerm: string, 
    category?: string,
    resultsCount?: number
  ) => {
    if (!isEnabled) return;
    
    trackEvent('search_performed', {
      search_term: searchTerm,
      category: category,
      results_count: resultsCount,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent, isEnabled]);

  // Track navigation events
  const trackNavigation = useCallback((
    from: string,
    to: string,
    method: 'click' | 'programmatic' = 'click'
  ) => {
    if (!isEnabled) return;
    
    trackEvent('navigation', {
      from_page: from,
      to_page: to,
      navigation_method: method,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent, isEnabled]);

  // Track user engagement actions
  const trackEngagement = useCallback((
    action: string,
    target: string,
    value?: number | string
  ) => {
    if (!isEnabled) return;
    
    trackPageEngagement(action, target, typeof value === 'number' ? value : undefined);
  }, [trackPageEngagement, isEnabled]);

  // Track errors
  const trackError = useCallback((
    errorType: string,
    errorMessage: string,
    errorStack?: string
  ) => {
    if (!isEnabled) return;
    
    trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      error_stack: errorStack,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent, isEnabled]);

  // Track custom events
  const trackCustomEvent = useCallback((
    eventName: string,
    properties?: Record<string, any>
  ) => {
    if (!isEnabled) return;
    
    trackEvent(eventName, {
      timestamp: new Date().toISOString(),
      ...properties
    });
  }, [trackEvent, isEnabled]);

  // Track content interactions
  const trackContentInteraction = useCallback((
    contentType: 'post' | 'comment' | 'video' | 'image' | 'document',
    action: 'view' | 'like' | 'share' | 'download' | 'comment',
    contentId: string,
    additionalData?: Record<string, any>
  ) => {
    if (!isEnabled) return;
    
    trackEvent('content_interaction', {
      content_type: contentType,
      action: action,
      content_id: contentId,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }, [trackEvent, isEnabled]);

  // Track user actions specific to your app
  const trackUserAction = useCallback((
    action: 'join_community' | 'create_post' | 'book_session' | 'make_payment' | 'send_message' | 'free_booking_confirmed' | 'paid_booking_confirmed' | 'paid_booking_confirmed_v2' | 'paid_booking_confirmed_v3' | 'user_registered' | 'user_signed_in' | 'user_signed_up'| 'bank_details_saved' |'signup_completed'  ,
    details?: Record<string, any>
  ) => {
    if (!isEnabled) return;
    
    trackEvent('user_action', {
      action: action,
      timestamp: new Date().toISOString(),
      ...details
    });
  }, [trackEvent, isEnabled]);

  // Track feature usage
  const trackFeatureUsage = useCallback((
    featureName: string,
    action: 'start' | 'complete' | 'abandon',
    duration?: number
  ) => {
    if (!isEnabled) return;
    
    trackEvent('feature_usage', {
      feature_name: featureName,
      action: action,
      duration: duration,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent, isEnabled]);

  return {
    // Basic tracking
    trackClick,
    trackFormSubmit,
    trackSearch,
    trackNavigation,
    trackEngagement,
    trackError,
    trackCustomEvent,
    
    // Advanced tracking
    trackContentInteraction,
    trackUserAction,
    trackFeatureUsage,
    trackPageView,
    identifyUser,
    
    // State
    isEnabled
  };
}; 