import type {
	GenerateContentParameters,
	GenerateContentResponse,
	GenerateContentResponseUsageMetadata,
} from "@google/genai";
import type { CacheTier } from "./cache";
import type { ProviderConfig } from "./providers";

// Extended request type with Adaptive-specific fields
export interface AdaptiveGeminiRequest extends GenerateContentParameters {
	// Adaptive-specific extensions (passed through to backend)
	provider_configs?: Record<string, ProviderConfig>;
	model_router?: Record<string, unknown>;
	semantic_cache?: {
		enabled: boolean;
		semantic_threshold: number;
	};
	prompt_cache?: Record<string, unknown>;
	fallback?: Record<string, unknown>;
}

// Extended response types with Adaptive features - keep Gemini format
export interface AdaptiveGeminiResponse extends GenerateContentResponse {
	// Adaptive-specific extensions
	provider: string;
}

export interface AdaptiveGeminiUsage
	extends GenerateContentResponseUsageMetadata {
	cache_tier?: CacheTier;
}

// Streaming chunk type extending the official SDK streaming response
export interface AdaptiveGeminiChunk extends GenerateContentResponse {
	// Adaptive-specific extensions
	provider: string;
	usageMetadata?: AdaptiveGeminiUsage;
}

export type { ProviderConfig };
