import type { Metadata } from "next";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Blogs: Therapy, Mental Health & Nutrition | GuildUp";
  const description = "Actionable guides on therapy, mental health, and nutrition from verified experts. Read top articles and get 1:1 help.";
  return {
    title,
    description,
    alternates: { canonical: "/blogs" },
    openGraph: {
      title,
      description,
      url: "https://guildup.club/blogs",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "GuildUp Blogs",
            description:
              "Articles on therapy, mental health and nutrition",
            url: "https://guildup.club/blogs",
          }),
        }}
      />
      {children}
    </>
  );
}


