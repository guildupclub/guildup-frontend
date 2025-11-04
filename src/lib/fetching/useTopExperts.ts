"use client";
import { useQuery } from "@tanstack/react-query";
import { getWithFallback } from "./apiWithFallback";

export type Expert = {
  id: string;
  name: string;
  title?: string;
  avatarUrl?: string;
};

async function fetchTopExperts(limit = 18): Promise<Expert[]> {
  const apiPath = `/v1/experts/top?limit=${limit}`;
  const all = await getWithFallback<Expert[]>(apiPath, "/data/experts-top.json");
  return all.slice(0, limit);
}

export function useTopExperts(limit = 18) {
  return useQuery({
    queryKey: ["experts-top", limit],
    queryFn: () => fetchTopExperts(limit),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });
}


