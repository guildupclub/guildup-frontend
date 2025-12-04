import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://guildup-be-569548341732.asia-south1.run.app";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper to get userId from sessionStorage or Redux
const getUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  const userId = sessionStorage.getItem("id");
  return userId;
};

// Personality & Compatibility Assessment
export const savePersonality = async (responses: Array<{ question_id: number; answer: string }>) => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.post(
    `${API_BASE_URL}/v1/friendship/personality`,
    { responses, userId },
    { headers: getAuthHeaders() }
  );

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

export const saveCompatibilityAssessment = async (responses: Array<{ question_id: string; answer: number }>) => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.post(
    `${API_BASE_URL}/v1/friendship/compatibility-assessment`,
    { responses, userId },
    { headers: getAuthHeaders() }
  );

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

// Invitations
export const sendInvite = async (to_phone: string, to_name?: string) => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.post(
    `${API_BASE_URL}/v1/friendship/invite`,
    { to_phone, to_name, userId },
    { headers: getAuthHeaders() }
  );

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

export const getInviteDetails = async (inviteCode: string) => {
  const response = await axios.get(`${API_BASE_URL}/v1/friendship/invite/${inviteCode}`);

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

export const acceptInvite = async (inviteCode: string) => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.post(
    `${API_BASE_URL}/v1/friendship/invite/${inviteCode}/accept`,
    { userId },
    { headers: getAuthHeaders() }
  );

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

export const getPendingInvitations = async () => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.get(`${API_BASE_URL}/v1/friendship/invitations/pending`, {
    headers: getAuthHeaders(),
    params: { userId },
  });

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

// Friendships
export const getFriendshipPairs = async () => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.get(`${API_BASE_URL}/v1/friendship/pairs`, {
    headers: getAuthHeaders(),
    params: { userId },
  });

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

export const getFriendshipDetails = async (friendshipId: string) => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.get(`${API_BASE_URL}/v1/friendship/${friendshipId}`, {
    headers: getAuthHeaders(),
    params: { userId },
  });

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

// Prompts
export const getCurrentPrompt = async (friendshipId: string) => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.get(`${API_BASE_URL}/v1/friendship/${friendshipId}/prompt`, {
    headers: getAuthHeaders(),
    params: { userId },
  });

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

export const submitPromptResponse = async (friendshipId: string, promptId: string, responseText: string) => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.post(
    `${API_BASE_URL}/v1/friendship/${friendshipId}/prompt/respond`,
    { prompt_id: promptId, response_text: responseText, userId },
    { headers: getAuthHeaders() }
  );

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

export const getResponses = async (friendshipId: string) => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.get(`${API_BASE_URL}/v1/friendship/${friendshipId}/responses`, {
    headers: getAuthHeaders(),
    params: { userId },
  });

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

// Streak & Compatibility
export const getStreak = async (friendshipId: string) => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.get(`${API_BASE_URL}/v1/friendship/${friendshipId}/streak`, {
    headers: getAuthHeaders(),
    params: { userId },
  });

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

export const getCompatibility = async (friendshipId: string) => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.get(`${API_BASE_URL}/v1/friendship/${friendshipId}/compatibility`, {
    headers: getAuthHeaders(),
    params: { userId },
  });

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

// Generate user-initiated question
export const generateUserQuestion = async (friendshipId: string) => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.post(
    `${API_BASE_URL}/v1/friendship/${friendshipId}/prompt/generate`,
    { userId },
    { headers: getAuthHeaders() }
  );

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

// Get all previous questions and answers
export const getAllPreviousQAs = async (friendshipId: string) => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.get(`${API_BASE_URL}/v1/friendship/${friendshipId}/previous-qas`, {
    headers: getAuthHeaders(),
    params: { userId },
  });

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

export const updateActivity = async () => {
  const userId = getUserId();
  if (!userId) throw new Error("User not authenticated");

  const response = await axios.post(`${API_BASE_URL}/v1/friendship/update-activity`, {}, {
    headers: getAuthHeaders(),
  });

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

// Verify token and get user
export const verifyToken = async () => {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  if (!token) {
    throw new Error("No token found");
  }

  const response = await axios.get(`${API_BASE_URL}/v1/auth/verify-token`, {
    headers: getAuthHeaders(),
  });

  if (response.data.r === "e") {
    throw new Error(response.data.e);
  }

  return response.data.data;
};

