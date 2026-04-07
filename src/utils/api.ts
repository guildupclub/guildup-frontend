import axios from 'axios';

// Get auth token from localStorage or session
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Create axios instance with auth headers
export const createAuthenticatedRequest = (authToken?: string) => {
  const token = authToken || getAuthToken();
  
  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return axios.create({
    headers,
    timeout: 10000,
  });
};

// Helper function to make authenticated API calls
export const authenticatedApiCall = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  authToken?: string
) => {
  const api = createAuthenticatedRequest(authToken);
  
  try {
    const response = await api.request({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}; 