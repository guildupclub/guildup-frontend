import posthog from 'posthog-js'
import { PostHog } from 'posthog-js'

// PostHog configuration
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_test_key'
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

// Initialize PostHog
export const initializePostHog = (enabled: boolean = true) => {
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog loaded successfully')
        }
      },
      opt_out_capturing_by_default: !enabled,
      capture_pageview: false, // We'll handle this manually for better control
      capture_pageleave: enabled,
      autocapture: enabled,
      disable_session_recording: !enabled,
    })
    
    if (!enabled) {
      posthog.opt_out_capturing()
    }
  }
}

// PostHog tracking functions
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.capture(eventName, properties)
  }
}

// Enhanced page view tracking with detailed metadata
export const trackPageView = (pageName?: string, additionalData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    const pageData = {
      page: pageName || window.location.pathname,
      page_title: document.title,
      page_url: window.location.href,
      page_referrer: document.referrer,
      page_search: window.location.search,
      page_hash: window.location.hash,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      user_agent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
      ...additionalData
    }
    
    posthog.capture('$pageview', pageData)
    
    // Also track custom page visit event with more details
    posthog.capture('page_visited', {
      page_name: getPageName(pageName || window.location.pathname),
      page_category: getPageCategory(pageName || window.location.pathname),
      visit_duration: 0,
      ...pageData
    })
  }
}

// Get friendly page names
export const getPageName = (pathname: string): string => {
  const pageNames: Record<string, string> = {
    '/': 'Home',
    '/profile': 'Profile',
    '/community': 'Community',
    '/feeds': 'Feeds',
    '/booking': 'Booking',
    '/creator-studio': 'Creator Studio',
    '/contact-us': 'Contact Us',
    '/feedback': 'Feedback',
    '/payments': 'Payments',
    '/post': 'Post Details',
    '/terms-conditions': 'Terms & Conditions',
    '/privacy-policy': 'Privacy Policy',
    '/no-community': 'No Community'
  }
  
  // Handle dynamic routes
  if (pathname.startsWith('/post/')) return 'Post Details'
  if (pathname.startsWith('/community/')) return 'Community Details'
  if (pathname.startsWith('/profile/')) return 'User Profile'
  if (pathname.startsWith('/booking/')) return 'Booking Details'
  
  return pageNames[pathname] || pathname
}

// Categorize pages for better analytics
export const getPageCategory = (pathname: string): string => {
  if (pathname === '/') return 'landing'
  if (pathname.startsWith('/profile')) return 'user_management'
  if (pathname.startsWith('/community') || pathname.startsWith('/feeds')) return 'social'
  if (pathname.startsWith('/booking') || pathname.startsWith('/payments')) return 'booking'
  if (pathname.startsWith('/creator-studio')) return 'content_creation'
  if (pathname.startsWith('/post')) return 'content_consumption'
  if (pathname.includes('terms') || pathname.includes('privacy')) return 'legal'
  if (pathname.includes('contact') || pathname.includes('feedback')) return 'support'
  
  return 'other'
}

export const trackButtonClick = (buttonName: string, location?: string, additionalData?: Record<string, any>) => {
  trackEvent('button_clicked', {
    button_name: buttonName,
    location: location,
    page_category: getPageCategory(location || window.location.pathname),
    ...additionalData
  })
}

export const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.identify(userId, userProperties)
  }
}

export const resetUser = () => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.reset()
  }
}

// Enable/disable PostHog based on consent
export const enablePostHog = () => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.opt_in_capturing()
  }
}

export const disablePostHog = () => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.opt_out_capturing()
  }
}

// Track page engagement metrics
export const trackPageEngagement = (action: string, element?: string, value?: number) => {
  trackEvent('page_engagement', {
    action,
    element,
    value,
    page: window.location.pathname,
    page_name: getPageName(window.location.pathname),
    page_category: getPageCategory(window.location.pathname),
    timestamp: new Date().toISOString()
  })
}

// Track page performance
export const trackPagePerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      trackEvent('page_performance', {
        page: window.location.pathname,
        page_name: getPageName(window.location.pathname),
        load_time: navigation.loadEventEnd - navigation.loadEventStart,
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        first_paint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        first_contentful_paint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        timestamp: new Date().toISOString()
      })
    }
  }
}

// Get PostHog instance
export const getPostHog = (): PostHog | null => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    return posthog
  }
  return null
}

export default posthog 