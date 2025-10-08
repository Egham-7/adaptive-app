import crypto from "node:crypto";
import type { PrismaClient } from "prisma/generated";
import type {
	ChatCompletionChunk,
	ChatCompletionRequest,
} from "@/types/chat-completion";

// Helper function to hash API keys consistently
export const hashApiKey = (apiKey: string): string => {
	return crypto.createHash("sha256").update(apiKey).digest("hex");
};

// Helper function to get common prefix between two strings
export const getCommonPrefix = (str1: string, str2: string): string => {
	let i = 0;
	while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
		i++;
	}
	return str1.substring(0, i);
};

// Helper function to find best matching model by similarity
export const findModelBySimilarity = async (
	db: PrismaClient,
	modelName: string,
	providerName: string,
) => {
	// First try exact match
	const exactMatch = await db.providerModel.findFirst({
		where: {
			name: modelName,
			provider: { name: providerName },
		},
		select: {
			inputTokenCost: true,
			outputTokenCost: true,
		},
	});

	if (exactMatch) return exactMatch;

	// If no exact match, get all models for the provider and find best similarity
	const allModels = await db.providerModel.findMany({
		where: {
			provider: { name: providerName },
		},
		select: {
			name: true,
			inputTokenCost: true,
			outputTokenCost: true,
		},
	});

	if (allModels.length === 0) return null;

	// Simple similarity scoring: check if model name contains the base name
	const baseModelName = modelName.toLowerCase();
	let bestMatch = allModels[0];
	let bestScore = 0;

	for (const model of allModels) {
		const modelDbName = model.name.toLowerCase();

		// Score based on:
		// 1. If the db model name is contained in the input model name
		// 2. If they share common prefixes
		let score = 0;

		if (baseModelName.includes(modelDbName)) {
			score += 10;
		} else if (modelDbName.includes(baseModelName)) {
			score += 8;
		}

		// Check for common prefixes (e.g., "gpt-4o" matches "gpt-4o-mini")
		const commonPrefix = getCommonPrefix(baseModelName, modelDbName);
		if (commonPrefix.length > 3) {
			score += commonPrefix.length;
		}

		if (score > bestScore) {
			bestScore = score;
			bestMatch = model;
		}
	}

	return bestScore > 0 ? bestMatch : null;
};

/**
 * Checks if the user requested usage data in the stream_options
 */
export const userRequestedUsage = (body: ChatCompletionRequest): boolean => {
	return body.stream_options?.include_usage === true;
};

/**
 * Adds usage tracking to the request body for internal processing
 */
export const withUsageTracking = (
	requestBody: ChatCompletionRequest,
): ChatCompletionRequest => ({
	...requestBody,
	stream_options: {
		...requestBody.stream_options,
		include_usage: true,
	},
});

/**
 * Filters usage information from chat completion chunk based on whether it should be included
 */
export const filterUsageFromChunk = (
	chunk: ChatCompletionChunk,
	includeUsage: boolean,
): ChatCompletionChunk =>
	includeUsage ? chunk : { ...chunk, usage: undefined };
