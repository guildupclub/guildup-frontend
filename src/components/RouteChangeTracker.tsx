
"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";
import { usePathname, useSearchParams } from "next/navigation";

const RouteChangeTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
    // Console log and analytics event via centralized utility
    try {
      console.log("[analytics] page_view", { page: url });
      trackPageView(document.title, window.location.origin + url);
    } catch {}
  }, [pathname, searchParams]);

  return null;
};

export default RouteChangeTracker;
