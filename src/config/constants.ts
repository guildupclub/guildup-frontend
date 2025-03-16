
export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://guildup-be-569548341732.asia-south1.run.app";
// export const API_BASE_URL = "https://guildup-be-569548341732.asia-south1.run.app";
export const API_ENDPOINTS = {
  getPosts: `${API_BASE_URL}/v1/post/getPosts`,
  getUserCommunity: `${API_BASE_URL}/v1/community/user/follow`,
  getCategories: `${API_BASE_URL}/v1/category/`,
  getSignUrl: `${API_BASE_URL}/v1/post/getGCPSignUrl`,
  editCommunity: `${API_BASE_URL}/v1/community/edit`,
}

export const API_FRONTEND_URL = process.env.NEXTAUTH_URL||"https://guildup-frontend-prod.vercel.app/"
