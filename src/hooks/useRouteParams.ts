import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { parseCommunityParam } from '@/utils/helpers';
import type { RouteParams } from '@/types/api.types';

/**
 * Hook to parse and extract route parameters from the current URL
 * Handles community and channel parameter parsing
 */
export function useRouteParams(): RouteParams {
  const params = useParams();

  return useMemo(() => {
    const communityParam = params?.['community-Id'] as string;
    const channelParam = params?.['channel-name'] as string;
    const postParam = params?.['id'] as string;
    const userParam = params?.['userId'] as string;

    // Parse community parameter
    let communityId: string | null = null;
    let communityName: string | null = null;
    
    if (communityParam) {
      const parsed = parseCommunityParam(communityParam);
      communityId = parsed.communityId;
      communityName = parsed.communityName;
    }

    // Parse channel parameter (similar format: name-id)
    let channelId: string | null = null;
    let channelName: string | null = null;
    
    if (channelParam) {
      const lastHyphenIndex = channelParam.lastIndexOf('-');
      if (lastHyphenIndex !== -1) {
        channelName = channelParam.substring(0, lastHyphenIndex);
        channelId = channelParam.substring(lastHyphenIndex + 1);
      }
    }

    return {
      communityId,
      communityName,
      channelId,
      channelName,
      postId: postParam || null,
      userId: userParam || null,
    };
  }, [params]);
} 