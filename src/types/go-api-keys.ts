import { z } from "zod";

export const apiKeyResponseSchema = z.object({
	id: z.number(),
	name: z.string(),
	key: z.string().optional(),
	key_prefix: z.string(),
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

export const createApiKeyRequestSchema = z.object({
	name: z.string().min(1).max(255),
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
