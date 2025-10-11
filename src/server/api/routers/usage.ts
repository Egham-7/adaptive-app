import { TRPCError } from "@trpc/server";
import { apiKeyClient, parseMetadata } from "@/lib/api-keys";
import {
	calculateCreditCost,
	deductCredits,
	getOrganizationBalance,
	hasSufficientCredits,
} from "@/lib/credits";
import { invalidateAnalyticsCache } from "@/lib/shared/cache";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
	createUsageMetadata,
	recordApiUsageInputSchema,
	recordErrorInputSchema,
} from "@/types/usage";

/**
 * Usage router for recording API usage and errors
 */
export const usageRouter = createTRPCRouter({
	// Record API usage for chat completions
	recordApiUsage: publicProcedure
		.input(recordApiUsageInputSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				// Validate API key with Go backend
				const verifyResult = await apiKeyClient.apiKeys.verify({
					key: input.apiKey,
				});

				if (!verifyResult.valid || !verifyResult.api_key_id) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: verifyResult.reason ?? "Invalid API key",
					});
				}

				const meta = parseMetadata(verifyResult.metadata);

				// Get project info for organizationId
				const project = await ctx.db.project.findUnique({
					where: { id: meta.projectId },
					select: { organizationId: true },
				});

				if (!project) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Project not found",
					});
				}

				const apiKey = {
					id: verifyResult.api_key_id,
					userId: meta.userId || "",
					projectId: meta.projectId || "",
				};
				const organizationId = project.organizationId;

				// Calculate costs
				const providerCost = 0; // Will be calculated by Go backend

				const creditCost = calculateCreditCost(
					input.usage.promptTokens,
					input.usage.completionTokens,
				);

				// Apply cache discount if needed
				const finalCreditCost =
					input.cacheTier === "prompt_response" ? 0 : creditCost;

				// Check credit balance before processing
				console.log("🔍 Checking credit balance before API usage.");
				const hasEnough = await hasSufficientCredits(
					organizationId,
					finalCreditCost,
				);
				if (!hasEnough) {
					const balance = await getOrganizationBalance(organizationId);
					throw new TRPCError({
						code: "PAYMENT_REQUIRED",
						message: `Insufficient credits. Required: $${finalCreditCost.toFixed(4)}, Available: $${balance.toFixed(4)}`,
					});
				}

				// Record the usage
				const usage = await ctx.db.apiUsage.create({
					data: {
						apiKeyId: apiKey.id,
						projectId: apiKey.projectId,
						provider: input.provider,
						model: input.model,
						requestType: "chat",
						inputTokens: input.usage.promptTokens,
						outputTokens: input.usage.completionTokens,
						totalTokens: input.usage.totalTokens,
						cost: providerCost,
						creditCost: finalCreditCost,
						requestCount: input.requestCount,
						metadata: createUsageMetadata(input, apiKey),
					},
				});

				// Handle credit deduction (only if cost > 0)
				const shouldDeductCredits = finalCreditCost > 0;
				if (shouldDeductCredits) {
					console.log("💸 Deducting credits for API usage.");
					await deductCredits({
						organizationId,
						userId: apiKey.userId,
						amount: finalCreditCost,
						description: `API usage: ${input.usage.promptTokens} input + ${input.usage.completionTokens} output tokens`,
						metadata: {
							provider: input.provider,
							model: input.model,
							inputTokens: input.usage.promptTokens,
							outputTokens: input.usage.completionTokens,
							duration: input.duration,
						},
						apiKeyId: apiKey.id,
						apiUsageId: usage.id,
					});
				} else {
					console.log(
						"🎯 No credit deduction needed - cached response or zero cost.",
					);
				}

				// Invalidate analytics cache
				// Note: API key last_used_at is now tracked automatically by the Go backend
				await invalidateAnalyticsCache(
					apiKey.userId,
					apiKey.projectId || undefined,
				);

				console.log("✅ API usage recorded successfully.");

				return {
					success: true,
					usage,
					creditTransaction: shouldDeductCredits
						? {
								amount: finalCreditCost,
								processed: true,
							}
						: {
								amount: 0,
								processed: false,
								reason: "No cost - cached response",
							},
				};
			} catch (error) {
				console.error("Failed to record API usage:", error);

				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error ? error.message : "Failed to record usage",
					cause: error,
				});
			}
		}),

	// Record API errors
	recordError: publicProcedure
		.input(recordErrorInputSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				// Validate API key with Go backend
				const verifyResult = await apiKeyClient.apiKeys.verify({
					key: input.apiKey,
				});

				if (!verifyResult.valid || !verifyResult.api_key_id) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: verifyResult.reason ?? "Invalid API key",
					});
				}

				const meta = parseMetadata(verifyResult.metadata);

				const apiKey = {
					id: verifyResult.api_key_id,
					userId: meta.userId || "",
					projectId: meta.projectId || "",
				};

				// Record the error as usage with 0 tokens
				const usage = await ctx.db.apiUsage.create({
					data: {
						apiKeyId: apiKey.id,
						projectId: apiKey.projectId,
						provider: input.provider || "openai",
						model: input.model || "unknown",
						requestType: "chat",
						inputTokens: 0,
						outputTokens: 0,
						totalTokens: 0,
						cost: 0,
						requestCount: 1,
						metadata: {
							error: input.error,
							errorOnly: true,
							timestamp: input.timestamp,
							userId: apiKey.userId,
						},
					},
				});

				// Invalidate analytics cache
				await invalidateAnalyticsCache(
					apiKey.userId,
					apiKey.projectId || undefined,
				);

				return { success: true, usage };
			} catch (error) {
				console.error("Failed to record API error:", {
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
					input,
				});
				return { success: false, error: "Failed to record error" };
			}
		}),
});
