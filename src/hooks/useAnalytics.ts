import { useCallback } from 'react';
import {
  trackGTMEvent,
  trackGA4Event,
  trackFacebookEvent,
  trackConversion,
  trackPageView,
  trackSignUp,
  trackLogin,
  trackPurchase,
  trackAddToCart,
  trackCustomEvent,
} from '@/lib/analytics';
import { attachAttribution } from '@/lib/attribution';
import { GOOGLE_ADS_CONVERSIONS } from '@/config/googleAds';

export const useAnalytics = () => {
  const trackEvent = useCallback((
    eventName: string,
    parameters: Record<string, any> = {},
    platforms: ('gtm' | 'ga4' | 'facebook')[] = ['gtm', 'ga4']
  ) => {
    const withAttr = attachAttribution(parameters);
    trackCustomEvent(eventName, withAttr, platforms);
  }, []);

  const trackPageViewEvent = useCallback((pageTitle?: string, pageLocation?: string) => {
    const params = attachAttribution({ pageTitle, pageLocation });
    trackPageView(params.pageTitle, params.pageLocation);
  }, []);

  const trackSignUpEvent = useCallback((method: string = 'email') => {
    trackSignUp(method);
  }, []);

  const trackLoginEvent = useCallback((method: string = 'email') => {
    trackLogin(method);
  }, []);

  const trackPurchaseEvent = useCallback((
    value: number,
    currency: string = 'INR',
    transactionId?: string
  ) => {
    trackPurchase(value, currency, transactionId);
  }, []);

  const trackAddToCartEvent = useCallback((
    value: number,
    currency: string = 'INR',
    itemId?: string
  ) => {
    trackAddToCart(value, currency, itemId);
  }, []);

  const trackConversionEvent = useCallback((
    conversionId: string,
    conversionLabel: string,
    value?: number
  ) => {
    const params = attachAttribution({ conversionId, conversionLabel, value });
    trackConversion(params.conversionId, params.conversionLabel, params.value);
  }, []);

  // Google Ads specific tracking by explicit IDs
  const trackGoogleAdsConversion = useCallback((
    conversionId: string,
    conversionLabel: string,
    value?: number
  ) => {
    const params = attachAttribution({ conversionId, conversionLabel, value });
    // Track to GTM and GA4 for Google Ads; attach attribution context
    trackGTMEvent('conversion', params);
    trackGA4Event('conversion', params);
  }, []);

  // Google Ads tracking by campaign key
  const trackCampaignConversion = useCallback((
    campaignKey: string,
    value?: number
  ) => {
    const config = GOOGLE_ADS_CONVERSIONS[campaignKey];
    if (!config) {
      console.warn(`[analytics] Unknown campaign key: ${campaignKey}`);
      return;
    }
    trackGoogleAdsConversion(config.conversionId, config.conversionLabel, value ?? config.defaultValue);
  }, [trackGoogleAdsConversion]);

  // Landing page specific events
  const trackLandingPageView = useCallback((pageName: string) => {
    trackEvent('landing_page_view', {
      page_name: pageName,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent]);

  const trackLeadGeneration = useCallback((source: string, formType: string) => {
    trackEvent('lead_generation', {
      source,
      form_type: formType,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent]);

  const trackButtonClick = useCallback((buttonName: string, pageLocation: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      page_location: pageLocation,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent]);

  const trackFormSubmission = useCallback((formName: string, formType: string) => {
    trackEvent('form_submission', {
      form_name: formName,
      form_type: formType,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView: trackPageViewEvent,
    trackSignUp: trackSignUpEvent,
    trackLogin: trackLoginEvent,
    trackPurchase: trackPurchaseEvent,
    trackAddToCart: trackAddToCartEvent,
    trackConversion: trackConversionEvent,
    trackGoogleAdsConversion,
    trackCampaignConversion,
    trackLandingPageView,
    trackLeadGeneration,
    trackButtonClick,
    trackFormSubmission,
  };
};
