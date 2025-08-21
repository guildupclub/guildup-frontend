// Analytics utility functions for tracking events
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}

// Google Tag Manager event tracking
export const trackGTMEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...parameters,
    });
  }
};

// Google Analytics 4 event tracking
export const trackGA4Event = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Facebook Pixel event tracking
export const trackFacebookEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

// Common conversion events for Google Ads
export const trackConversion = (conversionId: string, conversionLabel: string, value?: number) => {
  trackGTMEvent('conversion', {
    conversion_id: conversionId,
    conversion_label: conversionLabel,
    value: value,
  });
  
  trackGA4Event('conversion', {
    conversion_id: conversionId,
    conversion_label: conversionLabel,
    value: value,
  });
};

// Page view tracking
export const trackPageView = (pageTitle?: string, pageLocation?: string) => {
  trackGTMEvent('page_view', {
    page_title: pageTitle || document.title,
    page_location: pageLocation || window.location.href,
  });
  
  trackGA4Event('page_view', {
    page_title: pageTitle || document.title,
    page_location: pageLocation || window.location.href,
  });
};

// User engagement events
export const trackSignUp = (method: string = 'email') => {
  trackGTMEvent('sign_up', { method });
  trackGA4Event('sign_up', { method });
  trackFacebookEvent('CompleteRegistration', { method });
};

export const trackLogin = (method: string = 'email') => {
  trackGTMEvent('login', { method });
  trackGA4Event('login', { method });
  trackFacebookEvent('CompleteRegistration', { method });
};

export const trackPurchase = (value: number, currency: string = 'USD', transactionId?: string) => {
  trackGTMEvent('purchase', {
    value,
    currency,
    transaction_id: transactionId,
  });
  
  trackGA4Event('purchase', {
    value,
    currency,
    transaction_id: transactionId,
  });
  
  trackFacebookEvent('Purchase', {
    value,
    currency,
    content_ids: transactionId ? [transactionId] : undefined,
  });
};

export const trackAddToCart = (value: number, currency: string = 'USD', itemId?: string) => {
  trackGTMEvent('add_to_cart', {
    value,
    currency,
    item_id: itemId,
  });
  
  trackGA4Event('add_to_cart', {
    value,
    currency,
    item_id: itemId,
  });
  
  trackFacebookEvent('AddToCart', {
    value,
    currency,
    content_ids: itemId ? [itemId] : undefined,
  });
};

// Custom event tracking
export const trackCustomEvent = (
  eventName: string,
  parameters: Record<string, any> = {},
  platforms: ('gtm' | 'ga4' | 'facebook')[] = ['gtm', 'ga4']
) => {
  if (platforms.includes('gtm')) {
    trackGTMEvent(eventName, parameters);
  }
  
  if (platforms.includes('ga4')) {
    trackGA4Event(eventName, parameters);
  }
  
  if (platforms.includes('facebook')) {
    trackFacebookEvent(eventName, parameters);
  }
};

