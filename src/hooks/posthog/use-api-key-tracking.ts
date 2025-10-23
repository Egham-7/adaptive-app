"use client";

/**
 * API Key Tracking Hook
 * React hooks for tracking API key management events
 */

import { useCallback } from "react";
import {
	trackApiKeyCopied,
	trackApiKeyCreated,
	trackApiKeyDeleted,
	trackApiKeyRevoked,
	trackApiKeyViewed,
} from "@/lib/posthog/events/api-keys";
import type {
	ApiKeyCopiedProps,
	ApiKeyCreatedProps,
	ApiKeyDeletedProps,
	ApiKeyRevokedProps,
} from "@/lib/posthog/types";

export function useApiKeyTracking() {
	const handleCreated = useCallback((props: ApiKeyCreatedProps) => {
		trackApiKeyCreated(props);
	}, []);

	const handleViewed = useCallback(
		(props: { projectId: string; organizationId: string }) => {
			trackApiKeyViewed(props);
		},
		[],
	);

	const handleCopied = useCallback((props: ApiKeyCopiedProps) => {
		trackApiKeyCopied(props);
	}, []);

	const handleRevoked = useCallback((props: ApiKeyRevokedProps) => {
		trackApiKeyRevoked(props);
	}, []);

	const handleDeleted = useCallback((props: ApiKeyDeletedProps) => {
		trackApiKeyDeleted(props);
	}, []);

	return {
		trackCreated: handleCreated,
		trackViewed: handleViewed,
		trackCopied: handleCopied,
		trackRevoked: handleRevoked,
		trackDeleted: handleDeleted,
	};
}
