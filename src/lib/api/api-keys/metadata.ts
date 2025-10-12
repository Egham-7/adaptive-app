/**
 * Metadata utilities for API keys
 */

export interface APIKeyMetadata {
	userId: string;
	projectId: string;
	[key: string]: unknown;
}

/**
 * Create metadata object for API key
 */
export function createMetadata(userId: string, projectId: string): string {
	const metadata: APIKeyMetadata = {
		userId,
		projectId,
	};

	return JSON.stringify(metadata);
}

/**
 * Parse metadata string from API key
 */
export function parseMetadata(metadataString: string): APIKeyMetadata {
	return JSON.parse(metadataString) as APIKeyMetadata;
}
