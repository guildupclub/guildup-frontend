import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROGRAMS, getProgramConfig } from "../config";
import ProgramPageClient from "./programPageClient";

type Params = { program: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const cfg = getProgramConfig(resolvedParams.program);
  if (!cfg) return {};

  const url = `${process.env.NEXTAUTH_URL}/programs/${cfg.slug}`;
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

export default async function Page({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const cfg = getProgramConfig(resolvedParams.program);
  if (!cfg) return notFound();
  return <ProgramPageClient programKey={cfg.slug} />;
}


