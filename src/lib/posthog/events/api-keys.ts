/**
 * API Key Event Tracking
 * Track API key management operations
 */

import { captureEvent } from "../client";
import type {
	ApiKeyCopiedProps,
	ApiKeyCreatedProps,
	ApiKeyDeletedProps,
	ApiKeyRevokedProps,
} from "../types";

/**
 * Track API key creation
 */
export function trackApiKeyCreated(props: ApiKeyCreatedProps): void {
	captureEvent("api_key_created", props);
}

/**
 * Track API key list view
 */
export function trackApiKeyViewed(props: {
	projectId: string;
	organizationId: string;
}): void {
	captureEvent("api_key_viewed", props);
}

/**
 * Track API key copied to clipboard
 */
export function trackApiKeyCopied(props: ApiKeyCopiedProps): void {
	captureEvent("api_key_copied", props);
}

/**
 * Track API key revocation
 */
export function trackApiKeyRevoked(props: ApiKeyRevokedProps): void {
	captureEvent("api_key_revoked", props);
}

/**
 * Track API key deletion
 */
export function trackApiKeyDeleted(props: ApiKeyDeletedProps): void {
	captureEvent("api_key_deleted", props);
}
