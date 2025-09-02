"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCommunityRecommendations } from "@/hook/queries/useCommunityRecommendations";

export default function RecommendationsPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;

  const [diagnosis, setDiagnosis] = useState<string | undefined>(undefined);
  const [labels, setLabels] = useState<string[] | undefined>(undefined);
  const [scoreTotal, setScoreTotal] = useState<number | undefined>(undefined);
  const [scoreLevel, setScoreLevel] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("ai_diagnostic_result");
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { summary?: string; labels?: string[]; total?: number; level?: string };
          setDiagnosis(parsed?.summary);
          setLabels(parsed?.labels);
          if (typeof parsed?.total === "number") setScoreTotal(parsed.total);
          if (parsed?.level) setScoreLevel(parsed.level);
        } catch {}
      }
    }
  }, []);

  const suicidality = useMemo(() => (labels || []).includes("suicidality_risk"), [labels]);
  const { data, isLoading, isError, error, refetch } = useCommunityRecommendations({ severity: scoreLevel || diagnosis, suicidality, labels, userId, topN: 3 });
  const results = useMemo(() => (data ?? []) as any[], [data]);

  const guidance = useMemo(() => {
    const sev = (scoreLevel || diagnosis || "").toLowerCase();
    const hasRisk = (labels || []).includes("suicidality_risk");
    const base: { title: string; bullets: string[]; sessions?: string; caution?: string } = {
      title: "Suggested path",
      bullets: [],
      sessions: undefined,
      caution: undefined,
    };

    if (hasRisk) {
      base.caution = "If you're experiencing thoughts of self‑harm, seek immediate help from local emergency services or a crisis helpline.";
    }

    if (sev.includes("minimal")) {
      base.bullets = [
        "Maintain healthy sleep, nutrition, and movement routines",
        "Use mindfulness or journaling 10–15 mins daily",
        "Check‑in again if symptoms increase or persist",
      ];
      base.sessions = "0–2 optional brief check‑ins";
    } else if (sev.includes("mild")) {
      base.bullets = [
        "Begin brief therapy or coaching to build coping skills",
        "Practice daily stress‑reduction (breathing, walks, guided relaxation)",
        "Track triggers and wins weekly",
      ];
      base.sessions = "4–6 therapy sessions (weekly)";
    } else if (sev.includes("moderately severe")) {
      base.bullets = [
        "Start structured psychotherapy (CBT/ACT)",
        "Create a safety and support plan with your therapist",
        "Consider a psychiatric evaluation for medication options",
      ];
      base.sessions = "12–16 therapy sessions (weekly)";
    } else if (sev.includes("moderate")) {
      base.bullets = [
        "Begin evidence‑based therapy (CBT/ACT)",
        "Build a weekly routine for sleep, meals, and activity",
        "Involve a trusted friend/family member for support",
      ];
      base.sessions = "8–12 therapy sessions (weekly)";
    } else if (sev.includes("severe")) {
      base.bullets = [
        "Urgent psychiatric evaluation and safety planning",
        "Begin weekly psychotherapy with close monitoring",
        "Increase social support and reduce avoidable stressors",
      ];
      base.sessions = "16+ therapy sessions; frequency per clinician guidance";
    } else {
      base.bullets = [
        "Maintain healthy routines and monitor symptoms",
        "Consider a brief expert consultation for personalized tips",
      ];
      base.sessions = "As needed";
    }

    return base;
  }, [scoreLevel, diagnosis, labels]);

  return (
    <div className="min-h-screen bg-background pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-semibold">Your Results & Top Matches</h1>
        {(scoreTotal !== undefined || scoreLevel) && (
          <div className="p-4 rounded-lg border bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">PHQ-9 Score</div>
                <div className="text-xl font-semibold">{scoreTotal ?? "-"} {scoreLevel ? `(${scoreLevel})` : ""}</div>
              </div>
              {diagnosis && (
                <div className="text-sm text-right text-muted-foreground max-w-xs">{diagnosis}</div>
              )}
            </div>
          </div>
        )}

        {/* Suggested path */}
        <div className="p-4 rounded-lg border bg-white">
          <div className="text-base font-semibold mb-2">{guidance.title}</div>
          {guidance.sessions && (
            <div className="text-sm mb-2"><span className="font-medium">Suggested therapy plan:</span> {guidance.sessions}</div>
          )}
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {guidance.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          {guidance.caution && (
            <div className="mt-3 text-sm text-red-600">{guidance.caution}</div>
          )}
        </div>
      </div>

      {isLoading && <div className="py-10 text-center">Finding the best matches for you...</div>}

      {isError && (
        <div className="py-6">
          <div className="text-red-600 text-sm mb-3">{(error as Error)?.message || "Failed to fetch recommendations."}</div>
          <Button variant="outline" onClick={() => refetch()}>Try again</Button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item, idx) => {
            const ex = item.community || item;
            const match = item.matchPercent ?? 0;
            const name = ex.name || ex.community?.name || "Expert";
            const pic = ex.image || ex.community?.image || "/placeholder.svg";
            const specialties = ex.description || "";
            const tags = (ex.tags && Array.isArray(ex.tags)) ? ex.tags : [];
            const href = ex.profile_url || ex.url || "#";
            return (
              <div key={(ex.id ?? name) + idx} className="p-4 rounded-lg border bg-card flex gap-3">
                <div className="w-16 h-16 relative rounded-full overflow-hidden flex-shrink-0">
                  <Image src={pic} alt={name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium truncate">{name}</div>
                    <div className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">{match}% match</div>
                  </div>
                  {specialties && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{specialties}</div>}
                  <div className="mt-2 text-[11px] text-gray-600">
                    Why suggested: {scoreLevel || diagnosis ? `fits ${String(scoreLevel || diagnosis).toLowerCase()}` : "best overall"}
                    {tags && tags.length > 0 ? ` • tags: ${tags.slice(0,3).join(', ')}` : ""}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {href !== "#" ? (
                      <Link href={href} target="_blank">
                        <Button size="sm">View Profile</Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="outline" disabled>Profile Unavailable</Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !isError && results.length === 0 && (
        <div className="py-10 text-center text-sm text-muted-foreground">No recommendations yet. Try completing the check-in first.</div>
      )}
    </div>
  );
}


