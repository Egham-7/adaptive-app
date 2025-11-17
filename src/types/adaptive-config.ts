import { z } from "zod";

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Cache backend types
 */
export const cacheBackendTypes = ["redis", "memory"] as const;
export type CacheBackendType = (typeof cacheBackendTypes)[number];

/**
 * Fallback modes for provider failure handling
 */
export const fallbackModes = ["sequential", "race"] as const;
export type FallbackMode = (typeof fallbackModes)[number];

// ============================================================================
// NESTED CONFIGURATION TYPES (for API requests - CREATE/UPDATE)
// ============================================================================

/**
 * Cache configuration for model router (full version for requests)
 * Includes all fields that can be set via API
 */
export interface CacheConfig {
	backend?: CacheBackendType;
	redis_url?: string;
	capacity?: number;
	enabled?: boolean;
	semantic_threshold?: number;
	openai_api_key?: string;
	embedding_model?: string;
}

/**
 * Cache configuration returned by API (sanitized - GET responses only)
 * Only includes API-configurable fields, excludes YAML-only sensitive fields
 */
export interface CacheConfigResponse {
	capacity?: number;
	enabled?: boolean;
	semantic_threshold?: number;
	// Excluded: backend, redis_url, openai_api_key, embedding_model
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
	failure_threshold?: number;
	success_threshold?: number;
	timeout_ms?: number;
	reset_after_ms?: number;
}

/**
 * Model router client configuration
 */
export interface ModelRouterClientConfig {
	adaptive_router_url?: string;
	jwt_secret?: string;
	timeout_ms?: number;
	circuit_breaker?: CircuitBreakerConfig;
}

/**
 * Model capability definition for intelligent routing
 */
export interface ModelCapability {
	provider: string;
	model?: string;
	max_input_tokens?: number;
	max_output_tokens?: number;
	supports_vision?: boolean;
	supports_function_calling?: boolean;
	supports_streaming?: boolean;
	cost_per_1k_input_tokens?: number;
	cost_per_1k_output_tokens?: number;
}

/**
 * Model router configuration (full version for requests)
 */
export interface ModelRouterConfig {
	cache?: CacheConfig;
	client?: ModelRouterClientConfig;
	cost_bias?: number;
	models?: ModelCapability[];
}

/**
 * Model router configuration returned by API (sanitized - GET responses only)
 * Only includes API-configurable fields, excludes YAML-only sensitive fields
 */
export interface ModelRouterConfigResponse {
	cache?: CacheConfigResponse;
	cost_bias?: number;
	models?: ModelCapability[];
	// Excluded: client (contains JWT secrets, URLs)
}

/**
 * Fallback configuration for provider failure handling (full version for requests)
 */
export interface FallbackConfig {
	mode?: FallbackMode;
	timeout_ms?: number;
	max_retries?: number;
	circuit_breaker?: CircuitBreakerConfig;
}

/**
 * Fallback configuration returned by API (sanitized - GET responses only)
 * Only includes API-configurable fields, excludes YAML-only sensitive fields
 */
export interface FallbackConfigResponse {
	mode?: FallbackMode;
	timeout_ms?: number;
	max_retries?: number;
	// Excluded: circuit_breaker
}

/**
 * Server configuration
 */
export interface ServerConfig {
	port?: string;
	allowed_origins?: string;
	environment?: string;
	log_level?: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Response from GET adaptive config endpoints
 * Uses sanitized config types that exclude YAML-only sensitive fields
 */
export interface AdaptiveConfigApiResponse {
	id: number;
	project_id?: number;
	organization_id: string;
	model_router_config?: ModelRouterConfigResponse;
	fallback_config?: FallbackConfigResponse;
	// server_config excluded - YAML-only
	enabled: boolean;
	created_at: string;
	updated_at: string;
	created_by: string;
}

/**
 * Request body for creating adaptive config
 * Uses API-safe config types that exclude YAML-only sensitive fields
 */
export interface CreateAdaptiveConfigApiRequest {
	model_router_config?: {
		cache?: {
			enabled?: boolean;
			semantic_threshold?: number;
		};
		cost_bias?: number;
		models?: ModelCapability[];
	};
	fallback_config?: {
		mode?: FallbackMode;
		timeout_ms?: number;
		max_retries?: number;
	};
}

/**
 * Request body for updating adaptive config
 * Uses API-safe config types that exclude YAML-only sensitive fields
 */
export interface UpdateAdaptiveConfigApiRequest {
	model_router_config?: {
		cache?: {
			enabled?: boolean;
			semantic_threshold?: number;
		};
		cost_bias?: number;
		models?: ModelCapability[];
	};
	fallback_config?: {
		mode?: FallbackMode;
		timeout_ms?: number;
		max_retries?: number;
	};
	enabled?: boolean;
}

/**
 * Response from history endpoint
 */
export interface AdaptiveConfigHistoryApiResponse {
	config_id: number;
	history: AdaptiveConfigHistoryEntry[];
}

/**
 * Single history entry
 */
export interface AdaptiveConfigHistoryEntry {
	id: number;
	config_id: number;
	action: "created" | "updated" | "deleted";
	changes: string; // JSON string of changes
	changed_by: string;
	changed_at: string;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Zod schema for model capability
 */
export const modelCapabilitySchema = z.object({
	provider: z.string().min(1),
	model: z.string().optional(),
	max_input_tokens: z.number().int().positive().optional(),
	max_output_tokens: z.number().int().positive().optional(),
	supports_vision: z.boolean().optional(),
	supports_function_calling: z.boolean().optional(),
	supports_streaming: z.boolean().optional(),
	cost_per_1k_input_tokens: z.number().nonnegative().optional(),
	cost_per_1k_output_tokens: z.number().nonnegative().optional(),
});

/**
 * Zod schema for cache config (full version for requests)
 */
export const cacheConfigSchema = z
	.object({
		backend: z.enum(cacheBackendTypes).optional(),
		redis_url: z.string().url().optional().or(z.literal("")),
		capacity: z.number().int().positive().optional(),
		enabled: z.boolean().optional(),
		semantic_threshold: z.number().min(0).max(1).optional(),
		openai_api_key: z.string().optional(),
		embedding_model: z.string().optional(),
	})
	.optional();

/**
 * Zod schema for cache config (API-safe version for requests only)
 * Only includes fields that can be set via API
 */
export const cacheConfigRequestSchema = z
	.object({
		enabled: z.boolean().optional(),
		semantic_threshold: z.number().min(0).max(1).optional(),
		// Excluded: backend, redis_url, capacity, openai_api_key, embedding_model (YAML-only)
	})
	.optional();

/**
 * Zod schema for model router config (API-safe version for requests only)
 * Only includes fields that can be set via API
 */
export const modelRouterConfigRequestSchema = z
	.object({
		cache: cacheConfigRequestSchema,
		cost_bias: z.number().min(0).max(1).optional(),
		models: z.array(modelCapabilitySchema).optional(),
		// Excluded: client (YAML-only)
	})
	.optional();

/**
 * Zod schema for circuit breaker config
 */
export const circuitBreakerConfigSchema = z
	.object({
		failure_threshold: z.number().int().positive().optional(),
		success_threshold: z.number().int().positive().optional(),
		timeout_ms: z.number().int().positive().optional(),
		reset_after_ms: z.number().int().positive().optional(),
	})
	.optional();

/**
 * Zod schema for model router client config
 */
export const modelRouterClientConfigSchema = z
	.object({
		adaptive_router_url: z.string().url().optional().or(z.literal("")),
		jwt_secret: z.string().optional(),
		timeout_ms: z.number().int().positive().optional(),
		circuit_breaker: circuitBreakerConfigSchema,
	})
	.optional();

/**
 * Zod schema for cache config response (sanitized for GET responses)
 */
export const cacheConfigResponseSchema = z
	.object({
		capacity: z.number().int().positive().optional(),
		enabled: z.boolean().optional(),
		semantic_threshold: z.number().min(0).max(1).optional(),
	})
	.optional();

/**
 * Zod schema for fallback config (API-safe version for requests only)
 * Only includes fields that can be set via API
 */
export const fallbackConfigRequestSchema = z
	.object({
		mode: z.enum(fallbackModes).optional(),
		timeout_ms: z.number().int().positive().optional(),
		max_retries: z.number().int().nonnegative().optional(),
		// Excluded: circuit_breaker (YAML-only)
	})
	.optional();

/**
 * Zod schema for model router config (full version for requests)
 */
export const modelRouterConfigSchema = z
	.object({
		cache: cacheConfigSchema,
		client: modelRouterClientConfigSchema,
		cost_bias: z.number().min(0).max(1).optional(),
		models: z.array(modelCapabilitySchema).optional(),
	})
	.optional();

/**
 * Zod schema for model router config response (sanitized for GET responses)
 */
export const modelRouterConfigResponseSchema = z
	.object({
		cache: cacheConfigResponseSchema,
		cost_bias: z.number().min(0).max(1).optional(),
		models: z.array(modelCapabilitySchema).optional(),
	})
	.optional();

/**
 * Zod schema for fallback config (full version for requests)
 */
export const fallbackConfigSchema = z
	.object({
		mode: z.enum(fallbackModes).optional(),
		timeout_ms: z.number().int().positive().optional(),
		max_retries: z.number().int().nonnegative().optional(),
		circuit_breaker: circuitBreakerConfigSchema,
	})
	.optional();

/**
 * Zod schema for fallback config response (sanitized for GET responses)
 */
export const fallbackConfigResponseSchema = z
	.object({
		mode: z.enum(fallbackModes).optional(),
		timeout_ms: z.number().int().positive().optional(),
		max_retries: z.number().int().nonnegative().optional(),
	})
	.optional();

/**
 * Zod schema for server config
 */
export const serverConfigSchema = z
	.object({
		port: z.string().optional(),
		allowed_origins: z.string().optional(),
		environment: z.string().optional(),
		log_level: z.string().optional(),
	})
	.optional();

/**
 * Zod schema for creating adaptive config
 * Uses API-safe schemas that exclude YAML-only fields
 */
export const createAdaptiveConfigSchema = z.object({
	model_router_config: modelRouterConfigRequestSchema,
	fallback_config: fallbackConfigRequestSchema,
});

/**
 * Zod schema for updating adaptive config
 * Uses API-safe schemas that exclude YAML-only fields
 */
export const updateAdaptiveConfigSchema = z.object({
	model_router_config: modelRouterConfigRequestSchema,
	fallback_config: fallbackConfigRequestSchema,
	enabled: z.boolean().optional(),
});

// ============================================================================
// FORM DATA TYPES (for UI components)
// ============================================================================

/**
 * Form data structure for the adaptive config UI
 * Matches the UpdateAdaptiveConfigApiRequest structure exactly
 * Only includes API-configurable fields (excludes YAML-only sensitive fields)
 */
export interface AdaptiveConfigFormData {
	model_router_config?: {
		cost_bias?: number;
		cache?: {
			enabled?: boolean;
			semantic_threshold?: number;
			// Excluded: capacity (YAML-only)
		};
	};
	fallback_config?: {
		mode?: FallbackMode;
		timeout_ms?: number;
		max_retries?: number;
	};
	enabled?: boolean;
}

/**
 * Zod schema for form data (UI form validation)
 * Matches the API request structure - only includes API-configurable fields
 */
export const adaptiveConfigFormSchema = z.object({
	model_router_config: z
		.object({
			cost_bias: z.number().min(0).max(1).optional(),
			cache: z
				.object({
					enabled: z.boolean().optional(),
					semantic_threshold: z.number().min(0).max(1).optional(),
					// Excluded: capacity (YAML-only)
				})
				.optional(),
		})
		.optional(),
	fallback_config: z
		.object({
			mode: z.enum(fallbackModes).optional(),
			timeout_ms: z.number().int().positive().optional(),
			max_retries: z.number().int().nonnegative().optional(),
		})
		.optional(),
	enabled: z.boolean().optional(),
});
