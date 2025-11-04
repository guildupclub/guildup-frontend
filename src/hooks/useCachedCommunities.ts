import { useState, useEffect, useCallback } from 'react';

interface CommunityData {
  communities: any[];
  metadata: {
    totalCount: number;
    lastUpdated: string;
    fetchedAt: number;
    version: string;
    source?: string;
  };
  categories: Array<{ name: string; count: number; id?: string }>;
  tags: Array<{ name: string; count: number }>;
}

interface UseCachedCommunitiesOptions {
  fallbackToAPI?: boolean;
  maxAge?: number; // in milliseconds
  autoRefresh?: boolean;
}

export function useCachedCommunities(options: UseCachedCommunitiesOptions = {}) {
  const { 
    fallbackToAPI = true, 
    maxAge = 24 * 60 * 60 * 1000, // 24 hours default
    autoRefresh = false 
  } = options;
  
  const [data, setData] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'cache' | 'api'>('cache');

  const loadCommunityData = useCallback(async () => {
    let cachedData: CommunityData | null = null;
    try {
      setLoading(true);
      setError(null);

      // Try to load from cached JSON first
      try {
        const response = await fetch('/data/communities.json', {
          cache: 'no-cache' // Always get fresh data
        });
        if (response.ok) {
          cachedData = await response.json();
          const dataAge = Date.now() - cachedData.metadata.fetchedAt;
          // If fresh enough, use immediately
          if (dataAge <= maxAge) {
            setData(cachedData);
            setSource('cache');
            setLoading(false);
            return;
          }
        }
      } catch (cacheError) {
        console.log('Failed to load cached data:', cacheError);
      }

      // Fallback to API if cache is stale and API usage allowed
      if (fallbackToAPI && process.env.NEXT_PUBLIC_BACKEND_BASE_URL) {
        try {
          await loadFromAPI(setData, setLoading, setSource);
          return;
        } catch (apiErr) {
          console.warn('API fallback failed, using stale cache if available');
        }
      }

      // If we reach here: use cachedData even if stale per workspace rule
      if (cachedData) {
        setData({
          ...cachedData,
          metadata: {
            ...cachedData.metadata,
            source: 'stale-cache',
          },
        });
        setSource('cache');
      } else {
        throw new Error('Cached data unavailable');
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community data');
      setLoading(false);
    }
  }, [fallbackToAPI, maxAge]);

  const loadFromAPI = async (
    setDataFn: (d: CommunityData) => void,
    setLoadingFn: (b: boolean) => void,
    setSourceFn: (s: 'cache' | 'api') => void,
  ) => {
    setSourceFn('api');

    const allCommunities = [] as any[];
    let page = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/all?page=${page}&limit=${limit}`
      );
      if (!response.ok) throw new Error('API request failed');
      const result = await response.json();
      if (result.r === 's' && Array.isArray(result.data)) {
        allCommunities.push(...result.data);
        const meta = result.meta;
        if (meta && meta.total) {
          hasMore = (page + 1) * limit < meta.total;
        } else {
          hasMore = result.data.length === limit;
        }
        page++;
      } else {
        break;
      }
    }

    const apiData: CommunityData = {
      communities: allCommunities,
      metadata: {
        totalCount: allCommunities.length,
        lastUpdated: new Date().toISOString(),
        fetchedAt: Date.now(),
        version: '1.0',
        source: 'api-fallback'
      },
      categories: [],
      tags: []
    };

    setDataFn(apiData);
    setLoadingFn(false);
  };

  const refresh = () => {
    loadCommunityData();
  };

  useEffect(() => {
    loadCommunityData();
  }, [loadCommunityData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !data) return;
    const refreshInterval = setInterval(() => {
      const dataAge = Date.now() - data.metadata.fetchedAt;
      if (dataAge > maxAge) {
        loadCommunityData();
      }
    }, 60000);
    return () => clearInterval(refreshInterval);
  }, [autoRefresh, data, maxAge, loadCommunityData]);

  return {
    data,
    loading,
    error,
    source,
    refresh,
    isStale: data ? Date.now() - data.metadata.fetchedAt > maxAge : false,
    lastUpdated: data?.metadata.lastUpdated,
    totalCount: data?.metadata.totalCount || 0,
    tags: data?.tags || [],
    categories: data?.categories || []
  };
}
