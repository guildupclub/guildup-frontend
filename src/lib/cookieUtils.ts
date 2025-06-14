import { NextRequest, NextResponse } from 'next/server';

export interface CookieInfo {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface CookieConsentData {
  userId?: string;
  consent: {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  timestamp: Date;
  userAgent: string;
  ipAddress: string;
}

// Client-side cookie utilities
export class ClientCookieManager {
  static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  static setCookie(name: string, value: string, options: {
    days?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}) {
    const {
      days = 365,
      path = '/',
      domain,
      secure = false,
      sameSite = 'lax'
    } = options;

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    let cookieString = `${name}=${value}`;
    cookieString += `;expires=${expires.toUTCString()}`;
    cookieString += `;path=${path}`;
    
    if (domain) cookieString += `;domain=${domain}`;
    if (secure) cookieString += ';secure';
    cookieString += `;samesite=${sameSite}`;

    document.cookie = cookieString;
  }

  static deleteCookie(name: string, path: string = '/', domain?: string) {
    let cookieString = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path}`;
    if (domain) cookieString += `;domain=${domain}`;
    document.cookie = cookieString;
  }

  static getAllCookies(): Record<string, string> {
    if (typeof document === 'undefined') return {};
    const cookies: Record<string, string> = {};
    
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    
    return cookies;
  }

  static getCookieInfo(name: string): CookieInfo | null {
    const value = this.getCookie(name);
    if (!value) return null;

    return {
      name,
      value,
      // Note: We can't get all cookie attributes from document.cookie
      // These would need to be tracked separately if needed
    };
  }

  static clearNonEssentialCookies() {
    const essentialCookies = [
      'cookie-consent',
      'cookie-preferences',
      'next-auth',
      'csrf',
      'session'
    ];

    const allCookies = this.getAllCookies();
    Object.keys(allCookies).forEach(cookieName => {
      if (!essentialCookies.some(essential => cookieName.includes(essential))) {
        this.deleteCookie(cookieName);
      }
    });
  }
}

// Server-side cookie utilities
export class ServerCookieManager {
  static getCookies(request: NextRequest): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    request.cookies.getAll().forEach(cookie => {
      cookies[cookie.name] = cookie.value;
    });
    
    return cookies;
  }

  static getCookie(request: NextRequest, name: string): string | null {
    return request.cookies.get(name)?.value || null;
  }

  static setCookie(response: NextResponse, name: string, value: string, options: {
    maxAge?: number;
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}) {
    const cookieOptions = {
      maxAge: options.maxAge || 365 * 24 * 60 * 60, // 1 year in seconds
      path: options.path || '/',
      secure: options.secure ?? process.env.NODE_ENV === 'production',
      httpOnly: options.httpOnly ?? false,
      sameSite: options.sameSite || 'lax' as const,
      ...options
    };

    response.cookies.set(name, value, cookieOptions);
    return response;
  }

  static deleteCookie(response: NextResponse, name: string, path: string = '/') {
    response.cookies.delete({
      name,
      path,
    });
    return response;
  }

  static getAllCookieInfo(request: NextRequest): CookieInfo[] {
    return request.cookies.getAll().map(cookie => ({
      name: cookie.name,
      value: cookie.value,
      // Additional attributes would need to be tracked separately
    }));
  }
}

// Cookie consent logging utilities
export class CookieConsentLogger {
  static async logConsent(consentData: CookieConsentData) {
    try {
      const response = await fetch('/api/cookies/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consentData),
      });

      if (!response.ok) {
        throw new Error('Failed to log consent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error logging cookie consent:', error);
      throw error;
    }
  }

  static async getConsentHistory(userId: string) {
    try {
      const response = await fetch(`/api/cookies/consent?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch consent history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching consent history:', error);
      throw error;
    }
  }
}

// Cookie categorization utilities
export class CookieCategorizationUtils {
  static categorizeCookie(cookieName: string): 'necessary' | 'functional' | 'analytics' | 'marketing' {
    const name = cookieName.toLowerCase();

    // Necessary cookies
    if (this.isNecessaryCookie(name)) {
      return 'necessary';
    }

    // Analytics cookies
    if (this.isAnalyticsCookie(name)) {
      return 'analytics';
    }

    // Marketing cookies
    if (this.isMarketingCookie(name)) {
      return 'marketing';
    }

    // Default to functional
    return 'functional';
  }

  private static isNecessaryCookie(name: string): boolean {
    const necessaryPatterns = [
      'cookie-consent',
      'cookie-preferences',
      'next-auth',
      'csrf',
      'session',
      '__secure-',
      '__host-',
      'auth',
      'login',
      'security'
    ];

    return necessaryPatterns.some(pattern => name.includes(pattern));
  }

  private static isAnalyticsCookie(name: string): boolean {
    const analyticsPatterns = [
      '_ga',
      '_gid',
      '_gat',
      'gtag',
      'analytics',
      '_hjid',
      '_hjincludedinsample',
      'mixpanel',
      'amplitude'
    ];

    return analyticsPatterns.some(pattern => name.includes(pattern));
  }

  private static isMarketingCookie(name: string): boolean {
    const marketingPatterns = [
      '_fbp',
      '_fbc',
      'ads',
      'marketing',
      'campaign',
      'utm',
      'doubleclick',
      'adsystem',
      'linkedin',
      'twitter'
    ];

    return marketingPatterns.some(pattern => name.includes(pattern));
  }

  static getAllCookiesWithCategories(): Array<CookieInfo & { category: string }> {
    const allCookies = ClientCookieManager.getAllCookies();
    
    return Object.entries(allCookies).map(([name, value]) => ({
      name,
      value,
      category: this.categorizeCookie(name)
    }));
  }
}

// Utility to get user information for consent logging
export function getUserInfo(request?: NextRequest) {
  if (typeof window !== 'undefined') {
    // Client-side
    return {
      userAgent: navigator.userAgent,
      ipAddress: '', // Will be set by server
      timestamp: new Date(),
    };
  } else if (request) {
    // Server-side
    return {
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 request.ip || '',
      timestamp: new Date(),
    };
  }
  
  return {
    userAgent: '',
    ipAddress: '',
    timestamp: new Date(),
  };
} 