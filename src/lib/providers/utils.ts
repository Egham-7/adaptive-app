import {
	API_COMPATIBILITY_METADATA,
	type ApiCompatibilityType,
	type EndpointOverride,
	type EndpointType,
	PROVIDER_METADATA,
	type ProviderConfigApiResponse,
} from "@/types/providers";

type ProviderMeta = (typeof PROVIDER_METADATA)[keyof typeof PROVIDER_METADATA];

const providerLookup = new Map<string, ProviderMeta>();

Object.values(PROVIDER_METADATA).forEach((meta) => {
	providerLookup.set(meta.name.toLowerCase(), meta);
	providerLookup.set(meta.displayName.toLowerCase(), meta);
});

/**
 * Convert API compatibility type to endpoint types array
 * @param compatibility - The API compatibility type (openai, anthropic, google-ai-studio)
 * @returns Array of endpoint types supported by this compatibility mode
 */
export function getEndpointTypesFromCompatibility(
	compatibility: ApiCompatibilityType,
): EndpointType[] {
	return API_COMPATIBILITY_METADATA[compatibility].endpoints;
}

/**
 * Get API compatibility from endpoint types (best match)
 * @param endpointTypes - Array of endpoint types to match
 * @returns The matching API compatibility type, or null if no match found
 */
export function getCompatibilityFromEndpointTypes(
	endpointTypes: EndpointType[],
): ApiCompatibilityType | null {
	// Sort to normalize comparison
	const sorted = [...endpointTypes].sort().join(",");

	for (const [compatibility, metadata] of Object.entries(
		API_COMPATIBILITY_METADATA,
	)) {
		const metadataEndpoints = [...metadata.endpoints].sort().join(",");
		if (sorted === metadataEndpoints) {
			return compatibility as ApiCompatibilityType;
		}
	}

	return null; // Custom/mixed endpoints
}

// ============================================================================
// ENDPOINT OVERRIDE UTILITIES
// ============================================================================

/**
 * Remove empty endpoint overrides before sending to API
 * @param overrides - Endpoint overrides map
 * @returns Cleaned overrides with empty entries removed, or undefined if all empty
 */
export function cleanEndpointOverrides(
	overrides: Record<string, EndpointOverride | undefined> | undefined,
): Record<string, EndpointOverride> | undefined {
	if (!overrides) return undefined;

	const cleaned: Record<string, EndpointOverride> = {};
	for (const [endpoint, override] of Object.entries(overrides)) {
		// Include override if it exists and has a base_url (including empty strings for clearing)
		if (override && typeof override.base_url === "string") {
			cleaned[endpoint] = { base_url: override.base_url.trim() };
		}
	}

	return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

/**
 * Check if a provider config has any endpoint overrides
 * @param config - Provider configuration
 * @returns True if the config has endpoint overrides
 */
export function hasEndpointOverrides(
	config: ProviderConfigApiResponse | undefined,
): boolean {
	if (!config?.endpoint_overrides) return false;
	return Object.keys(config.endpoint_overrides).length > 0;
}

/**
 * Get the effective base URL for a specific endpoint
 * Checks for endpoint-specific override first, falls back to default base URL
 * @param config - Provider configuration
 * @param endpoint - The endpoint to get URL for
 * @returns The effective base URL for the endpoint
 */
export function getEffectiveUrl(
	config: ProviderConfigApiResponse | undefined,
	endpoint: EndpointType,
): string {
	if (!config) return "";

	// Check for endpoint-specific override
	if (config.endpoint_overrides?.[endpoint]?.base_url) {
		return config.endpoint_overrides[endpoint].base_url;
	}

	// Fall back to default base URL
	return config.base_url || "";
}

/**
 * Count how many endpoints have custom overrides
 * @param overrides - Endpoint overrides map
 * @returns Number of endpoints with overrides
 */
export function countEndpointOverrides(
	overrides: Record<string, EndpointOverride> | undefined,
): number {
	if (!overrides) return 0;
	return Object.keys(overrides).filter((key) =>
		overrides[key]?.base_url?.trim(),
	).length;
}

// ============================================================================
// PROVIDER METADATA HELPERS
// ============================================================================

export function getProviderMetadataById(
	provider?: string | null,
): ProviderMeta | null {
	if (!provider) return null;
	const normalized = provider.toLowerCase();

	const directLookup = providerLookup.get(normalized);
	if (directLookup) return directLookup;

	const metadata = (PROVIDER_METADATA as Record<string, ProviderMeta>)[
		normalized
	];
	return metadata ?? null;
}

export function getProviderDisplayName(provider?: string | null) {
	return (
		getProviderMetadataById(provider)?.displayName ?? provider ?? "Unknown"
	);
}
