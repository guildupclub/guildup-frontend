import type { Metadata } from "next";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Therapy & Mental Health Experts | Mind | GuildUp";
  const description = "Find trusted therapists and mental health experts for anxiety, stress, relationships, mindfulness, and more. Book 1:1 sessions tailored to you.";
  return {
    title,
    description,
    alternates: { canonical: "/mind" },
    openGraph: {
      title,
      description,
      url: "https://guildup.club/mind",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default function MindLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Mind | Therapy & Mental Health",
            description:
              "Curated list of therapists and mental health communities on GuildUp",
            url: "https://guildup.club/mind",
          }),
        }}
      />
      {children}
    </>
  );
}


