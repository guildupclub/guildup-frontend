import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_ENDPOINTS, CATEGORY_IDS, API_BASE_URL } from "@/config/constants";

type Community = {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  owner_experience?: number;
  owner_sessions?: number;
  num_member?: number;
  offerings?: any[];
  profile_url?: string;
  tags?: string[] | any;
};

type FilterPayload = {
  categoryIds: string[];
  priceRange?: { min: number; max: number };
  offeringTypes?: string[];
};

export function useCommunityRecommendations(params?: {
  severity?: string; // e.g., "Minimal", "Mild", "Moderate", "Moderately severe", "Severe"
  suicidality?: boolean;
  labels?: string[];
  userId?: string;
  topN?: number;
}) {
  const fetcher = useCallback(async () => {
    const payload: FilterPayload = {
      categoryIds: CATEGORY_IDS.mind,
      priceRange: { min: 0, max: 10000 },
      offeringTypes: ["discovery-call", "consultation"],
    };
    let list: Community[] = [];

    // 1) Try ML/DL-backed recommendations endpoint if available
    try {
      const mlRes = await axios.post(
        API_ENDPOINTS.aiRecommendations,
        {
          userId: params?.userId,
          severity: params?.severity,
          suicidality: !!params?.suicidality,
          labels: params?.labels || [],
          topN: params?.topN || 10,
        },
        {
          timeout: 10000,
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        }
      );
      const mlBody = mlRes?.data;
      // Accept either array of communities or array of { community, matchPercent }
      if (Array.isArray(mlBody?.data)) {
        const arr = mlBody.data;
        // Normalize into the same shape we return later
        const normalized = arr.map((item: any) => {
          if (item?.community) return item; // already normalized with matchPercent maybe
          return { community: item, matchPercent: item?.matchPercent ?? undefined };
        });
        // If ML returns, short-circuit with topN slice
        return (params?.topN ? normalized.slice(0, params.topN) : normalized) as any;
      }
    } catch (e) {
      // Proceed to heuristics fallback below
    }

    // 2) Fallback: filter-by-offerings
    try {
      const res = await axios.post(
        API_ENDPOINTS.communityFilterByOfferings,
        payload,
        {
          timeout: 10000,
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        }
      );
      const body = res?.data;
      // Validate expected shape: { r: 's', data: [...] }
      if (body && Array.isArray(body.data)) {
        list = body.data as Community[];
      } else if (body && Array.isArray(body)) {
        list = body as Community[];
      } else {
        // Some gateways return objects like { result: -2147483572, method: "", parameters: "" }
        // Treat as invalid and fall through to fallback
        console.warn("Unexpected recommendations response shape", body);
      }
    } catch (err) {
      // Fall back below
      console.warn("Primary recommendations fetch failed, falling back to /community/all", err);
    }

    if (!Array.isArray(list) || list.length === 0) {
      // 3) Last resort fallback: list all
      try {
        const res2 = await axios.get(`${API_BASE_URL}/v1/community/all?page=0&limit=50`, {
          timeout: 10000,
          headers: { Accept: "application/json" },
        });
        const body2 = res2?.data;
        if (body2 && Array.isArray(body2.data)) {
          list = body2.data as Community[];
        }
      } catch (err2) {
        console.error("Fallback recommendations fetch also failed", err2);
        list = [];
      }
    }

    const normalizeTagList = (tags: any): string[] => {
      if (!tags) return [];
      const out: string[] = [];
      (Array.isArray(tags) ? tags : [tags]).forEach((t: any) => {
        if (typeof t === "string") {
          t.split(",").forEach((s) => s && out.push(s.trim().toLowerCase()));
        } else if (Array.isArray(t)) {
          t.forEach((s) => typeof s === "string" && s.split(",").forEach((u) => u && out.push(u.trim().toLowerCase())));
        }
      });
      return Array.from(new Set(out)).filter(Boolean);
    };

    const labelKeywords = new Set(
      (params?.labels || [])
        .map((l) => l.toLowerCase())
        .flatMap((l) => {
          if (l.includes("moderate")) return ["moderate", "therapy", "counseling"]; 
          if (l.includes("severe")) return ["severe", "psychiatry", "clinical", "crisis"]; 
          if (l.includes("mild") || l.includes("minimal")) return ["mild", "coaching", "lifestyle"]; 
          return [l];
        })
    );

    const parseSeverityLevel = (sev?: string): "minimal"|"mild"|"moderate"|"mod-severe"|"severe" => {
      const s = (sev || "").toLowerCase();
      if (s.includes("moderately severe")) return "mod-severe";
      if (s.includes("moderate")) return "moderate";
      if (s.includes("severe")) return "severe";
      if (s.includes("mild")) return "mild";
      return "minimal";
    };

    const sev = parseSeverityLevel(params?.severity);

    const jitter = (id: string): number => {
      const seed = `${id}-${params?.userId || "anon"}-${sev}-${params?.suicidality ? 1 : 0}`;
      let h = 0;
      for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
      return (h % 1000) / 1000; // 0..0.999
    };

    const scored = list.map((c) => {
      const sessions = c.owner_sessions ?? 0;
      const members = c.num_member ?? 0;
      const exp = c.owner_experience ?? 0;

      // Base score from credibility
      let score = sessions * 0.45 + members * 0.25 + exp * 0.30;

      // Severity bias
      const severityBoost = {
        minimal: 0.9,
        mild: 1.0,
        moderate: 1.15,
        "mod-severe": 1.25,
        severe: 1.35,
      }[sev];
      score *= severityBoost;

      // Label/tag matching
      const tags = normalizeTagList((c as any).tags);
      if (tags.length > 0 && labelKeywords.size > 0) {
        const matches = tags.reduce((acc, t) => (labelKeywords.has(t) ? acc + 1 : acc), 0);
        score += matches * 20; // each matching keyword adds weight
      }

      // Suicidality bias: prioritize experience and sessions even more
      if (params?.suicidality) {
        score += exp * 0.4 + sessions * 0.3;
      }

      // Deterministic jitter to avoid identical ordering
      score += jitter(c._id) * 10;

      return { community: c, score };
    });

    // Normalize to match percentage 60..98
    const maxScore = scored.reduce((m, s) => Math.max(m, s.score), 1);
    const minScore = scored.reduce((m, s) => Math.min(m, s.score), maxScore);
    const normalized = scored
      .map((s) => {
        const ratio = maxScore === minScore ? 1 : (s.score - minScore) / (maxScore - minScore);
        const matchPercent = Math.round(60 + ratio * 38); // 60..98
        return { ...s, matchPercent };
      })
      .sort((a, b) => b.score - a.score);

    const top = params?.topN ? normalized.slice(0, params.topN) : normalized.slice(0, 10);
    return top;
  }, [params?.labels, params?.severity, params?.suicidality, params?.topN, params?.userId]);

  return useQuery({
    queryKey: [
      "community",
      "recommendations",
      params?.severity ?? "any",
      params?.suicidality ? "risk" : "no-risk",
      (params?.labels || []).join(","),
    ],
    queryFn: fetcher,
    retry: 1,
    staleTime: 60 * 1000,
  });
}

