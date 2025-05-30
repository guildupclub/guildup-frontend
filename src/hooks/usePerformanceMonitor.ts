"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function usePerformanceMonitor() {
  const pathname = usePathname();

  useEffect(() => {
    const navigationStart = performance.now();

    // Track page load performance
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming;
          
          console.log('Navigation Performance:', {
            path: pathname,
            domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
            loadComplete: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
            totalTime: navigationEntry.loadEventEnd - navigationEntry.fetchStart,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });

    // Track route change timing
    const routeChangeEnd = performance.now();
    const routeChangeTime = routeChangeEnd - navigationStart;
    
    if (routeChangeTime > 100) { // Log slow navigations
      console.warn(`Slow navigation to ${pathname}: ${routeChangeTime.toFixed(2)}ms`);
    }

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  // Report Core Web Vitals
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('web-vitals').then((webVitals) => {
        // Use available metrics - FID was replaced with INP in newer versions
        if (webVitals.onCLS) webVitals.onCLS(console.log);
        if (webVitals.onFCP) webVitals.onFCP(console.log);
        if (webVitals.onLCP) webVitals.onLCP(console.log);
        if (webVitals.onTTFB) webVitals.onTTFB(console.log);
        if (webVitals.onINP) webVitals.onINP(console.log); // Newer replacement for FID
      }).catch(() => {
        console.log('Web vitals monitoring not available');
      });
    }
  }, []);
} 