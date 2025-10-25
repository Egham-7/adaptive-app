import {
	API_COMPATIBILITY_METADATA,
	type ApiCompatibilityType,
	type CreateProviderApiRequest,
	type CreateProviderFormData,
	type EndpointType,
} from "@/types/providers";

/**
 * Convert API compatibility type to endpoint types array
 * @param compatibility - The API compatibility type (openai, anthropic, gemini)
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

/**
 * Convert form data to API request format
 * @param formData - Form data from the UI
 * @returns API request object with endpoint_types
 * @deprecated Use inline conversion instead - this helper adds no value
 */
export function formDataToApiRequest(
	formData: CreateProviderFormData,
): CreateProviderApiRequest {
	return {
		...formData,
		endpoint_types: getEndpointTypesFromCompatibility(
			formData.api_compatibility,
		),
	};
}
