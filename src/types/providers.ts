import { z } from "zod";

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Supported provider types
 */
export const providerEnum = [
	"openai",
	"anthropic",
	"google-ai-studio",
	"z-ai",
] as const;

export type ProviderType = (typeof providerEnum)[number];

/**
 * Endpoint types available in adaptive-proxy
 */
export const endpointTypes = [
	"chat_completions",
	"messages",
	"generate",
	"count_tokens",
	"select_model",
] as const;

export type EndpointType = (typeof endpointTypes)[number];

/**
 * Endpoint override configuration for per-endpoint base URLs
 */
export interface EndpointOverride {
	base_url?: string;
}

/**
 * Endpoint metadata with display information
 */
export interface EndpointMetadata {
	label: string;
	description: string;
	compatible_providers: ProviderType[];
}

/**
 * Endpoint metadata for UI display
 */
export const ENDPOINT_METADATA: Record<EndpointType, EndpointMetadata> = {
	chat_completions: {
		label: "OpenAI Compatible",
		description: "Standard chat completion API for generating responses",
		compatible_providers: ["openai", "anthropic", "google-ai-studio", "z-ai"],
	},
	messages: {
		label: "Anthropic Compatible",
		description: "Anthropic-style messages API for conversational AI",
		compatible_providers: ["anthropic", "z-ai"],
	},
	generate: {
		label: "Google Compatible",
		description: "Google-style content generation API",
		compatible_providers: ["google-ai-studio"],
	},
	count_tokens: {
		label: "Google Count Tokens",
		description: "Token counting and estimation API",
		compatible_providers: ["google-ai-studio"],
	},
	select_model: {
		label: "Adaptive Router Compatible",
		description: "Model selection and information API",
		compatible_providers: ["openai", "anthropic", "google-ai-studio", "z-ai"],
	},
};

// ============================================================================
// PROVIDER ENDPOINT CONFIGURATION
// ============================================================================

/**
 * Provider endpoint configuration with defaults
 */
export interface ProviderEndpointConfig {
	// Endpoints this provider supports
	supported_endpoints: EndpointType[];
	// Default base URL overrides for specific endpoints
	// Used for providers like z-ai that have different URLs per endpoint
	default_endpoint_overrides?: Partial<Record<EndpointType, EndpointOverride>>;
}

/**
 * Provider endpoint configurations
 */
export const PROVIDER_ENDPOINT_CONFIG: Record<
	ProviderType,
	ProviderEndpointConfig
> = {
	openai: {
		supported_endpoints: ["chat_completions", "select_model"],
	},
	anthropic: {
		supported_endpoints: ["messages", "chat_completions", "select_model"],
	},
	"google-ai-studio": {
		supported_endpoints: [
			"generate",
			"count_tokens",
			"chat_completions",
			"select_model",
		],
	},
	"z-ai": {
		supported_endpoints: ["messages", "chat_completions", "select_model"],
		default_endpoint_overrides: {
			messages: { base_url: "https://api.z.ai/api/anthropic" },
			chat_completions: { base_url: "https://api.z.ai/api/paas/v4" },
			select_model: { base_url: "https://api.z.ai/api/paas/v4" },
		},
	},
};

// ============================================================================
// PROVIDER METADATA
// ============================================================================

/**
 * Provider metadata with display information
 */
export const PROVIDER_METADATA = {
	openai: {
		name: "openai",
		displayName: "OpenAI",
		description: "GPT-4o, o1, o3-mini and other flagship models",
	},
	anthropic: {
		name: "anthropic",
		displayName: "Anthropic",
		description: "Claude Sonnet 4.5, Haiku 4.5, Opus 4.1",
	},
	"google-ai-studio": {
		name: "google-ai-studio",
		displayName: "Google AI Studio",
		description: "Gemini 2.5 Flash, Pro models",
	},
	"z-ai": {
		name: "z-ai",
		displayName: "Z-AI",
		description: "Z-AI models with multi-endpoint support",
	},
} as const;

export type ProviderName = keyof typeof PROVIDER_METADATA;

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Runtime provider configuration (used internally by proxy)
 */
export interface ProviderRuntimeConfig {
	api_key?: string;
	base_url?: string;
	endpoint_types?: EndpointType[];
}

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Form data for creating a provider (what user sees in UI)
 */
export interface CreateProviderFormData {
	provider_name: string;
	api_key?: string;
	base_url?: string;
	endpoint_types?: EndpointType[];
	endpoint_overrides?: Partial<Record<EndpointType, EndpointOverride>>;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

/**
 * API request for creating a provider
 */
export interface CreateProviderApiRequest {
	provider_name: string;
	endpoint_types: EndpointType[];
	api_key?: string;
	base_url?: string;
	endpoint_overrides?: Partial<Record<EndpointType, EndpointOverride>>;
}

/**
 * API request for updating a provider
 */
export interface UpdateProviderApiRequest {
	endpoint_types?: EndpointType[];
	api_key?: string;
	base_url?: string;
	endpoint_overrides?: Partial<Record<EndpointType, EndpointOverride>>;
	enabled?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Provider configuration response from API
 */
export interface ProviderConfigApiResponse {
	id: number;
	provider_name: string;
	endpoint_types: EndpointType[];
	base_url: string;
	endpoint_overrides?: Partial<Record<EndpointType, EndpointOverride>>;
	has_api_key: boolean;
	enabled: boolean;
	source: "project";
	created_at: string;
	updated_at: string;
	created_by: string;
	updated_by: string;
}

/**
 * List of provider configurations
 */
export interface ListProvidersApiResponse {
	project_id?: number;
	providers: ProviderConfigApiResponse[];
}

/**
 * Provider configuration change history
 */
export interface GetProviderHistoryApiResponse {
	config_id: number;
	history: {
		id: number;
		config_id: number;
		action: "created" | "updated" | "deleted";
		changes: string; // JSON string
		changed_by: string;
		changed_at: string;
	}[];
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Zod schema for endpoint override configuration
 */
export const endpointOverrideSchema = z.object({
	base_url: z
		.string()
		.url("Please enter a valid URL")
		.or(z.literal(""))
		.optional(),
});

/**
 * Zod schema for creating a provider
 */
export const createProviderFormSchema = z.object({
	provider_name: z.string().min(1).max(100),
	api_key: z.string().optional(),
	base_url: z
		.string()
		.url("Please enter a valid URL")
		.or(z.literal(""))
		.optional(),
	endpoint_types: z.array(z.enum(endpointTypes)).optional(),
	endpoint_overrides: z
		.object({
			chat_completions: endpointOverrideSchema.optional(),
			messages: endpointOverrideSchema.optional(),
			generate: endpointOverrideSchema.optional(),
			count_tokens: endpointOverrideSchema.optional(),
			select_model: endpointOverrideSchema.optional(),
		})
		.optional(),
});

/**
 * Zod schema for updating a provider
 */
export const updateProviderFormSchema = z.object({
	api_key: z.string().optional(),
	base_url: z.url("Please enter a valid URL").or(z.literal("")).optional(),
	endpoint_types: z.array(z.enum(endpointTypes)).optional(),
	enabled: z.boolean().optional(),
	endpoint_overrides: z
		.object({
			chat_completions: endpointOverrideSchema.optional(),
			messages: endpointOverrideSchema.optional(),
			generate: endpointOverrideSchema.optional(),
			count_tokens: endpointOverrideSchema.optional(),
			select_model: endpointOverrideSchema.optional(),
		})
		.optional(),
});

// ============================================================================
// FALLBACK CONFIGURATION
// ============================================================================

/**
 * Fallback mode for provider requests
 */
export type FallbackMode = "sequential" | "race";

/**
 * Fallback configuration for chat requests
 */
export interface FallbackConfig {
	enabled?: boolean;
	mode?: FallbackMode;
}

/**
 * Zod schema for fallback configuration
 */
export const fallbackConfigSchema = z.object({
	enabled: z.boolean().optional(),
	mode: z.enum(["sequential", "race"]).optional(),
});

// ============================================================================
// REGISTRY PROVIDER TYPES
// ============================================================================

/**
 * Provider data from the model registry API
 */
export interface RegistryProvider {
	name: string; // Provider name (e.g., "openai", "anthropic")
	tags: string[]; // Unique tags across all endpoints
	model_count: number; // Number of unique models
	endpoint_count: number; // Total number of endpoints
	active_count: number; // Number of active endpoints (status = 0)
	quantizations: string[]; // Unique quantizations available
}

/**
 * Filter options for querying providers from the registry
 */
export interface RegistryProviderFilter {
	tags?: string[]; // Filter by provider tag(s) - OR logic
	status?: number; // Endpoint status filter
	input_modalities?: string[]; // Filter by input modality
	output_modalities?: string[]; // Filter by output modality
	min_context_length?: number; // Minimum context window
	has_pricing?: boolean; // Filter by pricing availability
	quantizations?: string[]; // Filter by quantization

	// Index signature for compatibility with Record<string, unknown>
	[key: string]: unknown;
}
