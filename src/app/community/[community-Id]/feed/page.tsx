"use client";
import { Feed } from "@/components/community/feed/Feed";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { StringConstants } from "@/components/common/CommonText";
import { useParams } from "next/navigation";

export default function FeedPage() {
  const params = useParams();
  const communityParam = params["community-Id"] as string;
  const lastHyphenIndex = communityParam ? communityParam.lastIndexOf("-") : -1;
  const activeCommunityId =
    lastHyphenIndex !== -1
      ? communityParam.substring(lastHyphenIndex + 1)
      : null;

  return (
    <div className="min-h-screen flex grow bg-background">
      {/* Structured data for better indexing */}
      {communityParam ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Community",
              name: communityParam.replace(/-/g, " "),
              url: `https://guildup.club/community/${communityParam}/feed`,
            }),
          }}
        />
      ) : null}
      {activeCommunityId ? (
        <Feed communityId={activeCommunityId as string} />
      ) : (
        <p className="text-center">{StringConstants.SELECT_A_PAGE}</p>
      )}
    </div>
  );
}
