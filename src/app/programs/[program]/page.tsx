import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROGRAMS, getProgramConfig } from "../config";
import ProgramPageClient from "./programPageClient";

type Params = { program: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const cfg = getProgramConfig(params.program);
  if (!cfg) return {};

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.guildup.in"}/programs/${cfg.slug}`;
  return {
    title: `${cfg.title} | GuildUp`,
    description: cfg.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${cfg.title} | GuildUp`,
      description: cfg.description,
      url,
      images: cfg.ogImage ? [{ url: cfg.ogImage }] : undefined,
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function Page({ params }: { params: Params }) {
  const cfg = getProgramConfig(params.program);
  if (!cfg) return notFound();
  return <ProgramPageClient programKey={cfg.slug} />;
}


