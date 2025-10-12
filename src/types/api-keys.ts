import { z } from "zod";
import type { RouterInputs, RouterOutputs } from "./index";

export const apiKeyResponseSchema = z.object({
	id: z.number(),
	name: z.string(),
	key: z.string().optional(),
	key_prefix: z.string(),
	organization_id: z.string().optional(),
	user_id: z.string().optional(),
	project_id: z.string().nullable().optional(),
	metadata: z.string().optional(),
	scopes: z.string().optional(),
	rate_limit_rpm: z.number().nullable(),
	budget_limit: z.number().nullable(),
	budget_used: z.number(),
	budget_remaining: z.number().nullable(),
	budget_currency: z.string(),
	budget_reset_type: z.string().optional(),
	budget_reset_at: z.string().nullable(),
	is_active: z.boolean(),
	expires_at: z.string().nullable(),
	last_used_at: z.string().nullable(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const createApiKeySchema = z.object({
	name: z.string().min(1).max(255),
	projectId: z.string(),
	scopes: z.array(z.string()).optional(),
	rate_limit_rpm: z.number().nullable().optional(),
	budget_limit: z.number().nullable().optional(),
	budget_currency: z.string().optional(),
	budget_reset_type: z.enum(["", "daily", "weekly", "monthly"]).optional(),
	expires_at: z.string().nullable().optional(),
});

export const updateApiKeySchema = z.object({
	id: z.number(),
	name: z.string().min(1).max(255).optional(),
	scopes: z.string().optional(),
	rate_limit_rpm: z.number().nullable().optional(),
	budget_limit: z.number().nullable().optional(),
	budget_currency: z.string().optional(),
	budget_reset_type: z.string().optional(),
	is_active: z.boolean().optional(),
	expires_at: z.string().nullable().optional(),
});

export const createApiKeyRequestSchema = z.object({
	name: z.string().min(1).max(255),
	organization_id: z.string().optional(),
	user_id: z.string().optional(),
	project_id: z.string().nullable().optional(),
	metadata: z.string().optional(),
	scopes: z.array(z.string()).optional(),
	rate_limit_rpm: z.number().nullable().optional(),
	budget_limit: z.number().nullable().optional(),
	budget_currency: z.string().optional(),
	budget_reset_type: z.enum(["", "daily", "weekly", "monthly"]).optional(),
	expires_at: z.string().nullable().optional(),
});

export const updateApiKeyRequestSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	metadata: z.string().optional(),
	scopes: z.string().optional(),
	rate_limit_rpm: z.number().nullable().optional(),
	budget_limit: z.number().nullable().optional(),
	budget_currency: z.string().optional(),
	budget_reset_type: z.string().optional(),
	is_active: z.boolean().optional(),
	expires_at: z.string().nullable().optional(),
});

export const verifyApiKeyRequestSchema = z.object({
	key: z.string(),
});

export const verifyApiKeyResponseSchema = z.object({
	valid: z.boolean(),
	api_key_id: z.number().optional(),
	organization_id: z.string().optional(),
	user_id: z.string().optional(),
	project_id: z.string().nullable().optional(),
	metadata: z.string().optional(),
	expires_at: z.string().nullable().optional(),
	is_active: z.boolean().optional(),
	last_used_at: z.string().nullable().optional(),
	reason: z.string().optional(),
});

export const listApiKeysResponseSchema = z.object({
	data: z.array(apiKeyResponseSchema),
	total: z.number(),
	limit: z.number(),
	offset: z.number(),
});

export const usageLogSchema = z.object({
	id: z.number(),
	api_key_id: z.number(),
	endpoint: z.string(),
	method: z.string(),
	status_code: z.number(),
	cost: z.number(),
	timestamp: z.string(),
	metadata: z.string().optional(),
});

export const usageStatsSchema = z.object({
	total_requests: z.number(),
	total_cost: z.number(),
	total_tokens: z.number().optional(),
	error_count: z.number().optional(),
	average_cost: z.number(),
	period_start: z.string().optional(),
	period_end: z.string().optional(),
});

export const usageByEndpointSchema = z.object({
	endpoint: z.string(),
	request_count: z.number(),
	total_cost: z.number(),
});

export const getUsageResponseSchema = z.object({
	data: z.array(usageLogSchema),
	count: z.number(),
});

export const getStatsResponseSchema = z.object({
	overall: usageStatsSchema,
	by_endpoint: z.array(usageByEndpointSchema),
});

export type ApiKeyResponse = z.infer<typeof apiKeyResponseSchema>;
export type CreateApiKeyRequest = z.infer<typeof createApiKeyRequestSchema>;
export type UpdateApiKeyRequest = z.infer<typeof updateApiKeyRequestSchema>;
export type VerifyApiKeyRequest = z.infer<typeof verifyApiKeyRequestSchema>;
export type VerifyApiKeyResponse = z.infer<typeof verifyApiKeyResponseSchema>;
export type ListApiKeysResponse = z.infer<typeof listApiKeysResponseSchema>;
export type UsageLog = z.infer<typeof usageLogSchema>;
export type UsageStats = z.infer<typeof usageStatsSchema>;
export type UsageByEndpoint = z.infer<typeof usageByEndpointSchema>;
export type GetUsageResponse = z.infer<typeof getUsageResponseSchema>;
export type GetStatsResponse = z.infer<typeof getStatsResponseSchema>;

/**
 * The type for a single API key item in the list.
 * Includes all API key details like name, status, creation date, etc.
 */
export type APIKeyListItem = RouterOutputs["api_keys"]["list"][number];

/**
 * The type for a single, fully-detailed API key.
 * Same as list item but explicitly typed for single item operations.
 */
export type APIKeyDetails = RouterOutputs["api_keys"]["getById"];

/**
 * The type for the response when creating a new API key.
 * Includes both the API key details and the full key value.
 */
export type APIKeyCreateResponse = RouterOutputs["api_keys"]["create"];

/**
 * The type for the response when updating an API key.
 * Returns the updated API key details.
 */
export type APIKeyUpdateResponse = RouterOutputs["api_keys"]["update"];

/**
 * The type for the response when deleting an API key.
 * Simple success confirmation.
 */
export type APIKeyDeleteResponse = RouterOutputs["api_keys"]["delete"];

/**
 * The type for the response when verifying an API key.
 * Contains validation status.
 */
export type APIKeyVerifyResponse = RouterOutputs["api_keys"]["verify"];

/**
 * The type for the complete list of API keys.
 */
export type APIKeysList = RouterOutputs["api_keys"]["list"];

/**
 * The type for the input when creating a new API key.
 */
export type APIKeyCreateInput = RouterInputs["api_keys"]["create"];

/**
 * The type for the input when updating an API key.
 */
export type APIKeyUpdateInput = RouterInputs["api_keys"]["update"];

/**
 * The type for the input when getting an API key by ID.
 */
export type APIKeyGetByIdInput = RouterInputs["api_keys"]["getById"];

/**
 * The type for the input when deleting an API key.
 */
export type APIKeyDeleteInput = RouterInputs["api_keys"]["delete"];

/**
 * The type for the input when verifying an API key.
 */
export type APIKeyVerifyInput = RouterInputs["api_keys"]["verify"];

/**
 * The active status of an API key.
 */
export type APIKeyStatus = APIKeyListItem["is_active"];

/**
 * The core API key data without metadata like created_at, updated_at.
 */
export type APIKeyCore = Pick<
	APIKeyListItem,
	"id" | "name" | "is_active" | "key_prefix"
>;

/**
 * API key data for forms (without server-generated fields).
 */
export type APIKeyFormData = Pick<APIKeyCreateInput, "name" | "expires_at">;

/**
 * API key data for updates (without immutable fields).
 */
export type APIKeyUpdateData = Omit<APIKeyUpdateInput, "id">;
