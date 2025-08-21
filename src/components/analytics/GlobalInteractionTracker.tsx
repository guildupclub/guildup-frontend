"use client";

import { useEffect } from "react";
import { trackCustomEvent } from "@/lib/analytics";

const SCROLL_EVENT_DEBOUNCE_MS = 1000;

function getElementDescriptor(target: Element | null) {
	if (!target) return { tag: "unknown" } as const;
	const el = target as HTMLElement;
	const role = el.getAttribute("role") || undefined;
	const name =
		el.getAttribute("data-analytics-name") ||
		el.getAttribute("aria-label") ||
		(el as HTMLButtonElement).innerText?.trim()?.slice(0, 80) ||
		undefined;
	const id = el.id || undefined;
	const classes = el.className?.toString?.().split?.(" ")?.slice(0, 5).join(" ") || undefined;
	const href = (el as HTMLAnchorElement).href || undefined;
	return {
		tag: el.tagName?.toLowerCase?.(),
		role,
		name,
		id,
		classes,
		href,
	} as const;
}

function findClosestActionElement(start: Element | null): HTMLElement | null {
	let el: Element | null = start;
	while (el && el !== document.body && el !== document.documentElement) {
		const he = el as HTMLElement;
		const tag = he.tagName?.toLowerCase?.();
		const role = he.getAttribute?.("role");
		if (
			tag === "button" ||
			tag === "a" ||
			(tag === "input" && ["button", "submit"].includes((he as HTMLInputElement).type)) ||
			role === "button" ||
			he.getAttribute?.("data-analytics-name") ||
			he.getAttribute?.("data-analytics-type")
		) {
			return he;
		}
		el = he.parentElement;
	}
	return start as HTMLElement | null;
}

function findClosestCommunityContext(start: Element | null) {
	let el: Element | null = start;
	while (el) {
		const anyEl = el as HTMLElement;
		const directId = anyEl.getAttribute?.("data-community-id");
		const directName = anyEl.getAttribute?.("data-community-name");
		if (directId || directName) {
			return {
				community_id: directId || undefined,
				community_name: directName || undefined,
			};
		}
		if (anyEl?.getAttribute?.("data-analytics-type") === "community-card") {
			return {
				community_id: anyEl.getAttribute("data-community-id") || undefined,
				community_name: anyEl.getAttribute("data-community-name") || undefined,
			};
		}
		el = el.parentElement;
	}
	return {} as { community_id?: string; community_name?: string };
}

export default function GlobalInteractionTracker() {
	useEffect(() => {
		// Ensure dataLayer exists early so events queue even if GTM loads slightly later
		if (typeof window !== "undefined") {
			(window as any).dataLayer = (window as any).dataLayer || [];
		}
		console.log("[analytics] GlobalInteractionTracker mounted");
		let lastScrollLogTs = 0;
		let impressionObserver: IntersectionObserver | null = null;
		let mutationObserver: MutationObserver | null = null;

		const handleClick = (event: MouseEvent) => {
			try {
				const target = event.target as Element | null;
				const actionEl = findClosestActionElement(target);
				const descriptor = getElementDescriptor(actionEl);
				const community = findClosestCommunityContext(target);
				const payload = {
					...descriptor,
					...community,
					page_location: window.location.href,
					page_path: window.location.pathname,
					page_title: document.title,
					x: event.clientX,
					y: event.clientY,
					timestamp: new Date().toISOString(),
				};
				// Console log for debugging in browser
				console.log("[analytics] click", payload);
				// Push to analytics platforms
				trackCustomEvent("ui_click", payload);
			} catch (err) {
				console.warn("[analytics] click error", err);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			try {
				if (event.key !== "Enter" && event.key !== " ") return;
				const target = (event.target as Element) || document.activeElement as Element | null;
				const actionEl = findClosestActionElement(target);
				if (!actionEl) return;
				const descriptor = getElementDescriptor(actionEl);
				const community = findClosestCommunityContext(actionEl);
				const payload = {
					...descriptor,
					...community,
					page_location: window.location.href,
					page_path: window.location.pathname,
					page_title: document.title,
					key: event.key,
					timestamp: new Date().toISOString(),
				};
				console.log("[analytics] key_activate", payload);
				trackCustomEvent("ui_click", payload);
			} catch (err) {
				console.warn("[analytics] keydown error", err);
			}
		};

		const handleScroll = () => {
			const now = Date.now();
			if (now - lastScrollLogTs < SCROLL_EVENT_DEBOUNCE_MS) return;
			lastScrollLogTs = now;
			try {
				const scrollTop = window.scrollY || document.documentElement.scrollTop;
				const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
				const percent = scrollHeight > 0 ? Math.min(100, Math.round((scrollTop / scrollHeight) * 100)) : 0;
				const payload = {
					percent_scrolled: percent,
					scroll_top: scrollTop,
					scroll_height: scrollHeight,
					page_location: window.location.href,
					page_path: window.location.pathname,
					page_title: document.title,
					timestamp: new Date().toISOString(),
				};
				console.log("[analytics] scroll", payload);
				trackCustomEvent("scroll_progress", payload);
			} catch (err) {
				console.warn("[analytics] scroll error", err);
			}
		};

		document.addEventListener("click", handleClick, true);
		document.addEventListener("keydown", handleKeyDown, true);
		window.addEventListener("scroll", handleScroll, { passive: true });

		// Track community card impressions via IntersectionObserver
		try {
			const onImpression: IntersectionObserverCallback = (entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const target = entry.target as HTMLElement;
						const community_id = target.getAttribute("data-community-id") || undefined;
						const community_name = target.getAttribute("data-community-name") || undefined;
						const payload = {
							event: "community_impression",
							community_id,
							community_name,
							page_path: window.location.pathname,
							page_title: document.title,
							timestamp: new Date().toISOString(),
						};
						console.log("[analytics] community_impression", payload);
						trackCustomEvent("community_impression", payload);
						impressionObserver?.unobserve(target); // one-time impression per mount
					}
				}
			};
			impressionObserver = new IntersectionObserver(onImpression, {
				root: null,
				threshold: 0.4,
			});
			const observeExisting = () => {
				const cards = document.querySelectorAll('[data-analytics-type="community-card"]');
				cards.forEach((el) => impressionObserver?.observe(el));
			};
			observeExisting();
			// Watch for dynamically added cards
			if (typeof MutationObserver !== "undefined") {
				mutationObserver = new MutationObserver(() => {
					observeExisting();
				});
				mutationObserver.observe(document.body, { childList: true, subtree: true });
			}
		} catch (err) {
			console.warn("[analytics] impression observer error", err);
		}

		return () => {
			document.removeEventListener("click", handleClick, true);
			document.removeEventListener("keydown", handleKeyDown, true);
			window.removeEventListener("scroll", handleScroll as any);
			try {
				impressionObserver?.disconnect();
				mutationObserver?.disconnect();
			} catch {}
		};
	}, []);

	return null;
}


