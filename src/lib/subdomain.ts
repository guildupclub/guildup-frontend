/**
 * Utility functions for subdomain handling
 */

/**
 * Converts a community name to a subdomain-friendly slug
 * Example: "Khushi Tayal" → "khushi-tayal"
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")        // Replace spaces with hyphens
    .replace(/[^\w-]/g, "")     // Remove special characters (keep only word chars and hyphens)
    .replace(/-+/g, "-")        // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, "");     // Remove leading/trailing hyphens
}

/**
 * Converts a slug back to a community name format
 * Example: "khushi-tayal" → "Khushi Tayal"
 */
export function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Validates if a string is a valid subdomain slug
 */
export function isValidSubdomain(slug: string): boolean {
  // Subdomain rules:
  // - Only lowercase letters, numbers, and hyphens
  // - Cannot start or end with hyphen
  // - Max 63 characters (DNS limit for subdomain label)
  // - Min 1 character
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  return (
    typeof slug === "string" &&
    slug.length > 0 &&
    slug.length <= 63 &&
    subdomainRegex.test(slug)
  );
}

/**
 * Normalizes a subdomain for consistent matching
 */
export function normalizeSubdomain(subdomain: string): string {
  return subdomain.toLowerCase().trim();
}

/**
 * Gets the subdomain from a hostname
 * Example: "khushi-tayal.guildup.club" → "khushi-tayal"
 */
export function extractSubdomain(hostname: string): string | null {
  const parts = hostname.split(".");
  
  // If hostname is "subdomain.domain.tld", return subdomain
  // Skip if it's just "domain.tld" or "www.domain.tld"
  if (parts.length >= 3 && parts[0] !== "www") {
    return parts[0];
  }
  
  return null;
}

