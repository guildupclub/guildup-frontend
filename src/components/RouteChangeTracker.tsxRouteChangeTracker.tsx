
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const RouteChangeTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
    window.dataLayer?.push({
      event: "pageview",
      page: url,
    });
  }, [pathname, searchParams]);

  return null;
};

export default RouteChangeTracker;
