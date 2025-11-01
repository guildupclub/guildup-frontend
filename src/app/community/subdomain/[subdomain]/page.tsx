import { redirect } from "next/navigation";
import axios from "axios";
import { nameToSlug, normalizeSubdomain, isValidSubdomain } from "@/lib/subdomain";

type Props = {
  params: { subdomain: string };
};

/**
 * Subdomain lookup page
 * This page is accessed via middleware when a subdomain is detected
 * It looks up the community by name/slug and redirects to the proper profile route
 */
export default async function SubdomainPage({ params }: Props) {
  const { subdomain } = params;

  // Validate subdomain format
  const normalizedSubdomain = normalizeSubdomain(subdomain);
  if (!isValidSubdomain(normalizedSubdomain)) {
    console.error(`Invalid subdomain format: ${subdomain}`);
    redirect("/");
  }

  try {
    // Fetch communities and match by name slug
    // Note: For better performance, consider adding a backend endpoint:
    // GET /v1/community/by-slug/:slug or POST /v1/community/by-name with { name: string }
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/all?limit=1000`,
      { timeout: 10000 }
    );

    if (response.data?.r === "s" && response.data?.data) {
      const communities = Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];

      // Find community by matching subdomain with name slug
      const community = communities.find((c: any) => {
        if (!c?.name || !c?._id) return false;
        
        const nameSlug = nameToSlug(c.name);
        return nameSlug === normalizedSubdomain;
      });

      if (community?._id) {
        // Redirect to the profile page with the community ID
        const cleanedName = nameToSlug(community.name);
        const communityParams = `${cleanedName}-${community._id}`;
        redirect(`/community/${communityParams}/profile`);
      }
    }

    // If community not found, redirect to home or show 404
    console.error(`Community not found for subdomain: ${subdomain}`);
    redirect("/");
  } catch (error) {
    console.error("Error looking up community by subdomain:", error);
    // Redirect to home on error
    redirect("/");
  }
}

