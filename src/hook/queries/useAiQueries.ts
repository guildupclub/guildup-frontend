import { useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/config/constants";

export type DiagnosticQuestion = {
  id: string;
  text?: string;
  question?: string;
  options?: Array<string | number>;
  type?: string;
  min?: number;
  max?: number;
};

export type DiagnosticAnswer = {
  questionId: string;
  value: string | number;
};

export type DiagnosticResult = {
  id?: string;
  score?: number;
  summary?: string;
  level?: string;
  labels?: string[];
  [key: string]: any;
};

export type ExpertRecommendation = {
  id?: string;
  name?: string;
  title?: string;
  specialties?: string[];
  rating?: number;
  avatar?: string;
  url?: string;
  communityId?: string;
  [key: string]: any;
};

async function postJson<T>(url: string, body?: any): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }
  return (await response.json()) as T;
}

type QuestionsResponse = { r?: string; data?: DiagnosticQuestion[] } | DiagnosticQuestion[];

export function useDiagnosticQuestions(input?: { userId?: string; context?: Record<string, any> }) {
  const fetchQuestions = useCallback(async (): Promise<DiagnosticQuestion[]> => {
    const data = await postJson<QuestionsResponse>(API_ENDPOINTS.aiDiagnosticQuestions, input ?? {});
    const list = Array.isArray(data) ? data : (data?.data ?? []);
    return list as DiagnosticQuestion[];
  }, [input]);

  return useQuery({
    queryKey: ["ai", "diagnostic", "questions", input?.userId ?? "anon"],
    queryFn: fetchQuestions,
    staleTime: 5 * 60 * 1000,
  });
}

type SubmitResponse = { r?: string; data?: DiagnosticResult } | DiagnosticResult;

export function useSubmitDiagnosticAnswers() {
  return useMutation({
    mutationKey: ["ai", "diagnostic", "submit"],
    mutationFn: async (payload: { userId?: string; answers: DiagnosticAnswer[] }) => {
      const data = await postJson<SubmitResponse>(API_ENDPOINTS.aiDiagnosticSubmit, payload);
      return ("data" in (data as any) ? (data as any).data : data) as DiagnosticResult;
    },
  });
}

type RecommendationsInput = {
  userId?: string;
  topN?: number;
  diagnosis?: string;
  labels?: string[];
  context?: Record<string, any>;
};

type RecommendationsResponse = { r?: string; data?: ExpertRecommendation[] } | ExpertRecommendation[];

export function useAiRecommendations(input?: RecommendationsInput) {
  const fetchRecommendations = useCallback(async (): Promise<ExpertRecommendation[]> => {
    const data = await postJson<RecommendationsResponse>(API_ENDPOINTS.aiRecommendations, input ?? {});
    const list = Array.isArray(data) ? data : (data?.data ?? []);
    return list as ExpertRecommendation[];
  }, [input]);

  return useQuery({
    queryKey: ["ai", "recommendations", input?.userId ?? "anon", input?.diagnosis ?? "none"],
    queryFn: fetchRecommendations,
    enabled: true,
  });
}


