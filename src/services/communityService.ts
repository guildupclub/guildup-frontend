import type { 
  Community, 
  CommunityMember, 
  CreateCommunityRequest, 
  UpdateCommunityRequest,
  JoinCommunityRequest,
  CommunityStats,
  Category
} from '@/types/community.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/utils/constants';

export class CommunityService {
  // Get all communities with pagination and filters
  async getCommunities(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    is_public?: boolean;
  }): Promise<PaginatedResponse<Community>> {
    return apiClient.get<PaginatedResponse<Community>>(API_ENDPOINTS.COMMUNITIES, params);
  }

  // Get community by ID
  async getCommunity(communityId: string): Promise<Community> {
    // Send communityID in the body using POST request
    return apiClient.get<Community>(`${API_ENDPOINTS.COMMUNITIES}/about/${communityId}`);
  }

  // Create new community
  async createCommunity(data: CreateCommunityRequest): Promise<Community> {
    return apiClient.post<Community>(API_ENDPOINTS.COMMUNITIES, data);
  }

  // Update community
  async updateCommunity(communityId: string, data: UpdateCommunityRequest): Promise<Community> {
    return apiClient.put<Community>(`${API_ENDPOINTS.COMMUNITIES}/${communityId}`, data);
  }

  // Delete community
  async deleteCommunity(communityId: string): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.COMMUNITIES}/${communityId}`);
  }

  // Join community
  async joinCommunity(data: JoinCommunityRequest): Promise<void> {
    return apiClient.post<void>(`${API_ENDPOINTS.COMMUNITIES}/${data.communityId}/join`, data);
  }

  // Leave community
  async leaveCommunity(communityId: string): Promise<void> {
    return apiClient.post<void>(`${API_ENDPOINTS.COMMUNITIES}/${communityId}/leave`);
  }

  // Get community members
  async getCommunityMembers(
    communityId: string, 
    params?: {
      page?: number;
      limit?: number;
      role?: 'owner' | 'moderator' | 'member';
      search?: string;
    }
  ): Promise<PaginatedResponse<CommunityMember>> {
    return apiClient.get<PaginatedResponse<CommunityMember>>(
      `${API_ENDPOINTS.COMMUNITIES}/${communityId}/members`,
      params
    );
  }

  // Get specific member
  async getCommunityMember(communityId: string, userId: string): Promise<CommunityMember> {
    return apiClient.get<CommunityMember>(`${API_ENDPOINTS.COMMUNITIES}/${communityId}/members/${userId}`);
  }

  // Update member role
  async updateMemberRole(
    communityId: string, 
    userId: string, 
    role: 'owner' | 'moderator' | 'member'
  ): Promise<CommunityMember> {
    return apiClient.put<CommunityMember>(
      `${API_ENDPOINTS.COMMUNITIES}/${communityId}/members/${userId}`,
      { role }
    );
  }

  // Remove member
  async removeMember(communityId: string, userId: string): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.COMMUNITIES}/${communityId}/members/${userId}`);
  }

  // Get community stats
  async getCommunityStats(communityId: string): Promise<CommunityStats> {
    return apiClient.get<CommunityStats>(`${API_ENDPOINTS.COMMUNITIES}/${communityId}/stats`);
  }

  // Get user's communities
  async getUserCommunities(
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      role?: 'owner' | 'moderator' | 'member';
    }
  ): Promise<PaginatedResponse<Community>> {
    try {
      // Try the follow endpoint first (as it's currently being used)
      const response = await apiClient.get<Community[]>(
        `${API_ENDPOINTS.COMMUNITIES}/user/follow?userId=${userId}`,
      );

      console.log("getUserCommunities response", response);
      
      // Handle both array response and object response
      const communities = Array.isArray(response) ? response : ((response as any)?.data || []);
      
      // Transform the response to match the expected PaginatedResponse format
      const result: PaginatedResponse<Community> = {
        data: communities,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          total: communities.length,
          totalPages: Math.ceil(communities.length / (params?.limit || 20)),
          hasNextPage: false,
          hasPrevPage: false,
        }
      };

      return result;
    } catch (error) {
      console.error("Error fetching user communities:", error);
      
      // If the follow endpoint fails, try alternative endpoint
      try {
        const response = await apiClient.get<PaginatedResponse<Community>>(
          `${API_ENDPOINTS.COMMUNITIES}/user/${userId}`,
          params
        );
        return response;
      } catch (alternativeError) {
        console.error("Alternative endpoint also failed:", alternativeError);
        
        // Return empty result instead of throwing error
        return {
          data: [],
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          }
        };
      }
    }
  }

  // Search communities
  async searchCommunities(
    query: string,
    params?: {
      page?: number;
      limit?: number;
      category?: string;
    }
  ): Promise<PaginatedResponse<Community>> {
    return apiClient.get<PaginatedResponse<Community>>(
      `${API_ENDPOINTS.COMMUNITIES}/search`,
      { query, ...params }
    );
  }

  // Get featured communities
  async getFeaturedCommunities(limit?: number): Promise<Community[]> {
    return apiClient.get<Community[]>(`${API_ENDPOINTS.COMMUNITIES}/featured`, { limit });
  }

  // Get trending communities
  async getTrendingCommunities(limit?: number): Promise<Community[]> {
    return apiClient.get<Community[]>(`${API_ENDPOINTS.COMMUNITIES}/trending`, { limit });
  }

  // Get community categories
  async getCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES);
  }

  // Upload community image
  async uploadCommunityImage(
    communityId: string,
    file: File,
    type: 'image' | 'background_image',
    onProgress?: (progress: number) => void
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('communityId', communityId);

    return apiClient.upload<{ url: string }>(
      `${API_ENDPOINTS.COMMUNITIES}/${communityId}/upload`,
      formData,
      onProgress
    );
  }

  // Generate invite code
  async generateInviteCode(communityId: string, expiresIn?: number): Promise<{ code: string; expiresAt: string }> {
    return apiClient.post<{ code: string; expiresAt: string }>(
      `${API_ENDPOINTS.COMMUNITIES}/${communityId}/invite`,
      { expiresIn }
    );
  }

  // Validate invite code
  async validateInviteCode(code: string): Promise<{ valid: boolean; community: Community }> {
    return apiClient.get<{ valid: boolean; community: Community }>(
      `${API_ENDPOINTS.COMMUNITIES}/invite/${code}/validate`
    );
  }

  // Join by invite code
  async joinByInviteCode(code: string): Promise<Community> {
    return apiClient.post<Community>(`${API_ENDPOINTS.COMMUNITIES}/invite/${code}/join`);
  }
}

// Create and export singleton instance
export const communityService = new CommunityService(); 