/**
 * Shared provider utilities for logos and display names
 */

export const getProviderDisplayName = (provider: string): string => {
	const nameMap: { [key: string]: string } = {
		anthropic: "Anthropic",
		openai: "OpenAI",
		meta: "Meta",
		"google-ai-studio": "Google AI Studio",
		google: "Google",
		"z-ai": "Z-AI",
	};
	return nameMap[provider.toLowerCase()] || provider;
};
