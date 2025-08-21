"use client";

import { useEffect } from "react";
import { initAttributionFromUrl, getAttribution } from "@/lib/attribution";

export default function AttributionInitializer() {
	useEffect(() => {
		const data = initAttributionFromUrl();
		const attribution = data ?? getAttribution();
		if (typeof window !== "undefined") {
			(window as any).dataLayer = (window as any).dataLayer || [];
			(window as any).dataLayer.push({
				event: "attribution_initialized",
				attribution,
			});
		}
	}, []);
	return null;
}

