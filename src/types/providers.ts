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
	"gemini",
	"groq",
	"deepseek",
	"huggingface",
	"grok",
	"cohere",
	"mistral",
	"adaptive",
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
 * API compatibility types for custom providers
 */
export const apiCompatibilityTypes = [
	"openai",
	"anthropic",
	"google-ai-studio",
] as const;

export type ApiCompatibilityType = (typeof apiCompatibilityTypes)[number];

/**
 * Endpoint override configuration for per-endpoint base URLs
 */
export interface EndpointOverride {
	base_url?: string;
}

// ============================================================================
// METADATA & CONFIGURATION
// ============================================================================

/**
 * API compatibility metadata with endpoint mappings and examples
 */
export const API_COMPATIBILITY_METADATA: Record<
	ApiCompatibilityType,
	{
		label: string;
		description: string;
		endpoints: EndpointType[];
		examples: string[];
	}
> = {
	openai: {
		label: "OpenAI-compatible",
		description: "Providers using OpenAI's chat completions API format",
		endpoints: ["chat_completions", "select_model"],
		examples: [
			"OpenAI",
			"DeepSeek",
			"Groq",
			"Together AI",
			"Fireworks",
			"Perplexity",
			"OpenRouter",
		],
	},
	anthropic: {
		label: "Anthropic-compatible",
		description: "Providers using Anthropic's messages API format",
		endpoints: ["messages", "select_model", "chat_completions"],
		examples: ["Anthropic", "Cohere", "AWS Bedrock (Anthropic)"],
	},
	"google-ai-studio": {
		label: "Gemini-compatible",
		description: "Providers using Google's Gemini API format",
		endpoints: ["generate", "count_tokens", "chat_completions", "select_model"],
		examples: ["Google Gemini", "Vertex AI"],
	},
};

/**
 * Provider metadata with logos and descriptions
 */
export const PROVIDER_METADATA = {
	openai: {
		name: "openai",
		displayName: "OpenAI",
		logo: "/logos/openai.webp",
		description:
			"GPT-4o, o1, o3-mini and other flagship models for reasoning and generation",
	},
	anthropic: {
		name: "anthropic",
		displayName: "Anthropic",
		logo: "/logos/anthropic.jpeg",
		description:
			"Claude Sonnet 4.5, Haiku 4.5, Opus 4.1 with extended thinking and vision",
	},
	"google-ai-studio": {
		name: "google-ai-studio",
		displayName: "Google AI Studio",
		logo: "/logos/google.svg",
		description: "Gemini 2.5 Flash, Pro models with multimodal capabilities",
	},
	deepseek: {
		name: "deepseek",
		displayName: "DeepSeek",
		logo: "/logos/deepseek.svg",
		description:
			"DeepSeek-V3, DeepSeek-R1 for advanced reasoning and code generation",
	},
	groq: {
		name: "groq",
		displayName: "Groq",
		logo: "/logos/groq.png",
		description:
			"Ultra-fast inference with Llama 3.3 70B, GPT-OSS 120B via GroqChip",
	},
	grok: {
		name: "grok",
		displayName: "Grok",
		logo: "/logos/grok.svg",
		description: "xAI's Grok models with real-time information access",
	},
	huggingface: {
		name: "huggingface",
		displayName: "Hugging Face",
		logo: "/logos/huggingface.png",
		description: "Access to thousands of open-source models via Inference API",
	},
	cohere: {
		name: "cohere",
		displayName: "Cohere",
		logo: "/logos/cohere.png",
		description:
			"Command R+, Command R models for enterprise RAG and generation",
	},
	mistral: {
		name: "mistral",
		displayName: "Mistral AI",
		logo: "/logos/mistral.png",
		description:
			"Magistral Medium 1.2, Mistral Small 3.2, Codestral for code and reasoning",
	},
} as const;

export type ProviderName = keyof typeof PROVIDER_METADATA;

/**
 * Default API compatibility for built-in providers
 */
export const PROVIDER_COMPATIBILITY_DEFAULTS: Record<
	ProviderName,
	ApiCompatibilityType
> = {
	openai: "openai",
	anthropic: "anthropic",
	"google-ai-studio": "google-ai-studio",
	deepseek: "openai",
	groq: "openai",
	grok: "openai",
	huggingface: "openai",
	cohere: "anthropic",
	mistral: "openai",
} as const;

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

/**
 * Provider config for request overrides (backward compatibility)
 */
export type ProviderConfig = Pick<
	ProviderRuntimeConfig,
	"api_key" | "base_url"
>;

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Form data for creating a provider (what user sees in UI)
 */
export interface CreateProviderFormData {
	provider_name: string;
	api_compatibility: ApiCompatibilityType;
	api_key?: string;
	base_url?: string;
	endpoint_overrides?: Record<EndpointType, EndpointOverride>;
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
	endpoint_overrides?: Record<EndpointType, EndpointOverride>;
}

/**
 * API request for updating a provider
 */
export interface UpdateProviderApiRequest {
	endpoint_types?: EndpointType[];
	api_key?: string;
	base_url?: string;
	endpoint_overrides?: Record<EndpointType, EndpointOverride>;
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
	endpoint_overrides?: Record<EndpointType, EndpointOverride>;
	has_api_key: boolean;
	enabled: boolean;
	source: "project" | "organization";
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
	organization_id?: string;
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
	api_compatibility: z.enum(apiCompatibilityTypes),
	api_key: z.string().optional(),
	base_url: z.string().optional(),
	endpoint_overrides: z
		.record(z.enum(endpointTypes), endpointOverrideSchema.optional())
		.optional(),
});

/**
 * Zod schema for updating a provider
 */
export const updateProviderFormSchema = z.object({
	api_compatibility: z.enum(apiCompatibilityTypes).optional(),
	api_key: z.string().optional(),
	base_url: z.url("Please enter a valid URL").or(z.literal("")).optional(),
	enabled: z.boolean().optional(),
	endpoint_overrides: z
		.record(z.enum(endpointTypes), endpointOverrideSchema.optional())
		.optional(),
});

/**
 * Create a schema for provider config form with custom provider validation
 */
export const createProviderConfigFormSchema = (isCustom: boolean) => {
	if (isCustom) {
		// Custom providers require both fields
		return z.object({
			apiKey: z.string().min(1, "API key is required for custom providers"),
			baseUrl: z.url("Please enter a valid URL"),
		});
	}

	// Default providers - fields are optional but must be valid if provided
	return z.object({
		apiKey: z.string().optional(),
		baseUrl: z.url("Please enter a valid URL").or(z.literal("")).optional(),
	});
};

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
