import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface PreloadConfig {
  priority: 'low' | 'high';
  timeout?: number;
}

class RoutePreloader {
  private preloadedRoutes = new Set<string>();
  private router: AppRouterInstance | null = null;

  init(router: AppRouterInstance) {
    this.router = router;
  }

  async preloadRoute(path: string, config: PreloadConfig = { priority: 'low' }) {
    if (!this.router || this.preloadedRoutes.has(path)) {
      return;
    }

    try {
      // Add to preloaded set to avoid duplicate requests
      this.preloadedRoutes.add(path);

      // Use router.prefetch with priority
      await this.router.prefetch(path);
      
      console.log(`Preloaded route: ${path}`);
    } catch (error) {
      console.warn(`Failed to preload route ${path}:`, error);
      this.preloadedRoutes.delete(path);
    }
  }

  preloadCommonRoutes() {
    const commonRoutes = [
      '/',
      '/feeds',
      '/chat',
      '/profile',
      '/booking',
      '/payments'
    ];

    commonRoutes.forEach(route => {
      this.preloadRoute(route, { priority: 'low' });
    });
  }

  preloadUserSpecificRoutes(userId?: string) {
    if (!userId) return;

    const userRoutes = [
      '/profile',
      '/booking',
      '/payments',
      '/chat'
    ];

    userRoutes.forEach(route => {
      this.preloadRoute(route, { priority: 'high' });
    });
  }

  preloadCommunityRoutes(communityId?: string) {
    if (!communityId) return;

    const communityRoutes = [
      `/community/${communityId}/feed`,
      `/community/${communityId}/profile`
    ];

    communityRoutes.forEach(route => {
      this.preloadRoute(route, { priority: 'high' });
    });
  }

  // Preload based on user behavior
  preloadOnHover(path: string) {
    // Debounce hover events
    setTimeout(() => {
      this.preloadRoute(path, { priority: 'high' });
    }, 100);
  }

  // Clear preloaded routes cache
  clearCache() {
    this.preloadedRoutes.clear();
  }
}

export const routePreloader = new RoutePreloader();

// Utility hook for easier integration
export function useRoutePreloader(router: AppRouterInstance) {
  routePreloader.init(router);
  return routePreloader;
} 