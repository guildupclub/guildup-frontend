export type ProgramKey = "pcos" | "stress-anxiety" | "relationship";

interface ProgramConfig {
  slug: ProgramKey;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  ogImage?: string;
  heroSvg?: string;
}

export const PROGRAMS: Record<ProgramKey, ProgramConfig> = {
  pcos: {
    slug: "pcos",
    tag: "pcos",
    title: "PCOS Program",
    subtitle: "Beat PCOS with expert guidance and a personalized plan",
    description:
      "Overcome PCOS challenges through structured support: expert consults, a tailored roadmap, and ongoing accountability.",
    ogImage: "/public/hero/hero1.jpg",
  },
  "stress-anxiety": {
    slug: "stress-anxiety",
    tag: "stress-anxiety",
    title: "Stress & Anxiety Program",
    subtitle: "Build calm, resilience, and mental clarity",
    description:
      "Reduce stress and anxiety with top coaches and therapists through a guided, step-by-step plan and support.",
    ogImage: "/public/hero/hero2.jpg",
    // Optionally override with a specific SVG path in /public
    // heroSvg: "/svg/stress-anxiety-banner.svg",
  },
  relationship: {
    slug: "relationship",
    tag: "relationship",
    title: "Relationship Program",
    subtitle: "Strengthen your relationships with expert-backed strategies",
    description:
      "Improve communication, resolve conflicts, and build deeper connections with end-to-end expert support.",
    ogImage: "/public/hero/hero3.jpg",
  },
};

export function getProgramConfig(slug: string): ProgramConfig | null {
  return PROGRAMS[slug as ProgramKey] || null;
}


