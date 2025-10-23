"use client";

/**
 * Page View Tracking Hook
 * Enhanced page view tracking with metadata
 */

import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import type { EventProperties } from "@/lib/posthog/types";

/**
 * Hook for tracking enhanced page views
 * Automatically tracks when pathname or search params change
 */
export function useTrackPageView(metadata?: EventProperties) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const posthog = usePostHog();

	useEffect(() => {
		if (!pathname || !posthog) return;

		try {
			let url = window.origin + pathname;
			if (searchParams?.toString()) {
				url = `${url}?${searchParams.toString()}`;
			}

			posthog.capture("$pageview", {
				$current_url: url,
				...metadata,
			});

			if (process.env.NODE_ENV === "development") {
				console.log("[PostHog Hook] Page view captured:", url, metadata);
			}
		} catch (error) {
			console.error("[PostHog Hook] Failed to capture page view:", error);
		}
	}, [pathname, searchParams, posthog, metadata]);
}

/**
 * Manual page view tracking
 * Use this when you need to manually track a page view
 */
export function useManualPageView() {
	const posthog = usePostHog();

	return (url?: string, metadata?: EventProperties) => {
		try {
			if (!posthog) {
				if (process.env.NODE_ENV === "development") {
					console.log(
						"[PostHog Hook] Manual page view (client not available):",
						url,
					);
				}
				return;
			}

			posthog.capture("$pageview", {
				$current_url: url ?? window.location.href,
				...metadata,
			});

			if (process.env.NODE_ENV === "development") {
				console.log("[PostHog Hook] Manual page view captured:", url, metadata);
			}
		} catch (error) {
			console.error(
				"[PostHog Hook] Failed to capture manual page view:",
				error,
			);
		}
	};
}
