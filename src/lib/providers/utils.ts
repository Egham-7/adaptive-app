import {
	ENDPOINT_METADATA,
	type EndpointOverride,
	type EndpointType,
	PROVIDER_ENDPOINT_CONFIG,
	PROVIDER_METADATA,
	type ProviderConfigApiResponse,
	type ProviderName,
} from "@/types/providers";

type ProviderMeta = (typeof PROVIDER_METADATA)[keyof typeof PROVIDER_METADATA];

const providerLookup = new Map<string, ProviderMeta>();

Object.values(PROVIDER_METADATA).forEach((meta) => {
	providerLookup.set(meta.name.toLowerCase(), meta);
	providerLookup.set(meta.displayName.toLowerCase(), meta);
});

/**
 * Get supported endpoints for a provider
 */
export function getProviderSupportedEndpoints(
	provider: ProviderName,
): EndpointType[] {
	return PROVIDER_ENDPOINT_CONFIG[provider]?.supported_endpoints ?? [];
}

/**
 * Get default endpoint overrides for a provider
 */
export function getProviderDefaultOverrides(
	provider: ProviderName,
): Partial<Record<EndpointType, EndpointOverride>> {
	return PROVIDER_ENDPOINT_CONFIG[provider]?.default_endpoint_overrides ?? {};
}

/**
 * Merge user overrides with provider defaults
 */
export function mergeEndpointOverrides(
	provider: ProviderName,
	userOverrides?: Partial<Record<EndpointType, EndpointOverride>>,
): Partial<Record<EndpointType, EndpointOverride>> {
	const defaults = getProviderDefaultOverrides(provider);
	return { ...defaults, ...userOverrides };
}

/**
 * Get user-friendly endpoint label
 */
export function getEndpointLabel(endpoint: EndpointType): string {
	return ENDPOINT_METADATA[endpoint]?.label ?? endpoint;
}

/**
 * Get endpoint description
 */
export function getEndpointDescription(endpoint: EndpointType): string {
	return ENDPOINT_METADATA[endpoint]?.description ?? "";
}

/**
 * Get providers compatible with an endpoint
 */
export function getEndpointCompatibleProviders(
	endpoint: EndpointType,
): ProviderName[] {
	return ENDPOINT_METADATA[endpoint]?.compatible_providers ?? [];
}

/**
 * Get user-friendly labels for provider's supported endpoints
 */
export function getProviderEndpointLabels(provider: ProviderName): string[] {
	const endpoints = getProviderSupportedEndpoints(provider);
	return endpoints.map(getEndpointLabel);
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
