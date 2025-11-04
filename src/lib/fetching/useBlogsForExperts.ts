"use client";
import { useQuery } from "@tanstack/react-query";
import { getWithFallback } from "./apiWithFallback";

export type BlogPost = {
  id: string;
  title: string;
  authorId: string;
  coverImage?: string;
  excerpt?: string;
  url?: string;
};

async function fetchBlogsForExperts(expertIds: string[]): Promise<BlogPost[]> {
  if (!expertIds || expertIds.length === 0) return [];
  // If backend supports filtering by IDs, prefer it; otherwise fallback JSON and filter client-side
  try {
    const param = encodeURIComponent(expertIds.join(","));
    return await getWithFallback<BlogPost[]>(
      `/v1/blogs?experts=${param}`,
      "/data/blogs.json"
    );
  } catch {
    const all = await getWithFallback<BlogPost[]>("/v1/blogs", "/data/blogs.json");
    const set = new Set(expertIds);
    return all.filter((b) => set.has(b.authorId));
  }
}

export function useBlogsForExperts(expertIds: string[]) {
  return useQuery({
    queryKey: ["blogs-top-experts", expertIds.sort().join(",")],
    queryFn: () => fetchBlogsForExperts(expertIds),
    enabled: Array.isArray(expertIds) && expertIds.length > 0,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });
}


