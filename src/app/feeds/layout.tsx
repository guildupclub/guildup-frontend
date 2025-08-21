import type { Metadata } from "next";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Community Feeds | GuildUp";
  const description = "Explore the latest from therapy, mental health, and nutrition communities on GuildUp.";
  return {
    title,
    description,
    alternates: { canonical: "/feeds" },
    openGraph: {
      title,
      description,
      url: "https://guildup.club/feeds",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default function FeedsLayout({ children }: { children: React.ReactNode }) {
  return children;
}


