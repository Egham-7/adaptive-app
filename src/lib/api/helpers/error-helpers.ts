/**
 * HTTP error handling utilities
 */

/**
 * Checks if an error indicates a 404 Not Found response
 */
export function isNotFoundError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;

	const message = error.message.toLowerCase();
	return (
		message.includes("not found") ||
		message.includes("404") ||
		message.includes("request failed")
	);
}

/**
 * Checks if an error indicates a forbidden (403) response
 */
export function isForbiddenError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;

	const message = error.message.toLowerCase();
	return message.includes("forbidden") || message.includes("403");
}

/**
 * Checks if an error indicates a conflict (409) response
 */
export function isConflictError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;

	const message = error.message.toLowerCase();
	return (
		message.includes("already exists") ||
		message.includes("conflict") ||
		message.includes("409")
	);
}

/**
 * Checks if an error indicates a bad request (400) response
 */
export function isBadRequestError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;

	const message = error.message.toLowerCase();
	return message.includes("yaml-only") || message.includes("400");
}
