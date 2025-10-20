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
			is_preset?: boolean;
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
