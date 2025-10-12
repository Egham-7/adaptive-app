/**
 * API clients for interacting with the Adaptive backend
 *
 * This module provides a structured approach to API communication:
 * - BaseApiClient: Foundation class with common HTTP methods
 * - Specialized clients: Extend BaseApiClient for specific endpoints
 *
 * Usage:
 * ```ts
 * import { apiKeysClient } from '@/lib/api/api-keys';
 *
 * const keys = await apiKeysClient.list();
 * const key = await apiKeysClient.create({ name: 'My Key', ... });
 * ```
 */

export type { ApiClientConfig, RequestOptions } from "./base-client";
export { BaseApiClient } from "./base-client";
