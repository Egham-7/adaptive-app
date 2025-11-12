/**
 * Supported parameter names for model configuration
 * These are all the parameters that a model can support
 */
export const SUPPORTED_PARAMETERS = [
	// Sampling parameters
	"temperature",
	"top_p",
	"top_k",
	"min_p",
	"top_a",

	// Penalty parameters
	"frequency_penalty",
	"presence_penalty",
	"repetition_penalty",

	// Token and output parameters
	"top_logprobs",
	"seed",
	"max_tokens",
	"max_output_tokens",
	"max_completion_tokens",

	// Response format parameters
	"response_format",
	"structured_outputs",

	// Control parameters
	"stop",
	"stop_sequences",
	"tools",
	"tool_choice",
	"parallel_tool_calls",

	// Additional parameters
	"n",
	"candidate_count",
	"store",
	"logprobs",
	"logit_bias",
	"web_search_options",

	// Reasoning parameters
	"include_reasoning",
	"reasoning",
] as const;

export type SupportedParameter = (typeof SUPPORTED_PARAMETERS)[number];

/**
 * Default parameter names that can have default values
 * This is a subset of supported parameters
 */
export const DEFAULT_PARAMETERS = [
	"temperature",
	"top_p",
	"frequency_penalty",
] as const;

export type DefaultParameter = (typeof DEFAULT_PARAMETERS)[number];

/**
 * Type guard to check if a string is a valid supported parameter
 */
export function isValidSupportedParameter(
	param: string,
): param is SupportedParameter {
	return SUPPORTED_PARAMETERS.includes(param as SupportedParameter);
}

/**
 * Type guard to check if a string is a valid default parameter
 */
export function isValidDefaultParameter(
	param: string,
): param is DefaultParameter {
	return DEFAULT_PARAMETERS.includes(param as DefaultParameter);
}

/**
 * Strongly typed default parameter values structure
 */
export interface DefaultParameterValues {
	// Sampling parameters
	temperature?: number;
	top_p?: number;
	top_k?: number;
	min_p?: number;
	top_a?: number;

	// Penalty parameters
	frequency_penalty?: number;

	// Token and output parameters
	max_tokens?: number;
	max_completion_tokens?: number;
	top_logprobs?: number;
	seed?: number;

	// Control parameters
	n?: number;
	stop_sequences?: string[];
	parallel_tool_calls?: boolean;
	store?: boolean;
	logprobs?: boolean;
}

/**
 * Strongly typed supported parameter structure for API responses
 */
export interface SupportedParameterInfo {
	parameter_name: SupportedParameter;
}
