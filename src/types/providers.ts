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
	"adaptive",
] as const;

export type ProviderType = (typeof providerEnum)[number];

// Define supported authentication types
export type AuthType = "bearer" | "api_key" | "basic" | "custom";

// Provider config interface
export interface ProviderConfig {
	api_key?: string;
	base_url?: string;
	auth_type?: AuthType;
	auth_header_name?: string;
	health_endpoint?: string;
	rate_limit_rpm?: number;
	timeout_ms?: number;
	retry_config?: Record<string, unknown>;
	headers?: Record<string, string>;
}

// Provider config Zod schema
export const providerConfigSchema = z.object({
	api_key: z.string().optional(),
	base_url: z.string().optional(),
	auth_type: z.enum(["bearer", "api_key", "basic", "custom"]).optional(),
	auth_header_name: z.string().optional(),
	health_endpoint: z.string().optional(),
	rate_limit_rpm: z.number().optional(),
	timeout_ms: z.number().optional(),
	retry_config: z.record(z.string(), z.unknown()).optional(),
	headers: z.record(z.string(), z.string()).optional(),
});

// Fallback configuration
export type FallbackMode = "sequential" | "race";

export interface FallbackConfig {
	enabled?: boolean;
	mode?: FallbackMode;
}

export const fallbackConfigSchema = z.object({
	enabled: z.boolean().optional(),
	mode: z.enum(["sequential", "race"]).optional(),
});
