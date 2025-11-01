import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractSubdomain, isValidSubdomain, normalizeSubdomain } from "@/lib/subdomain";

/**
 * Middleware to handle subdomain routing
 * Maps subdomains like khushi-tayal.guildup.club to /community/{subdomain}-{communityId}/profile
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Only process in production or if explicitly testing subdomains
  // Skip for localhost, vercel deployments, and main domain
  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  const isMainDomain = 
    hostname === "guildup.club" || 
    hostname === "www.guildup.club" ||
    hostname === "guildup.vercel.app" ||
    hostname === "www.guildup.vercel.app";
  
  // Skip middleware for main domain, localhost, and API/static routes
  if (
    isMainDomain || 
    isLocalhost || 
    url.pathname.startsWith("/api") || 
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // Extract subdomain using utility function
  const extractedSubdomain = extractSubdomain(hostname);
  
  if (!extractedSubdomain) {
    return NextResponse.next();
  }

  // Validate and normalize subdomain
  const normalizedSubdomain = normalizeSubdomain(extractedSubdomain);
  
  if (!isValidSubdomain(normalizedSubdomain)) {
    // Invalid subdomain format, continue normally
    return NextResponse.next();
  }

  // If accessing root or profile path on subdomain, rewrite to subdomain lookup
  if (url.pathname === "/" || url.pathname === "/profile") {
    url.pathname = `/community/subdomain/${normalizedSubdomain}`;
    return NextResponse.rewrite(url);
  }

  // For all other paths on subdomain, add subdomain to headers
  // This allows components to access the subdomain if needed
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-subdomain", normalizedSubdomain);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

