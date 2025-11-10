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

    // Allowed community IDs by program type
    const getAllowedCommunityIds = (programTag: string): string[] => {
      const t = programTag.toLowerCase();
      if (t === "stress-anxiety" || t === "relationship") {
        return [
          "6873fd21bb8cdb102a32e33c", // Annie (Anahata by Annie)
          "67e813849e012602676e0504", // Coach Jas (Millennial Life with Coach Jas)
          "6814bb85ca1a0821767ee20b", // Heal with Bhakti
          "683fe1d209c82d665b688c30", // Manvi
          "685bcf2d76aa736a1c6853fe", // Khushi Tayal
          "681ddea3060002ed6eff7b2e", // Divya Mittar (Therapy with Divya)
        ];
      }
      if (t === "pcos") {
        return [
          "684d47313410cd40b54242b7", // Amisha (Nutritionist Amisha Gulati)
          "683442fe02121f9c0e653ea7", // Vidhi (Choose Good Calories with Dietitian Vidhi)
          "686288ae857e74d76d6cc07d", // FaujiFit Kirti (Postpartum Rebound with Kirti)
          "681c82708580a99c046405c0", // Shruti Solanki (RESET BY SHRUTI SOLANKI)
          "68249998cac89cedfd5070fc", // Isha Agarwal (Dieteasybyisha)
          "683f18575411ca44bde8f746", // Ashlesha (SimpliYoga with Ashlesha)
        ];
      }
      return [];
    };

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

    const getCommunityId = (c: any): string => {
      const communityDetails = c?.community || c;
      return communityDetails?._id || c?._id || "";
    };

    const allowedCommunityIds = getAllowedCommunityIds(tag);

    const filtered = list.filter((c: any) => {
      const communityId = getCommunityId(c);
      
      // If we have an allowed IDs list, check ID first (this is the source of truth)
      if (allowedCommunityIds.length > 0) {
        // If the community ID is in the allowed list, include it regardless of tags
        if (allowedCommunityIds.includes(communityId)) {
          return true;
        }
        // If not in allowed list, exclude it
        return false;
      }

      // If no allowed IDs list, fall back to tag-based filtering
      const tags = gatherTags(c);
      if (!tags.length) return false;
      const matchesTag = programKeywords.some((kw) => tags.some((t: string) => t.includes(kw)));
      return matchesTag;
    });

    return filtered;
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
        {displayed.map((c: any) => {
          const communityId = (c?.community?._id || c?._id) || "";
          return <MemoizedCommunityCard key={communityId} community={c} onClick={() => {}} />;
        })}
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
        {displayed.map((c: any) => {
          const communityId = (c?.community?._id || c?._id) || "";
          return (
            <div key={communityId} style={{ scrollSnapAlign: "start" }} className="mb-4">
              <MemoizedCommunityCard community={c} onClick={() => {}} />
            </div>
          );
        })}
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


