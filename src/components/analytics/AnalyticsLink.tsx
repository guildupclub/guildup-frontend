"use client";

import Link, { LinkProps } from "next/link";
import React from "react";
import { trackCustomEvent } from "@/lib/analytics";

type Props = LinkProps & {
	children: React.ReactNode;
	className?: string;
	analyticsName?: string;
	analyticsCategory?: string;
	analyticsParams?: Record<string, any>;
};

export default function AnalyticsLink({
	children,
	className,
	analyticsName,
	analyticsCategory,
	analyticsParams,
	...props
}: Props) {
	const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
		try {
			const target = e.currentTarget as HTMLAnchorElement;
			const inferredName =
				analyticsName || target.getAttribute("data-analytics-name") ||
				(typeof children === "string" ? (children as string) : target.textContent?.trim()?.slice(0, 80) || undefined);
			const payload = {
				name: inferredName,
				category: analyticsCategory || "link",
				href: target.href,
				page_location: typeof window !== "undefined" ? window.location.href : undefined,
				page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
				page_title: typeof document !== "undefined" ? document.title : undefined,
				...(analyticsParams || {}),
			};
			try { console.log("[analytics] link_click", payload); } catch {}
			trackCustomEvent("link_click", payload);
		} catch {}
	};

	return (
		<Link {...props} className={className} onClick={handleClick}>
			{children}
		</Link>
	);
}


