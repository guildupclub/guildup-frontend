import type { Metadata } from "next";
import { Suspense } from "react";

type Props = {
  children: React.ReactNode;
  params: { [key: string]: string };
};

function parseIdFromParam(param: string | undefined): { namePart: string; id: string } {
  if (!param) return { namePart: "community", id: "" };
  const lastHyphenIndex = param.lastIndexOf("-");
  if (lastHyphenIndex === -1) return { namePart: param, id: param };
  return { namePart: param.slice(0, lastHyphenIndex), id: param.slice(lastHyphenIndex + 1) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const rawParam = params["community-Id"];
  const { namePart } = parseIdFromParam(rawParam);
  const title = `${namePart.replace(/-/g, " ")} | GuildUp Community`;

  return {
    title,
    description: `Discover ${namePart.replace(/-/g, " ")} on GuildUp: coaching, therapy, fitness, and expert guidance.`,
    openGraph: {
      title,
      description: `Join ${namePart.replace(/-/g, " ")} community on GuildUp for therapy, fitness, mental and physical health guidance.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `Explore ${namePart.replace(/-/g, " ")} on GuildUp.`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default function CommunityDynamicLayout({ children }: Props) {
  return <Suspense>{children}</Suspense>;
}


