import { z } from "zod";

// Pricing schema - represents cost structure for model usage
export const registryModelPricingSchema = z.object({
	prompt_cost: z.string(), // Cost per token for input (e.g., "0.000015")
	completion_cost: z.string(), // Cost per token for output (e.g., "0.00012")
	request_cost: z.string().optional(), // Cost per request (optional)
	image_cost: z.string().optional(), // Cost per image (optional)
	web_search_cost: z.string().optional(), // Cost for web search (optional)
	internal_reasoning_cost: z.string().optional(), // Cost for reasoning (optional)
});

// Architecture modality schema - represents input/output modalities
export const registryModelArchitectureModalitySchema = z.object({
	id: z.number().optional(),
	architecture_id: z.number().optional(),
	modality_type: z.string(), // "input" or "output"
	modality_value: z.string(),
});

// Architecture schema - represents model's architecture and capabilities
export const registryModelArchitectureSchema = z.object({
	id: z.number().optional(),
	model_id: z.number().optional(),
	modality: z.string(), // e.g., "text+image->text"
	tokenizer: z.string(), // e.g., "Nova", "Llama3"
	instruct_type: z.string().optional(), // e.g., "chatml" or null
	modalities: z.array(registryModelArchitectureModalitySchema).optional(),
});

// Top provider schema - represents the top provider's configuration
export const registryModelTopProviderSchema = z.object({
	id: z.number().optional(),
	model_id: z.number().optional(),
	context_length: z.number().nullable(), // Maximum context length
	max_completion_tokens: z.number().nullable(), // Maximum completion tokens
	is_moderated: z.string().optional(), // Whether content is moderated (stored as "true"/"false")
});

// Endpoint pricing schema - represents endpoint-specific pricing
export const registryModelEndpointPricingSchema = z.object({
  id: z.number().optional(),
  endpoint_id: z.number().optional(),
  prompt_cost: z.string().optional(),
  completion_cost: z.string().optional(),
  request_cost: z.string().optional(),
  image_cost: z.string().optional(),
  image_output_cost: z.string().optional(),
  audio_cost: z.string().optional(),
  input_audio_cache_cost: z.string().optional(),
  input_cache_read_cost: z.string().optional(),
  input_cache_write_cost: z.string().optional(),
  discount: z.string().optional(),
});

// Endpoint schema - represents a provider endpoint for the model
export const registryModelEndpointSchema = z.object({
	id: z.number().optional(),
	model_id: z.number().optional(),
	name: z.string(), // Full endpoint name
	endpoint_model_name: z.string(), // Display model name
	context_length: z.number(), // Context length for this endpoint
	provider_name: z.string(), // Provider name
	tag: z.string(), // Provider tag/slug
	quantization: z.string().optional(), // Quantization level (e.g., "int8")
	max_completion_tokens: z.number().nullable(), // Max completion tokens
	max_prompt_tokens: z.number().nullable(), // Max prompt tokens
	status: z.number(), // Status code (0 = active)
	uptime_last_30m: z.string().optional(), // Uptime percentage in last 30 minutes (stored as string)
	supports_implicit_caching: z.string().optional(), // Whether implicit caching is supported (stored as "true"/"false")
	pricing: registryModelEndpointPricingSchema.optional(), // Pricing specific to this endpoint
});

// Supported parameters - array of parameter names with strict typing
export const registryModelSupportedParametersSchema = z.array(
  z.enum([
    'temperature',
    'top_p',
    'top_k',
    'min_p',
    'top_a',
    'frequency_penalty',
    'presence_penalty',
    'repetition_penalty',
    'top_logprobs',
    'seed',
    'max_tokens',
    'max_output_tokens',
    'max_completion_tokens',
    'response_format',
    'structured_outputs',
    'stop',
    'stop_sequences',
    'tools',
    'tool_choice',
    'parallel_tool_calls',
    'n',
    'candidate_count',
    'store',
    'logprobs',
    'logit_bias',
    'web_search_options',
    'include_reasoning',
    'reasoning',
  ])
);

// Default parameters - strongly typed object
export const registryModelDefaultParametersSchema = z.object({
  // Sampling parameters
  temperature: z.number().optional(),
  top_p: z.number().optional(),
  top_k: z.number().optional(),
  min_p: z.number().optional(),
  top_a: z.number().optional(),

  // Penalty parameters
  frequency_penalty: z.number().optional(),

  // Token and output parameters
  max_tokens: z.number().optional(),
  max_completion_tokens: z.number().optional(),
  top_logprobs: z.number().optional(),
  seed: z.number().optional(),

  // Control parameters
  n: z.number().optional(),
  stop_sequences: z.array(z.string()).optional(),
  parallel_tool_calls: z.boolean().optional(),
  store: z.boolean().optional(),
  logprobs: z.boolean().optional(),
}).optional();

// Endpoints - array of endpoint objects
export const registryModelEndpointsSchema = z.array(
	registryModelEndpointSchema,
);

// Complete registry model schema
export const registryModelSchema = z.object({
	id: z.number(),
	provider: z.string(),
	model_name: z.string(),
	display_name: z.string().optional(),
	description: z.string().optional(),
	context_length: z.number().optional(),
	created_at: z.string(),
	last_updated: z.string(),
	pricing: registryModelPricingSchema.optional(),
	architecture: registryModelArchitectureSchema.optional(),
	top_provider: registryModelTopProviderSchema.optional(),
	supported_parameters: registryModelSupportedParametersSchema.optional(),
	default_parameters: registryModelDefaultParametersSchema.optional(),
	endpoints: registryModelEndpointsSchema.optional(),
});

// Type exports
export type RegistryModel = z.infer<typeof registryModelSchema>;
export type RegistryModelPricing = z.infer<typeof registryModelPricingSchema>;
export type RegistryModelArchitecture = z.infer<
	typeof registryModelArchitectureSchema
>;
export type RegistryModelArchitectureModality = z.infer<
	typeof registryModelArchitectureModalitySchema
>;
export type RegistryModelTopProvider = z.infer<
	typeof registryModelTopProviderSchema
>;
export type RegistryModelEndpoint = z.infer<typeof registryModelEndpointSchema>;
export type RegistryModelEndpointPricing = z.infer<
	typeof registryModelEndpointPricingSchema
>;
export type RegistryModelSupportedParameters = z.infer<
	typeof registryModelSupportedParametersSchema
>;
export type RegistryModelDefaultParameters = z.infer<
	typeof registryModelDefaultParametersSchema
>;
export type RegistryModelEndpoints = z.infer<
	typeof registryModelEndpointsSchema
>;

// Model router configuration
export interface ModelRouterConfig {
	models?: string[];
	cost_bias?: number;
	complexity_threshold?: number;
	token_threshold?: number;
}

export const modelRouterConfigSchema = z.object({
	models: z.array(z.string()).optional(),
	cost_bias: z.number().min(0).max(1).optional(),
	complexity_threshold: z.number().optional(),
	token_threshold: z.number().optional(),
});

// ============================================================================
// REGISTRY FILTER TYPES
// ============================================================================

/**
 * Filter options for querying models from the registry
 * All array fields support multiple values (OR logic within field, AND logic between fields)
 */
export interface RegistryModelFilter {
	// Basic filters
	authors?: string[]; // Filter by author(s) - OR logic
	model_names?: string[]; // Filter by model name(s) - OR logic
	endpoint_tags?: string[]; // Filter by endpoint tag(s) - OR logic
	providers?: string[]; // Filter by provider name(s) - OR logic

	// Advanced filters
	input_modalities?: string[]; // Filter by input modality
	output_modalities?: string[]; // Filter by output modality
	min_context_length?: number; // Minimum context window
	max_prompt_cost?: string; // Max cost per prompt token
	max_completion_cost?: string; // Max cost per completion token
	supported_params?: string[]; // Required supported parameters
	status?: number; // Endpoint status filter
	quantizations?: string[]; // Filter by quantization

	// Index signature for compatibility with Record<string, unknown>
	[key: string]: unknown;
}
