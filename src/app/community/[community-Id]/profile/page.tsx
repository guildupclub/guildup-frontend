import { ProfileCardWrapper } from "@/components/profile/ProfileCardWrapper";
import Footer from "@/components/layout/Footer";
import axios from "axios";
import { Metadata } from "next";

type Props = {
  params: { "community-Id": string };
};

function parseIdFromParam(param: string | undefined): { namePart: string; id: string } {
  if (!param) return { namePart: "community", id: "" };
  const lastHyphenIndex = param.lastIndexOf("-");
  if (lastHyphenIndex === -1) return { namePart: param, id: param };
  return { namePart: param.slice(0, lastHyphenIndex), id: param.slice(lastHyphenIndex + 1) };
}

// Enhanced metadata generation with actual community data
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: communityId, namePart } = parseIdFromParam(params["community-Id"]);
  
  try {
    // Fetch community data for metadata
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
      { communityId },
      { 
        timeout: 5000, // 5 second timeout
        headers: { "Content-Type": "application/json" }
      }
    );

    if (response.data?.r === "s" && response.data?.data) {
      const profile = response.data.data;
      const communityName = profile.community?.name || namePart.replace(/-/g, " ");
      const description = profile.community?.description || 
        `Discover ${communityName} on GuildUp: expert wellness guidance, coaching, and community support.`;
      const imageUrl = profile.community?.image || profile.user?.user_avatar;
      
      return {
        title: `${communityName} | GuildUp Community Profile`,
        description: description.substring(0, 160), // Keep under 160 chars for SEO
        keywords: profile.community?.tags?.join(", ") || "wellness, community, coaching",
        authors: [{ name: profile.user?.user_name || communityName }],
        openGraph: {
          title: `${communityName} | GuildUp`,
          description: description.substring(0, 160),
          type: "profile",
          images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
          url: `/community/${params["community-Id"]}/profile`,
        },
        twitter: {
          card: "summary_large_image",
          title: `${communityName} | GuildUp`,
          description: description.substring(0, 160),
          images: imageUrl ? [imageUrl] : undefined,
        },
        alternates: {
          canonical: `/community/${params["community-Id"]}/profile`,
        },
        robots: {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true },
        },
      };
    }
  } catch (error) {
    console.error("Error fetching community metadata:", error);
    // Fall through to default metadata
  }

  // Fallback metadata if fetch fails
  const title = `${namePart.replace(/-/g, " ")} | GuildUp Community`;
  return {
    title,
    description: `Discover ${namePart.replace(/-/g, " ")} on GuildUp: expert wellness guidance and community support.`,
    openGraph: {
      title,
      description: `Explore ${namePart.replace(/-/g, " ")} community on GuildUp.`,
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Server component that fetches initial data
export default async function Page({ params }: Props) {
  const { id: communityId, namePart } = parseIdFromParam(params["community-Id"]);
  
  // Fetch community profile data server-side for SEO
  let initialProfile = null;
  let initialOfferings = [];
  
  try {
    const [profileResponse, offeringsResponse] = await Promise.all([
      axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
        { communityId },
        { timeout: 10000 }
      ).catch(() => null),
      axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/community/${communityId}`,
        { timeout: 10000 }
      ).catch(() => null),
    ]);

    if (profileResponse?.data?.r === "s") {
      initialProfile = profileResponse.data.data;
    }

    if (offeringsResponse?.data?.r === "s") {
      initialOfferings = Array.isArray(offeringsResponse.data.data)
        ? offeringsResponse.data.data
        : [offeringsResponse.data.data];
    }
  } catch (error) {
    console.error("Error fetching initial data:", error);
    // Continue without initial data - client will fetch
  }

  // Structured data for SEO
  const structuredData = initialProfile ? {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": initialProfile.community?.name || initialProfile.user?.user_name,
      "description": initialProfile.community?.description || "",
      "image": initialProfile.community?.image || initialProfile.user?.user_avatar,
      "jobTitle": initialProfile.community?.tags?.slice(0, 2).join(" / ") || "Wellness Guide",
      "knowsAbout": initialProfile.community?.tags || [],
      "knowsLanguage": initialProfile.user?.user_languages || [],
    },
    "url": `/community/${params["community-Id"]}/profile`,
    "publisher": {
      "@type": "Organization",
      "name": "GuildUp",
      "url": process.env.NEXT_PUBLIC_SITE_URL || "https://guildup.club"
    }
  } : null;

  return (
    <>
      {/* SEO Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      
      <div className="min-h-screen bg-white w-full flex justify-center py-2">
        <div className="w-full max-w-6xl px-4">
          <ProfileCardWrapper 
            communityId={communityId}
            initialProfile={initialProfile}
            initialOfferings={initialOfferings}
          />
        </div>
      </div>
      <div className="w-full">
        <Footer />  
      </div>
    </>
  );
}
