import { API_ENDPOINTS } from '@/utils/constants';
import { apiClient } from './apiClient';

export interface Offering {
  _id: string;
  title: string;
  description: string;
  type: string;
  price: {
    amount: number;
    currency: string;
  };
  discounted_price: string;
  when: Date;
  duration: number;
  is_free: boolean;
  tags: string[];
  rating: number;
  total_ratings: number;
}

export const offeringService = {
  // Get offerings for a community
  getCommunityOfferings: async (communityId: string): Promise<Offering[]> => {
    return await apiClient.get(`${API_ENDPOINTS.OFFERINGS}/community/${communityId}`);
  },

  // Delete an offering
  deleteOffering: async (offeringId: string, userId: string, communityId: string): Promise<void> => {
    await apiClient.delete(`/v1/offering/delete/${offeringId}`, {
      data: {
        userId,
        communityId,
      },
    });
  },
}; 