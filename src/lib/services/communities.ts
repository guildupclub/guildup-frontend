import axios from "axios";

// Community interface based on the structure used in the codebase
export interface Community {
  _id: string;
  name: string;
  title?: string;
  image?: string;
  background_image?: string;
  description?: string;
  subscription?: boolean;
  subscription_price?: number;
  [key: string]: any;
}

/**
 * Fetches user communities from API or JSON fallback
 * @param userId - Optional user ID for API requests
 * @returns Promise<Community[]> - Array of communities
 */
export async function fetchUserCommunities(userId?: string): Promise<Community[]> {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  
  // Check if API URL is not set, empty, or invalid
  // Explicitly check for undefined, null, empty string, or invalid values
  const isApiUrlSet = 
    apiUrl !== undefined && 
    apiUrl !== null && 
    typeof apiUrl === 'string' && 
    apiUrl.trim() !== "" && 
    apiUrl.trim() !== "null" && 
    apiUrl.trim() !== "undefined" &&
    (apiUrl.startsWith('http://') || apiUrl.startsWith('https://'));

  // If API URL is not set or invalid, use JSON fallback immediately
  if (!isApiUrlSet) {
    console.log("📦 [Communities Service] API URL not set or invalid, using JSON fallback");
    console.log("📦 [Communities Service] API URL value:", apiUrl);
    console.log("📦 [Communities Service] API URL type:", typeof apiUrl);
    return fetchFromJSON();
  }

  // Try to fetch from API first, fallback to JSON if status is not 200 or if it errors
  console.log("🌐 [Communities Service] Fetching from API:", apiUrl);
  try {
    const result = await fetchFromAPI(userId);
    // If API returns empty array, fallback to JSON
    if (result.length === 0) {
      console.log("⚠️ [Communities Service] API returned empty array, using JSON fallback");
      return fetchFromJSON();
    }
    return result;
  } catch (error) {
    console.log("⚠️ [Communities Service] API fetch failed, using JSON fallback");
    return fetchFromJSON();
  }
}

/**
 * Fetches communities from the JSON file via API route
 */
export async function fetchFromJSON(): Promise<Community[]> {
  try {
    // Use the API route to get the JSON file content
    const response = await fetch("/api/communities", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn("⚠️ [Communities Service] Communities JSON file not found. Returning empty array.");
        return [];
      }
      throw new Error(`Failed to fetch communities: ${response.status} ${response.statusText}`);
    }

    const communities = await response.json();
    console.log("✅ [Communities Service] Loaded", communities.length, "communities from JSON");
    return Array.isArray(communities) ? communities : [];
  } catch (error: any) {
    console.error("❌ [Communities Service] Error fetching from JSON:", error.message);
    return [];
  }
}

/**
 * Fetches communities from the backend API
 */
async function fetchFromAPI(userId?: string): Promise<Community[]> {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  if (!apiUrl) {
    throw new Error("API URL is not configured");
  }

  const url = `${apiUrl}/v1/community/user/follow`;
  const payload = userId ? { userId } : {};

  console.log("🔍 [Communities Service] Fetching from API");
  console.log("🌐 URL:", url);
  console.log("👤 User ID:", userId || "none");

  try {
    const res = await axios.post(url, payload);

    // Check if status is not 200
    if (res.status !== 200) {
      console.warn(`⚠️ [Communities Service] API returned status ${res.status}, falling back to JSON`);
      throw new Error(`API returned status ${res.status}`);
    }

    // Handle different response formats
    let communitiesData: Community[] = [];
    
    if (res.data.r === "s" && Array.isArray(res.data.data)) {
      communitiesData = res.data.data;
      console.log("✅ [Communities Service] Success format, communities:", communitiesData.length);
    } else if (Array.isArray(res.data.data)) {
      communitiesData = res.data.data;
      console.log("⚠️ [Communities Service] Direct data array format, communities:", communitiesData.length);
    } else if (Array.isArray(res.data)) {
      communitiesData = res.data;
      console.log("⚠️ [Communities Service] Direct array format, communities:", communitiesData.length);
    } else {
      console.error("❌ [Communities Service] Unexpected response format:", res.data);
      throw new Error("Unexpected response format");
    }

    return communitiesData;
  } catch (error: any) {
    // Re-throw the error to trigger JSON fallback
    if (error.response) {
      const status = error.response.status;
      console.warn(`⚠️ [Communities Service] API error - Status: ${status}, falling back to JSON`);
      console.error("📛 [Communities Service] Response error details:", {
        status: status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      console.warn("⚠️ [Communities Service] No response received, falling back to JSON");
      console.error("📛 [Communities Service] Request error:", {
        message: error.message,
        url: error.config?.url,
      });
    } else {
      console.warn("⚠️ [Communities Service] API fetch error, falling back to JSON:", error.message);
    }
    
    // Re-throw to trigger fallback in fetchUserCommunities
    throw error;
  }
}

/**
 * Fetches a single community's profile data from API or JSON fallback
 * @param communityId - The community ID to fetch
 * @returns Promise<any> - Community profile data
 */
export async function fetchCommunityProfile(communityId: string): Promise<any> {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  
  // Check if API URL is not set, empty, or invalid
  const isApiUrlSet = 
    apiUrl !== undefined && 
    apiUrl !== null && 
    typeof apiUrl === 'string' && 
    apiUrl.trim() !== "" && 
    apiUrl.trim() !== "null" && 
    apiUrl.trim() !== "undefined" &&
    (apiUrl.startsWith('http://') || apiUrl.startsWith('https://'));

  // If API URL is not set or invalid, use JSON fallback immediately
  if (!isApiUrlSet) {
    console.log("📦 [Communities Service] API URL not set or invalid, using JSON fallback for community profile");
    return fetchCommunityProfileFromJSON(communityId);
  }

  // Try to fetch from API first, fallback to JSON if status is not 200 or if it errors
  console.log("🌐 [Communities Service] Fetching community profile from API:", communityId);
  try {
    const response = await axios.post(
      `${apiUrl}/v1/community/about`,
      { communityId }
    );

    // Check if status is not 200
    if (response.status !== 200) {
      console.warn(`⚠️ [Communities Service] API returned status ${response.status}, falling back to JSON`);
      return fetchCommunityProfileFromJSON(communityId);
    }

    if (response.data.r === "s" && response.data.data) {
      console.log("✅ [Communities Service] Successfully fetched community profile from API");
      return response.data.data;
    } else {
      console.warn("⚠️ [Communities Service] Invalid API response format, falling back to JSON");
      return fetchCommunityProfileFromJSON(communityId);
    }
  } catch (error: any) {
    console.log("⚠️ [Communities Service] API fetch failed, using JSON fallback");
    return fetchCommunityProfileFromJSON(communityId);
  }
}

/**
 * Fetches a community's profile data from JSON file
 * @param communityId - The community ID to fetch
 * @returns Promise<any> - Community profile data
 */
async function fetchCommunityProfileFromJSON(communityId: string): Promise<any> {
  try {
    // Use the API route to get the JSON file content
    const response = await fetch("/api/communities", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn("⚠️ [Communities Service] Communities JSON file not found.");
        throw new Error("Communities JSON file not found");
      }
      throw new Error(`Failed to fetch communities: ${response.status} ${response.statusText}`);
    }

    const communities = await response.json();
    
    if (!Array.isArray(communities)) {
      throw new Error("Invalid communities data format");
    }

    // Find the community by ID
    const community = communities.find((comm: any) => comm._id === communityId);
    
    if (!community) {
      console.warn(`⚠️ [Communities Service] Community with ID ${communityId} not found in JSON`);
      throw new Error(`Community with ID ${communityId} not found`);
    }

    // Transform the community data to match the API response format
    // Handle user_id which might be an object or string
    const userId = typeof community.user_id === 'object' && community.user_id?._id 
      ? community.user_id._id 
      : (typeof community.user_id === 'string' ? community.user_id : community._id);
    
    const userSessionConducted = typeof community.user_id === 'object' 
      ? (community.user_id?.session_conducted || 0)
      : (community.user_session_conducted || 0);
    
    const userYearOfExperience = typeof community.user_id === 'object'
      ? (community.user_id?.year_of_experience || 0)
      : (community.user_year_of_experience || 0);
    
    const profileData = {
      community: {
        _id: community._id,
        name: community.name,
        description: community.description || "",
        image: community.image || "",
        background_image: community.background_image || "",
        tags: community.tags || [],
        num_member: community.num_member || 0,
        post_count: community.post_count || 0,
        is_locked: community.is_locked || false,
        score: community.score || 0,
        ...community,
      },
      user: {
        user_id: userId,
        user_name: community.name || "",
        user_session_conducted: userSessionConducted,
        user_year_of_experience: userYearOfExperience,
        user_isBankDetailsAdded: community.user_isBankDetailsAdded || false,
        user_iscalendarConnected: community.user_iscalendarConnected || false,
      },
    };

    console.log("✅ [Communities Service] Loaded community profile from JSON:", communityId);
    return profileData;
  } catch (error: any) {
    console.error("❌ [Communities Service] Error fetching community profile from JSON:", error.message);
    throw error;
  }
}

