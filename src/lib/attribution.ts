export type AttributionData = {
	utmSource?: string;
	utmMedium?: string;
	utmCampaign?: string;
	utmTerm?: string;
	utmContent?: string;
	gclid?: string;
	wbraid?: string;
	gbraid?: string;
	msclkid?: string;
	fbclid?: string;
	referrer?: string;
	landingPage?: string;
	firstVisitAt?: string;
	lastTouchAt?: string;
};

const STORAGE_KEY = "guildup_attribution";

function parseAttributionFromUrl(search: string, referrer: string): AttributionData {
	const params = new URLSearchParams(search);
	const data: AttributionData = {
		utmSource: params.get("utm_source") ?? undefined,
		utmMedium: params.get("utm_medium") ?? undefined,
		utmCampaign: params.get("utm_campaign") ?? undefined,
		utmTerm: params.get("utm_term") ?? undefined,
		utmContent: params.get("utm_content") ?? undefined,
		gclid: params.get("gclid") ?? undefined,
		wbraid: params.get("wbraid") ?? undefined,
		gbraid: params.get("gbraid") ?? undefined,
		msclkid: params.get("msclkid") ?? undefined,
		fbclid: params.get("fbclid") ?? undefined,
		referrer,
		landingPage: typeof window !== "undefined" ? window.location.href : undefined,
		lastTouchAt: new Date().toISOString(),
	};
	return data;
}

export function getStoredAttribution(): AttributionData | null {
	if (typeof window === "undefined") return null;
	try {
		const json = localStorage.getItem(STORAGE_KEY);
		if (!json) return null;
		return JSON.parse(json) as AttributionData;
	} catch {
		return null;
	}
}

export function storeAttribution(data: AttributionData): void {
	if (typeof window === "undefined") return;
	const existing = getStoredAttribution();
	const mergedFirst = existing?.firstVisitAt ?? data.firstVisitAt ?? new Date().toISOString();
	const mergedLanding = existing?.landingPage ?? data.landingPage ?? (typeof window !== "undefined" ? window.location.href : undefined);
	const merged: AttributionData = {
		...existing,
		...data,
		firstVisitAt: mergedFirst,
		landingPage: mergedLanding,
	};
	localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
	document.cookie = `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(merged))}; path=/; max-age=${60 * 60 * 24 * 90}`;
}

export function initAttributionFromUrl(): AttributionData | null {
	if (typeof window === "undefined") return null;
	const newData = parseAttributionFromUrl(window.location.search, document.referrer);
	const hasAny = Object.values(newData).some(Boolean);
	if (hasAny) {
		if (!getStoredAttribution()) {
			newData.firstVisitAt = new Date().toISOString();
		}
		storeAttribution(newData);
		return getStoredAttribution();
	}
	return getStoredAttribution();
}

export function getAttribution(): AttributionData | null {
	return getStoredAttribution();
}

export function attachAttribution<T extends Record<string, any>>(parameters: T): T {
	const attr = getAttribution();
	if (!attr) return parameters;
	return {
		...parameters,
		utm_source: attr.utmSource,
		utm_medium: attr.utmMedium,
		utm_campaign: attr.utmCampaign,
		utm_term: attr.utmTerm,
		utm_content: attr.utmContent,
		gclid: attr.gclid,
		wbraid: attr.wbraid,
		gbraid: attr.gbraid,
		msclkid: attr.msclkid,
		fbclid: attr.fbclid,
		referrer: attr.referrer,
		landing_page: attr.landingPage,
		first_visit_at: attr.firstVisitAt,
		last_touch_at: attr.lastTouchAt,
	};
}

