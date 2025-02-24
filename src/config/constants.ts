
export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8000"
export const API_ENDPOINTS = {
  getPosts: `${API_BASE_URL}/v1/post/getPosts`,
  getUserCommunity: `${API_BASE_URL}/v1/community/user`,
  getCategories: `${API_BASE_URL}/v1/category/`,
  getSignUrl: `${API_BASE_URL}/v1/post/getSignUrl`,
  editCommunity: `${API_BASE_URL}/v1/community/edit`,
}

