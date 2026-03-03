import type { Metadata } from "next";
import CollegeLanding from "@/components/college/CollegeLanding";

export const metadata: Metadata = {
  title: "Mental Health Programme for Colleges | GuildUp",
  description:
    "UGC-compliant 24/7 mental health support for colleges and universities. Licensed counsellors, helpline, workshops, compliance dashboard, and more. Get started with GuildUp.",
  openGraph: {
    title: "Mental Health Programme for Colleges | GuildUp",
    description:
      "24/7 student helpline, licensed counsellors, workshops, and compliance reporting. Everything your institution needs to meet UGC mandates.",
    url: "https://guildup.club/programs/colleges",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CollegesPage() {
  return <CollegeLanding />;
}
