'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentContextType {
  showConsent: boolean;
  preferences: CookiePreferences;
  hasConsented: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  acceptSelected: (categories: string[]) => void;
  closeBanner: () => void;
  updatePreferences: (prefs: Partial<CookiePreferences>) => void;
  getAllCookies: () => Record<string, string>;
  deleteCookie: (name: string) => void;
  getCookie: (name: string) => string | null;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const CONSENT_COOKIE_NAME = 'cookie-consent';
const PREFERENCES_COOKIE_NAME = 'cookie-preferences';

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  // Cookie utility functions
  const setCookie = (name: string, value: string, days: number = 365) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  };

  const getAllCookies = (): Record<string, string> => {
    if (typeof document === 'undefined') return {};
    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  };

  // Send cookie data to Node.js backend
  const sendCookieDataToBackend = async (preferences: CookiePreferences, consentType: string = 'accept_all') => {
    try {
      const allCookies = getAllCookies();
      const userInfo = {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: new Date().toISOString(),
        language: typeof navigator !== 'undefined' ? navigator.language : '',
        platform: typeof navigator !== 'undefined' ? navigator.platform : '',
        screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
      };

              const payload = {
          cookies: allCookies,
          preferences,
          userInfo,
          consentType,
          timestamp: new Date().toISOString(),
        };

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${backendUrl}/v1/user/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn('Failed to send cookie data to backend:', response.statusText);
      } else {
        const result = await response.json();
        console.log('Cookie data sent successfully:', result);
      }
    } catch (error) {
      console.error('Error sending cookie data to backend:', error);
    }
  };

  // Initialize consent state
  useEffect(() => {
    const consentStatus = getCookie(CONSENT_COOKIE_NAME);
    const savedPreferences = getCookie(PREFERENCES_COOKIE_NAME);

    if (consentStatus) {
      setHasConsented(true);
      setShowConsent(false);
      
      if (savedPreferences) {
        try {
          const parsedPrefs = JSON.parse(savedPreferences);
          setPreferences({ ...preferences, ...parsedPrefs });
        } catch (error) {
          console.error('Error parsing cookie preferences:', error);
        }
      }
    } else {
      // Show consent banner after a short delay
      setTimeout(() => setShowConsent(true), 1000);
    }
  }, []);

  // Apply cookie preferences
  useEffect(() => {
    if (hasConsented) {
      // Handle analytics cookies
      if (preferences.analytics) {
        // Enable Google Analytics or other analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('consent', 'update', {
            analytics_storage: 'granted'
          });
        }
      } else {
        // Disable analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('consent', 'update', {
            analytics_storage: 'denied'
          });
        }
      }

      // Handle marketing cookies
      if (preferences.marketing) {
        // Enable marketing/advertising cookies
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted'
          });
        }
      } else {
        // Disable marketing cookies
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('consent', 'update', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
        }
      }
    }
  }, [preferences, hasConsented]);

  const acceptAll = async () => {
    const allAcceptedPrefs: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    
    // Send cookie data to backend
    await sendCookieDataToBackend(allAcceptedPrefs);
    
    setPreferences(allAcceptedPrefs);
    setHasConsented(true);
    setShowConsent(false);
    setCookie(CONSENT_COOKIE_NAME, 'accepted', 365);
    setCookie(PREFERENCES_COOKIE_NAME, JSON.stringify(allAcceptedPrefs), 365);
  };

  const rejectAll = async () => {
    const rejectedPrefs: CookiePreferences = {
      necessary: true, // Always required
      functional: false,
      analytics: false,
      marketing: false,
    };
    
    // Send cookie data to backend
    await sendCookieDataToBackend(rejectedPrefs, 'reject_all');
    
    setPreferences(rejectedPrefs);
    setHasConsented(true);
    setShowConsent(false);
    setCookie(CONSENT_COOKIE_NAME, 'rejected', 365);
    setCookie(PREFERENCES_COOKIE_NAME, JSON.stringify(rejectedPrefs), 365);

    // Delete non-essential cookies
    const allCookies = getAllCookies();
    Object.keys(allCookies).forEach(cookieName => {
      if (!isEssentialCookie(cookieName)) {
        deleteCookie(cookieName);
      }
    });
  };

  const acceptSelected = async (categories: string[]) => {
    const selectedPrefs: CookiePreferences = {
      necessary: true, // Always required
      functional: categories.includes('functional'),
      analytics: categories.includes('analytics'),
      marketing: categories.includes('marketing'),
    };
    
    // Send cookie data to backend
    await sendCookieDataToBackend(selectedPrefs, 'custom');
    
    setPreferences(selectedPrefs);
    setHasConsented(true);
    setShowConsent(false);
    setCookie(CONSENT_COOKIE_NAME, 'custom', 365);
    setCookie(PREFERENCES_COOKIE_NAME, JSON.stringify(selectedPrefs), 365);

    // Delete cookies for rejected categories
    const allCookies = getAllCookies();
    Object.keys(allCookies).forEach(cookieName => {
      if (!isAllowedCookie(cookieName, selectedPrefs)) {
        deleteCookie(cookieName);
      }
    });
  };

  const closeBanner = () => {
    setShowConsent(false);
  };

  const updatePreferences = (prefs: Partial<CookiePreferences>) => {
    const updatedPrefs = { ...preferences, ...prefs };
    setPreferences(updatedPrefs);
    setCookie(PREFERENCES_COOKIE_NAME, JSON.stringify(updatedPrefs), 365);
  };

  // Helper function to check if a cookie is essential
  const isEssentialCookie = (cookieName: string): boolean => {
    const essentialCookies = [
      'cookie-consent',
      'cookie-preferences',
      'next-auth',
      'csrf',
      'session',
      '__Secure-next-auth',
      '__Host-next-auth',
    ];
    return essentialCookies.some(essential => cookieName.includes(essential));
  };

  // Helper function to check if a cookie is allowed based on preferences
  const isAllowedCookie = (cookieName: string, prefs: CookiePreferences): boolean => {
    if (isEssentialCookie(cookieName)) return true;

    // Analytics cookies
    if (cookieName.includes('_ga') || cookieName.includes('gtag') || cookieName.includes('_gid')) {
      return prefs.analytics;
    }

    // Marketing cookies
    if (cookieName.includes('_fbp') || cookieName.includes('_fbc') || cookieName.includes('ads')) {
      return prefs.marketing;
    }

    // Functional cookies
    if (cookieName.includes('theme') || cookieName.includes('lang') || cookieName.includes('pref')) {
      return prefs.functional;
    }

    // Default to functional category for unknown cookies
    return prefs.functional;
  };

  const value: CookieConsentContextType = {
    showConsent,
    preferences,
    hasConsented,
    acceptAll,
    rejectAll,
    acceptSelected,
    closeBanner,
    updatePreferences,
    getAllCookies,
    deleteCookie,
    getCookie,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
} 