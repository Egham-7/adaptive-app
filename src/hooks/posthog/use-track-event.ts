"use client";

/**
 * Generic Event Tracking Hook
 * React hook for tracking PostHog events from components
 */

import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";
import type { EventName, EventProperties } from "@/lib/posthog/types";

/**
 * Hook for tracking PostHog events
 * Provides a simple interface for capturing events from React components
 */
export function useTrackEvent() {
	const posthog = usePostHog();

	const track = useCallback(
		(eventName: EventName | string, properties?: EventProperties) => {
			try {
				if (!posthog) {
					if (process.env.NODE_ENV === "development") {
						console.log(
							"[PostHog Hook] Event captured (client not available):",
							eventName,
							properties,
						);
					}
					return;
				}

				posthog.capture(eventName, properties);

				if (process.env.NODE_ENV === "development") {
					console.log("[PostHog Hook] Event captured:", eventName, properties);
				}
			} catch (error) {
				console.error(
					"[PostHog Hook] Failed to capture event:",
					eventName,
					error,
				);
			}
		},
		[posthog],
	);

	return track;
}
