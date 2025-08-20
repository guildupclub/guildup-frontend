import type { Metadata } from "next";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Fitness & Nutrition Coaches | Body | GuildUp";
  const description = "Work with verified fitness and nutrition experts for weight loss, strength, diet plans, and healthy living. Book 1:1 sessions today.";
  return {
    title,
    description,
    alternates: { canonical: "/body" },
    openGraph: {
      title,
      description,
      url: "https://guildup.club/body",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default function BodyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Body | Fitness & Nutrition",
            description:
              "Discover fitness and nutrition communities on GuildUp",
            url: "https://guildup.club/body",
          }),
        }}
      />
      {children}
    </>
  );
}


