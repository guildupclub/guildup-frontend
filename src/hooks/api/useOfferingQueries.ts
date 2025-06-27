import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offeringService, type Offering } from '@/services/offeringService';
import { QUERY_KEYS, CACHE_TIME } from '@/utils/constants';
import { useToast } from '@/contexts/ToastContext';

// GET QUERIES

export function useCommunityOfferings(communityId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.OFFERINGS, communityId],
    queryFn: () => offeringService.getCommunityOfferings(communityId),
    enabled: enabled && !!communityId,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  });
}

// MUTATION HOOKS

export function useDeleteOffering() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ offeringId, userId, communityId }: { 
      offeringId: string; 
      userId: string; 
      communityId: string; 
    }) => offeringService.deleteOffering(offeringId, userId, communityId),
    onSuccess: (_, { communityId }) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.OFFERINGS, communityId] 
      });
      showSuccess('Offering deleted successfully');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to delete offering');
    },
  });
} 