import { TRPCError } from "@trpc/server";
import { getOrganizationBalance, hasSufficientCredits } from "@/lib/credits";
import { apiKeyClient, parseMetadata } from "@/lib/api-keys";
import { findModelBySimilarity } from "@/lib/server/usage-utils";
import type { CacheTier } from "@/types/cache";

/**
 * Type for API key with project and organization included
 * NOTE: This type is for backward compatibility. API keys now come from Go backend.
 */
export type ApiKeyWithProject = {
	id: string;
	userId: string;
	projectId: string;
	project?: {
		organizationId: string;
		organization?: {
			id: string;
		};
	};
};

/**
 * Apply cache tier discount to base cost
 */
export function applyCacheTierDiscount(
	baseCost: number,
	cacheTier?: CacheTier,
): number {
	switch (cacheTier) {
		case "prompt_response":
			return 0; // Free for prompt_response cache hits
		case "semantic_exact":
		case "semantic_similar":
			return baseCost * 0.5; // 50% discount for semantic cache hits
		default:
			return baseCost;
	}
}

/**
 * Calculate provider cost based on token usage and pricing
 */
export function calculateProviderCost(
	providerModel: {
		inputTokenCost: { toNumber(): number };
		outputTokenCost: { toNumber(): number };
	} | null,
	promptTokens: number,
	completionTokens: number,
): number {
	if (!providerModel) return 0;

	return (
		(promptTokens * providerModel.inputTokenCost.toNumber() +
			completionTokens * providerModel.outputTokenCost.toNumber()) /
		1_000_000
	);
}

/**
 * Validate API key and return with project and organization data
 * NOTE: Now uses Go backend API for validation
 */
export async function validateApiKey(
	db: any,
	apiKey: string,
): Promise<ApiKeyWithProject> {
	// Validate API key with Go backend
	const result = await apiKeyClient.apiKeys.verify({ key: apiKey });

	if (!result.valid || !result.api_key_id) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: result.reason ?? "Invalid API key",
		});
	}

	// Parse metadata to get project and user info
	const meta = parseMetadata(result.metadata);

	if (!meta.projectId) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "API key is not associated with a project",
		});
	}

	// Get project and organization info from database
	const project = await db.project.findUnique({
		where: { id: meta.projectId },
		include: {
			organization: true,
		},
	});

	if (!project) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Project not found for API key",
		});
	}

	return {
		id: result.api_key_id.toString(),
		userId: meta.userId || "",
		projectId: meta.projectId,
		project: {
			organizationId: project.organizationId,
			organization: {
				id: project.organizationId,
			},
		},
	};
}

/**
 * Get organization ID from API key with validation
 */
export function getOrganizationId(apiKey: ApiKeyWithProject): string {
	const organizationId = apiKey.project?.organizationId;

	if (!organizationId) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "API key is not associated with an organization",
		});
	}

	return organizationId;
}

/**
 * Check if organization has sufficient credits
 */
export async function checkSufficientCredits(
	organizationId: string,
	creditCost: number,
): Promise<void> {
	if (creditCost <= 0) return; // Skip check for free operations

	const hasEnoughCredits = await hasSufficientCredits(
		organizationId,
		creditCost,
	);

	if (!hasEnoughCredits) {
		const currentBalance = await getOrganizationBalance(organizationId);
		throw new TRPCError({
			code: "PAYMENT_REQUIRED",
			message: `Insufficient credits. Required: $${creditCost.toFixed(4)}, Available: $${currentBalance.toFixed(4)}. Please purchase more credits.`,
		});
	}
}

/**
 * Get provider model with cost information
 */
export async function getProviderModel(
	db: any,
	provider: string | null,
	model: string | null,
): Promise<{
	inputTokenCost: { toNumber(): number };
	outputTokenCost: { toNumber(): number };
} | null> {
	if (!provider || !model) return null;

	try {
		const result = await findModelBySimilarity(db, model, provider);
		if (!result) return null;
		return {
			inputTokenCost: result.inputTokenCost,
			outputTokenCost: result.outputTokenCost,
		};
	} catch (error) {
		console.error("Error fetching provider model:", error);
		return null;
	}
}
