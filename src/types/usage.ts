import { z } from "zod";

// ============================================================================
// adaptive-proxy usage API types
// ============================================================================

/**
 * Usage record from adaptive-proxy
 */
export interface UsageRecord {
	id: number;
	api_key_id: number;
	endpoint: string;
	provider: string;
	model: string;
	prompt_tokens: number;
	completion_tokens: number;
	finish_reason: string;
	tokens_total: number;
	cost: number;
	currency: string;
	status_code: number;
	latency_ms: number;
	metadata: Record<string, unknown>;
	request_id?: string;
	user_agent?: string;
	ip_address?: string;
	error_message?: string;
	created_at: string;
}

/**
 * Usage statistics from adaptive-proxy
 */
export interface UsageStats {
	total_requests: number;
	total_cost: number;
	total_tokens: number;
	success_requests: number;
	failed_requests: number;
	avg_latency_ms: number;
}

/**
 * Usage by period response
 */
export interface UsageByPeriod {
	period: string;
	total_requests: number;
	total_cost: number;
	total_tokens: number;
	success_requests: number;
	failed_requests: number;
}

/**
 * Request to record usage in adaptive-proxy
 */
export interface RecordUsageRequest {
	api_key_id: number;
	organization_id?: string;
	user_id?: string;
	endpoint: string;
	provider: string;
	model: string;
	tokens_input: number;
	tokens_output: number;
	cost: number;
	currency?: string;
	status_code: number;
	latency_ms: number;
	metadata?: Record<string, unknown>;
	request_id?: string;
	user_agent?: string;
	ip_address?: string;
	error_message?: string;
}

/**
 * Zod schema for RecordUsageRequest
 */
export const recordUsageRequestSchema = z.object({
	api_key_id: z.number(),
	organization_id: z.string().optional(),
	user_id: z.string().optional(),
	endpoint: z.string(),
	provider: z.string(),
	model: z.string(),
	tokens_input: z.number().min(0),
	tokens_output: z.number().min(0),
	cost: z.number().min(0),
	currency: z.string().optional(),
	status_code: z.number(),
	latency_ms: z.number().min(0),
	metadata: z.record(z.string(), z.any()).optional(),
	request_id: z.string().optional(),
	user_agent: z.string().optional(),
	ip_address: z.string().optional(),
	error_message: z.string().optional(),
});
