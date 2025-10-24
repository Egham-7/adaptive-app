import { z } from "zod";

// Provider enum for consistent typing across the app
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

// Endpoint types available in adaptive-proxy
export const endpointTypes = [
	"chat_completions",
	"messages",
	"generate",
	"count_tokens",
	"select_model",
] as const;

export type EndpointType = (typeof endpointTypes)[number];

// API Compatibility types for custom providers
export const apiCompatibilityTypes = ["openai", "anthropic", "gemini"] as const;

export type ApiCompatibilityType = (typeof apiCompatibilityTypes)[number];

// API Compatibility metadata
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
		endpoints: ["messages", "select_model"],
		examples: ["Anthropic", "Cohere", "AWS Bedrock (Anthropic)"],
	},
	gemini: {
		label: "Gemini-compatible",
		description: "Providers using Google's Gemini API format",
		endpoints: ["generate", "count_tokens", "chat_completions", "select_model"],
		examples: ["Google Gemini", "Vertex AI"],
	},
};

// Default API compatibility for built-in providers
export const PROVIDER_COMPATIBILITY_DEFAULTS: Record<
	ProviderName,
	ApiCompatibilityType
> = {
	openai: "openai",
	anthropic: "anthropic",
	gemini: "gemini",
	deepseek: "openai",
	groq: "openai",
	grok: "openai",
	huggingface: "openai",
	cohere: "anthropic",
	mistral: "openai",
} as const;

// Helper: Convert API compatibility to endpoint types
export function getEndpointTypesFromCompatibility(
	compatibility: ApiCompatibilityType,
): EndpointType[] {
	return API_COMPATIBILITY_METADATA[compatibility].endpoints;
}

// Helper: Get API compatibility from endpoint types (best match)
export function getCompatibilityFromEndpointTypes(
	endpointTypes: EndpointType[],
): ApiCompatibilityType | null {
	// Sort to normalize comparison
	const sorted = [...endpointTypes].sort().join(",");

	for (const [compatibility, metadata] of Object.entries(
		API_COMPATIBILITY_METADATA,
	)) {
		const metadataEndpoints = [...metadata.endpoints].sort().join(",");
		if (sorted === metadataEndpoints) {
			return compatibility as ApiCompatibilityType;
		}
	}

	return null; // Custom/mixed endpoints
}

// Helper: Convert form data to API request
export function formDataToApiRequest(
	formData: CreateProviderFormData,
): CreateProviderApiRequest {
	return {
		...formData,
		endpoint_types: getEndpointTypesFromCompatibility(
			formData.api_compatibility,
		),
	};
}

// Helper: Convert API response to form data (for editing)
export function apiResponseToFormData(
	response: GetProviderApiResponse,
): UpdateProviderFormData {
	const apiCompatibility = getCompatibilityFromEndpointTypes(
		response.endpoint_types,
	);

	return {
		api_compatibility: apiCompatibility ?? "openai", // Default to openai if custom
		base_url: response.base_url,
		enabled: response.enabled,
	};
}

// Runtime provider config (used internally by proxy)
export interface ProviderRuntimeConfig {
	api_key?: string;
	base_url?: string;
	authorization_header?: string;
	endpoint_types?: EndpointType[];
}

// ProviderConfig alias for request overrides (backward compatibility)
export type ProviderConfig = Pick<
	ProviderRuntimeConfig,
	"api_key" | "base_url" | "authorization_header"
>;

// Database model - stored provider configuration
export interface ProviderConfigurationRecord {
	id: number;
	project_id?: number;
	organization_id: string;
	provider_name: string;
	endpoint_types: EndpointType[];
	has_api_key: boolean; // Masked - actual key not exposed
	base_url?: string;
	has_authorization_header: boolean; // Just indicator, not the actual value
	enabled: boolean;
	created_at: string;
	updated_at: string;
	created_by: string;
	updated_by: string;
}

// Audit history for provider configuration changes
export interface ProviderConfigurationHistoryRecord {
	id: number;
	config_id: number;
	action: "created" | "updated" | "deleted";
	changes: string; // JSON string
	changed_by: string;
	changed_at: string;
}

// Frontend form types (what user sees in UI)
export interface CreateProviderFormData {
	provider_name: string;
	api_compatibility: ApiCompatibilityType; // User-friendly selection
	api_key: string;
	base_url?: string;
	authorization_header?: string;
}

export interface UpdateProviderFormData {
	api_compatibility?: ApiCompatibilityType;
	api_key?: string;
	base_url?: string;
	authorization_header?: string;
	enabled?: boolean;
}

// API request types (what gets sent to backend)
export interface CreateProviderApiRequest {
	provider_name: string;
	endpoint_types: EndpointType[]; // Backend expects endpoint_types
	api_key: string;
	base_url?: string;
	authorization_header?: string;
}

export interface UpdateProviderApiRequest {
	endpoint_types?: EndpointType[];
	api_key?: string;
	base_url?: string;
	authorization_header?: string;
	enabled?: boolean;
}

// Zod schemas for form validation
export const createProviderFormSchema = z.object({
	provider_name: z.string().min(1).max(100),
	api_compatibility: z.enum(apiCompatibilityTypes),
	api_key: z.string().min(1),
	base_url: z.string().optional(),
	authorization_header: z.string().optional(),
});

export const updateProviderFormSchema = z.object({
	api_compatibility: z.enum(apiCompatibilityTypes).optional(),
	api_key: z.string().optional(),
	base_url: z.string().optional(),
	authorization_header: z.string().optional(),
	enabled: z.boolean().optional(),
});

// API response - provider config with source (project vs org)
export interface ProviderConfigApiResponse {
	id: number;
	provider_name: string;
	endpoint_types: EndpointType[];
	base_url: string;
	has_api_key: boolean;
	has_authorization_header: boolean;
	enabled: boolean;
	source: "project" | "organization";
	created_at: string;
	updated_at: string;
	created_by: string;
	updated_by: string;
}

// API response - list of providers
export interface ListProvidersApiResponse {
	project_id?: number;
	organization_id?: string;
	providers: ProviderConfigApiResponse[];
}

// API response - single provider details
export interface GetProviderApiResponse {
	id: number;
	project_id?: number;
	organization_id: string;
	provider_name: string;
	endpoint_types: EndpointType[];
	has_api_key: boolean;
	base_url?: string;
	enabled: boolean;
	created_at: string;
	updated_at?: string;
	created_by: string;
	updated_by?: string;
}

// API response - provider history
export interface GetProviderHistoryApiResponse {
	config_id: number;
	history: ProviderConfigurationHistoryRecord[];
}

// Provider metadata with logos from /public/logos/
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
	gemini: {
		name: "gemini",
		displayName: "Google Gemini",
		logo: "/logos/google.svg",
		description: "Gemini 2.0 Flash, Pro models with multimodal capabilities",
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

// Fallback configuration (kept for backward compatibility)
export type FallbackMode = "sequential" | "race";

export interface FallbackConfig {
	enabled?: boolean;
	mode?: FallbackMode;
}

export const fallbackConfigSchema = z.object({
	enabled: z.boolean().optional(),
	mode: z.enum(["sequential", "race"]).optional(),
});
