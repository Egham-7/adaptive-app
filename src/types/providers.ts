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

// Simplified provider config interface (matches backend structure)
export interface ProviderConfig {
	api_key?: string;
	base_url?: string;
	authorization_header?: string;
}

// Provider config Zod schema
export const providerConfigSchema = z.object({
	api_key: z.string().optional(),
	base_url: z.string().optional(),
	authorization_header: z.string().optional(),
});

// Database model types for provider configurations
export interface ProviderConfiguration {
	id: number;
	project_id?: number;
	organization_id: string;
	provider_name: string;
	has_api_key: boolean; // Masked - actual key not exposed
	base_url?: string;
	authorization_header?: boolean; // Just indicator, not the actual value
	created_at: string;
	updated_at: string;
	created_by: string;
	updated_by: string;
}

export interface ProviderConfigurationHistory {
	id: number;
	config_id: number;
	action: "created" | "updated" | "deleted";
	changes: string; // JSON string
	changed_by: string;
	changed_at: string;
}

// Request types for API operations
export interface ProviderConfigCreateRequest {
	provider_name: string;
	api_key: string;
	base_url?: string;
	authorization_header?: string;
}

export interface ProviderConfigUpdateRequest {
	api_key?: string;
	base_url?: string;
	authorization_header?: string;
}

export const providerConfigCreateRequestSchema = z.object({
	provider_name: z.string().min(1).max(100),
	api_key: z.string().min(1),
	base_url: z.string().optional(),
	authorization_header: z.string().optional(),
});

export const providerConfigUpdateRequestSchema = z.object({
	api_key: z.string().optional(),
	base_url: z.string().optional(),
	authorization_header: z.string().optional(),
});

// API Response types matching backend exactly
export interface ProviderConfigListResponse {
	project_id?: number;
	organization_id?: string;
	endpoint: string;
	providers: Record<
		string,
		{
			has_api_key: boolean;
			base_url?: string;
			authorization_header: boolean;
		}
	>;
}

export interface ProviderConfigResponse {
	id: number;
	project_id?: number;
	organization_id: string;
	provider_name: string;
	has_api_key: boolean;
	base_url?: string;
	created_at: string;
	updated_at?: string;
	created_by: string;
	updated_by?: string;
}

export interface ProviderConfigHistoryResponse {
	config_id: number;
	history: ProviderConfigurationHistory[];
}

// Provider metadata with logos from /public/logos/
export const PROVIDER_METADATA = {
	openai: {
		name: "openai",
		displayName: "OpenAI",
		logo: "/logos/openai.webp",
		description: "GPT-4, GPT-3.5, and other OpenAI models",
	},
	anthropic: {
		name: "anthropic",
		displayName: "Anthropic",
		logo: "/logos/anthropic.jpeg",
		description: "Claude 3.5 Sonnet, Claude 3 Opus, and other Anthropic models",
	},
	gemini: {
		name: "gemini",
		displayName: "Google Gemini",
		logo: "/logos/google.svg",
		description: "Gemini Pro, Gemini Ultra models",
	},
	deepseek: {
		name: "deepseek",
		displayName: "DeepSeek",
		logo: "/logos/deepseek.svg",
		description: "DeepSeek models for code and reasoning",
	},
	groq: {
		name: "groq",
		displayName: "Groq",
		logo: "/logos/groq.png",
		description: "Ultra-fast LLM inference with GroqChip",
	},
	grok: {
		name: "grok",
		displayName: "Grok",
		logo: "/logos/grok.svg",
		description: "xAI's Grok models",
	},
	huggingface: {
		name: "huggingface",
		displayName: "Hugging Face",
		logo: "/logos/huggingface.png",
		description: "Open-source models via Hugging Face Inference API",
	},
	cohere: {
		name: "cohere",
		displayName: "Cohere",
		logo: "/logos/cohere.png",
		description: "Command and Embed models",
	},
	mistral: {
		name: "mistral",
		displayName: "Mistral AI",
		logo: "/logos/mistral.png",
		description: "Mistral Large, Medium, and Small models",
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
