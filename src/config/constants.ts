
export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://guildup-be-569548341732.asia-south1.run.app";
// export const API_BASE_URL = "https://guildup-be-569548341732.asia-south1.run.app";
export const API_ENDPOINTS = {
  getPosts: `${API_BASE_URL}/v1/post/getPosts`,
  getUserCommunity: `${API_BASE_URL}/v1/community/user/follow`,
  getCategories: `${API_BASE_URL}/v1/category/`,
  getSignUrl: `${API_BASE_URL}/v1/post/getGCPSignUrl`,
  editCommunity: `${API_BASE_URL}/v1/community/edit`,
  expertUrl: `https://expert.guildup.club`,
  // AI Diagnostic & Recommendations
  aiDiagnosticQuestions: `${API_BASE_URL}/v1/ai/diagnostic/questions`,
  aiDiagnosticSubmit: `${API_BASE_URL}/v1/ai/diagnostic/submit`,
  aiRecommendations: `${API_BASE_URL}/v1/ai/recommendations`,
  // Community filtering (used for expert discovery)
  communityFilterByOfferings: `${API_BASE_URL}/v1/community/filter-by-offerings`,
}

// Category groups
export const CATEGORY_IDS = {
  mind: [
    "67cab23e9b3cd869f1d3ee97",
    "67cab2669b3cd869f1d3ee98",
    "67cab2809b3cd869f1d3ee99",
  ],
};

export const API_FRONTEND_URL = process.env.NEXTAUTH_URL||"https://dev.guildup.club/"

// Contact Information
export const WHATSAPP_NUMBER = "+91-9211468001";
export const WHATSAPP_NUMBER_DIGITS = "919211468001"; // For WhatsApp URLs (without dashes)