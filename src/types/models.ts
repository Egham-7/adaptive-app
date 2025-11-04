import { z } from "zod";

// Model capability interface
export interface ModelCapability {
	description?: string;
	provider: string;
	model_name: string;
	cost_per_1m_input_tokens: number;
	cost_per_1m_output_tokens: number;
	max_context_tokens: number;
	max_output_tokens?: number;
	supports_function_calling: boolean;
	languages_supported?: string[];
	model_size_params?: string;
	latency_tier?: string;
	task_type?: string;
	complexity?: string;
}

// Model capability Zod schema (partial for flexible model selection)
export const modelCapabilitySchema = z
	.object({
		description: z.string().optional(),
		provider: z.string().optional(),
		model_name: z.string().optional(),
		cost_per_1m_input_tokens: z.number().optional(),
		cost_per_1m_output_tokens: z.number().optional(),
		max_context_tokens: z.number().optional(),
		max_output_tokens: z.number().optional(),
		supports_function_calling: z.boolean().optional(),
		languages_supported: z.array(z.string()).optional(),
		model_size_params: z.string().optional(),
		latency_tier: z.string().optional(),
		task_type: z.string().optional(),
		complexity: z.string().optional(),
	})
	.refine(
		(data) => {
			// Require at least one field to be defined
			const values = Object.values(data);
			return values.some((value) => value !== undefined);
		},
		{
			message: "At least one model capability attribute must be provided",
		},
	);

// Model router configuration
export interface ModelRouterConfig {
	models?: ModelCapability[];
	cost_bias?: number;
	complexity_threshold?: number;
	token_threshold?: number;
}

export const modelRouterConfigSchema = z.object({
	models: z.array(modelCapabilitySchema).optional(),
	cost_bias: z.number().min(0).max(1).optional(),
	complexity_threshold: z.number().optional(),
	token_threshold: z.number().optional(),
});

// Alternative model schema
export const alternativeSchema = z.object({
	provider: z.string(),
	model: z.string(),
});

export type Alternative = z.infer<typeof alternativeSchema>;

// Model Registry Types
// These types match the RegistryModel struct from adaptive-proxy and adaptive-model-registry

// Pricing schema - represents cost structure for model usage
export const registryModelPricingSchema = z.object({
	prompt: z.string(), // Cost per token for input (e.g., "0.000015")
	completion: z.string(), // Cost per token for output (e.g., "0.00012")
	request: z.string().optional(), // Cost per request (optional)
	image: z.string().optional(), // Cost per image (optional)
	image_output: z.string().optional(), // Cost per output image (optional)
	web_search: z.string().optional(), // Cost for web search (optional)
	internal_reasoning: z.string().optional(), // Cost for reasoning (optional)
	discount: z.number().optional(), // Discount percentage (optional)
});

// Architecture schema - represents model's architecture and capabilities
export const registryModelArchitectureSchema = z.object({
	modality: z.string(), // e.g., "text+image->text"
	input_modalities: z.array(z.string()), // e.g., ["text", "image"]
	output_modalities: z.array(z.string()), // e.g., ["text"]
	tokenizer: z.string(), // e.g., "Nova", "Llama3"
	instruct_type: z.string().nullable(), // e.g., "chatml" or null
});

// Top provider schema - represents the top provider's configuration
export const registryModelTopProviderSchema = z.object({
	context_length: z.number().nullable(), // Maximum context length
	max_completion_tokens: z.number().nullable(), // Maximum completion tokens
	is_moderated: z.boolean(), // Whether content is moderated
});

// Endpoint schema - represents a provider endpoint for the model
export const registryModelEndpointSchema = z.object({
	name: z.string(), // Full endpoint name
	model_name: z.string(), // Display model name
	context_length: z.number(), // Context length for this endpoint
	pricing: registryModelPricingSchema, // Pricing specific to this endpoint
	provider_name: z.string(), // Provider name
	tag: z.string(), // Provider tag/slug
	quantization: z.string().nullable(), // Quantization level (e.g., "int8")
	max_completion_tokens: z.number().nullable(), // Max completion tokens
	max_prompt_tokens: z.number().nullable(), // Max prompt tokens
	supported_parameters: z.array(z.string()), // Supported parameters
	status: z.number(), // Status code (0 = active)
	uptime_last_30m: z.number().nullable(), // Uptime percentage in last 30 minutes
	supports_implicit_caching: z.boolean(), // Whether implicit caching is supported
});

// Supported parameters - array of parameter names
export const registryModelSupportedParametersSchema = z.array(z.string());

// Default parameters - dynamic key-value map
export const registryModelDefaultParametersSchema = z.record(
	z.string(),
	z.any(),
);

// Endpoints - array of endpoint objects
export const registryModelEndpointsSchema = z.array(
	registryModelEndpointSchema,
);

// Complete registry model schema
export const registryModelSchema = z.object({
	id: z.number(),
	openrouter_id: z.string(),
	provider: z.string(),
	model_name: z.string(),
	display_name: z.string(),
	description: z.string(),
	context_length: z.number(),
	pricing: registryModelPricingSchema,
	architecture: registryModelArchitectureSchema,
	top_provider: registryModelTopProviderSchema,
	supported_parameters: registryModelSupportedParametersSchema,
	default_parameters: registryModelDefaultParametersSchema,
	endpoints: registryModelEndpointsSchema,
	created_at: z.string(),
	last_updated: z.string(),
});

// Type exports
export type RegistryModel = z.infer<typeof registryModelSchema>;
export type RegistryModelPricing = z.infer<typeof registryModelPricingSchema>;
export type RegistryModelArchitecture = z.infer<
	typeof registryModelArchitectureSchema
>;
export type RegistryModelTopProvider = z.infer<
	typeof registryModelTopProviderSchema
>;
export type RegistryModelEndpoint = z.infer<typeof registryModelEndpointSchema>;
export type RegistryModelSupportedParameters = z.infer<
	typeof registryModelSupportedParametersSchema
>;
export type RegistryModelDefaultParameters = z.infer<
	typeof registryModelDefaultParametersSchema
>;
export type RegistryModelEndpoints = z.infer<
	typeof registryModelEndpointsSchema
>;
