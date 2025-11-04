"use client";
import { useQuery } from "@tanstack/react-query";
import { getWithFallback } from "./apiWithFallback";

export type Program = {
  id: string;
  title: string;
  subtitle?: string;
  illustration?: string; // path under /public/images or remote URL
};

async function fetchPrograms(): Promise<Program[]> {
  return getWithFallback<Program[]>(
    "/v1/programs",
    "/data/programs.json"
  );
}

export function usePrograms() {
  return useQuery({
    queryKey: ["programs"],
    queryFn: fetchPrograms,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });
}


