"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { primary } from "@/app/colours";
import { PROGRAMS } from "@/app/programs/config";

interface BreadcrumbItem {
  label: string;
  href: string;
}

const Breadcrumb: React.FC = () => {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = [];
    
    // Always start with Home
    items.push({ label: "Home", href: "/" });

    // Split pathname and build breadcrumbs
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      return items; // Just Home for root path
    }

    // Handle special routes
    if (segments[0] === "programs") {
      items.push({ label: "Programs", href: "/" });
      
      // If it's a specific program page
      if (segments[1]) {
        const programSlug = segments[1];
        const program = PROGRAMS[programSlug as keyof typeof PROGRAMS];
        if (program) {
          // Remove "Program" suffix from title for breadcrumb
          const programName = program.title.replace(" Program", "");
          items.push({ label: programName, href: `/programs/${programSlug}` });
        } else {
          // Format the slug nicely
          const formattedLabel = programSlug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          items.push({ label: formattedLabel, href: `/programs/${programSlug}` });
        }
      }
    } else if (segments[0] === "community") {
      items.push({ label: "Community", href: "/community" });
      
      if (segments[1]) {
        // Handle community ID or slug
        if (segments[1].includes("-")) {
          // It's likely a community ID with name
          const parts = segments[1].split("-");
          const communityName = decodeURIComponent(parts.slice(0, -1).join("-"));
          items.push({ label: communityName, href: `/community/${segments[1]}` });
        } else {
          items.push({ label: segments[1], href: `/community/${segments[1]}` });
        }
        
        // Handle sub-routes like profile, feed, etc.
        if (segments[2]) {
          const subRouteLabels: Record<string, string> = {
            profile: "Profile",
            feed: "Feed",
            members: "Members",
            announcements: "Announcements",
            event: "Event",
            channel: "Channel",
          };
          const subLabel = subRouteLabels[segments[2]] || segments[2];
          items.push({ label: subLabel, href: `/community/${segments[1]}/${segments[2]}` });
          
          // Handle channel name or other nested routes
          if (segments[3]) {
            items.push({ label: decodeURIComponent(segments[3]), href: pathname });
          }
        }
      }
    } else if (segments[0] === "blogs") {
      items.push({ label: "Blogs", href: "/blogs" });
      if (segments[1]) {
        items.push({ label: decodeURIComponent(segments[1]), href: pathname });
      }
    } else if (segments[0] === "experts") {
      items.push({ label: "Experts", href: "/experts" });
    } else if (segments[0] === "profile") {
      items.push({ label: "Profile", href: "/profile" });
    } else if (segments[0] === "booking") {
      items.push({ label: "Booking", href: "/booking" });
      if (segments[1]) {
        items.push({ label: segments[1], href: pathname });
      }
    } else if (segments[0] === "chat") {
      items.push({ label: "Chat", href: "/chat" });
    } else if (segments[0] === "feeds") {
      items.push({ label: "Feeds", href: "/feeds" });
    } else if (segments[0] === "payments") {
      items.push({ label: "Payments", href: "/payments" });
    } else if (segments[0] === "post") {
      items.push({ label: "Post", href: "/post" });
      if (segments[1]) {
        items.push({ label: segments[1], href: pathname });
      }
    } else if (segments[0] === "terms-conditions") {
      items.push({ label: "Terms & Conditions", href: "/terms-conditions" });
    } else if (segments[0] === "privacy-policy") {
      items.push({ label: "Privacy Policy", href: "/privacy-policy" });
    } else if (segments[0] === "contact-us") {
      items.push({ label: "Contact Us", href: "/contact-us" });
    } else {
      // Generic handling for other routes
      segments.forEach((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        items.push({ label, href });
      });
    }

    return items;
  }, [pathname]);

  // Don't show breadcrumb on home page, prototype pages, or friendship pages
  if (pathname === "/" || pathname?.startsWith("/prototype") || pathname?.startsWith("/friendship")) {
    return null;
  }

  return (
    <nav
      className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-16 left-0 right-0 z-30 w-full -mt-0"
      aria-label="Breadcrumb"
      style={{ marginTop: 0, marginBottom: 0, paddingTop: 0 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide">
        <ol className="flex items-center space-x-2 py-1.5 text-sm whitespace-nowrap min-w-max">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <li key={crumb.href} className="flex items-center flex-shrink-0">
                {index > 0 && (
                  <ChevronRight
                    className="mx-2 h-4 w-4 text-gray-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
                {isLast ? (
                  <span
                    className="font-medium truncate max-w-[200px] sm:max-w-[300px] md:max-w-none"
                    style={{
                      color: primary,
                      fontFamily: "'Poppins', sans-serif",
                    }}
                    aria-current="page"
                    title={crumb.label}
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-gray-600 hover:text-primary transition-colors duration-200 truncate max-w-[150px] sm:max-w-[200px] md:max-w-none"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                    title={crumb.label}
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;

