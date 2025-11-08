/**
 * API clients for interacting with the Adaptive backend
 *
 * This module provides a structured approach to API communication:
 * - BaseApiClient: Foundation class with common HTTP methods
 * - Specialized clients: Extend BaseApiClient for specific endpoints
 *
 * Usage:
 * ```ts
 * import { ApiKeysClient } from '@/lib/api';
 * import { useAuth } from '@clerk/nextjs';
 *
 * const { getToken } = useAuth();
 * const token = await getToken();
 * const client = new ApiKeysClient(token);
 * const keys = await client.list();
 * ```
 */

export { ApiKeysClient, apiKeysClient } from "./api-keys/client";
export type { ApiClientConfig, RequestOptions } from "./base-client";
export { BaseApiClient } from "./base-client";
export { CreditsClient, creditsClient } from "./credits/client";
export { ModelsClient, modelsClient } from "./models";
export { ProjectsClient, projectsClient } from "./projects/client";
export { ProvidersClient, providersClient } from "./providers";
export { UsageClient, usageClient } from "./usage/client";
