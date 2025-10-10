"use client";

import React, { useMemo, useState } from "react";
import MemoizedCommunityCard from "@/components/explore/MemoizedCommunityCard";
import { useCachedCommunities } from "@/hooks/useCachedCommunities";
import { primary, white } from "@/app/colours";

interface ProgramCommunitiesProps {
  tag: string;
}

export default function ProgramCommunities({ tag }: ProgramCommunitiesProps) {
  const { data, loading, error } = useCachedCommunities({});
  const [showAll, setShowAll] = useState(false);

  const communities = useMemo(() => {
    const list = data?.communities || [];

    const programKeywords = (() => {
      const t = tag.toLowerCase();
      if (t === "stress-anxiety") return ["stress", "anxiety"];
      if (t === "relationship") return ["relationship"];
      if (t === "pcos") return ["pcos"]; 
      return [t];
    })();

    const normalize = (s: string) => s.toLowerCase().trim();

    const gatherTags = (c: any): string[] => {
      const source = c?.community?.tags ?? c?.tags ?? [];
      const out: string[] = [];
      if (Array.isArray(source)) {
        source.forEach((item: any) => {
          if (typeof item === "string") {
            if (item.includes(",")) out.push(...item.split(",").map((x) => x.trim()));
            else out.push(item.trim());
          } else if (Array.isArray(item)) {
            item.forEach((x: any) => {
              if (typeof x === "string") {
                if (x.includes(",")) out.push(...x.split(",").map((y) => y.trim()));
                else out.push(x.trim());
              }
            });
          }
        });
      }
      return out.filter(Boolean).map(normalize);
    };

    return list.filter((c: any) => {
      const tags = gatherTags(c);
      if (!tags.length) return false;
      return programKeywords.some((kw) => tags.some((t: string) => t.includes(kw)));
    });
  }, [data, tag]);

  const displayed = useMemo(() => (showAll ? communities : communities.slice(0, 8)), [communities, showAll]);

  if (loading) {
    return <div className="py-8 text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>Loading experts…</div>;
  }
  if (error) {
    return <div className="py-8 text-center text-red-600" style={{ fontFamily: "'Poppins', sans-serif" }}>Failed to load.</div>;
  }
  if (!communities.length) {
    return <div className="py-8 text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>No experts found for this program yet.</div>;
  }

  return (
    <div>
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayed.map((c: any) => (
          <MemoizedCommunityCard key={c._id} community={c} onClick={() => {}} />
        ))}
        {!showAll && communities.length > 8 && (
          <div
            onClick={() => setShowAll(true)}
            className="rounded-2xl border bg-white shadow-sm flex items-center justify-center cursor-pointer hover:shadow-md transition-all"
            style={{ minHeight: 360 }}
          >
            <div className="text-center px-6">
              <div className="text-lg font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Load more experts</div>
              <div className="text-sm mt-1" style={{ fontFamily: "'Poppins', sans-serif", color: "#64748b" }}>Tap to see all experts for this program</div>
            </div>
          </div>
        )}
      </div>

      <div className="sm:hidden" style={{ height: 520, scrollSnapType: "y mandatory", overflowY: "auto" }}>
        {displayed.map((c: any) => (
          <div key={c._id} style={{ scrollSnapAlign: "start" }} className="mb-4">
            <MemoizedCommunityCard community={c} onClick={() => {}} />
          </div>
        ))}
        {!showAll && communities.length > 8 && (
          <div style={{ scrollSnapAlign: "start" }} className="mb-4">
            <div
              onClick={() => setShowAll(true)}
              className="rounded-2xl border bg-white shadow-sm flex items-center justify-center cursor-pointer hover:shadow-md transition-all"
              style={{ minHeight: 360 }}
            >
              <div className="text-center px-6">
                <div className="text-lg font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Load more experts</div>
                <div className="text-sm mt-1" style={{ fontFamily: "'Poppins', sans-serif", color: "#64748b" }}>Swipe to see more</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


