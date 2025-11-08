/**
 * Query parameter building utilities for API clients
 */

/**
 * Builds query parameters from a filter object, handling arrays properly
 * Arrays are kept as arrays (will be handled by URL building logic)
 * Undefined/null values are filtered out
 */
export function buildFilterParams<T extends Record<string, unknown>>(
	filter: T,
): Record<string, string | number | boolean | string[]> {
	return Object.fromEntries(
		Object.entries(filter)
			.filter(([, value]) => value !== undefined && value !== null)
			.map(([key, value]) => [key, value]),
	) as Record<string, string | number | boolean | string[]>;
}
