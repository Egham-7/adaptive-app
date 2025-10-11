import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { withCache } from "@/lib/shared/cache";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
	projectAnalyticsInputSchema,
	userAnalyticsInputSchema,
} from "@/types/analytics";

/**
 * Project analytics router for usage analytics and cost comparisons
 */
export const projectAnalyticsRouter = createTRPCRouter({
	// Get usage analytics for a project
	getProjectAnalytics: protectedProcedure
		.input(projectAnalyticsInputSchema)
		.query(async ({ ctx, input }) => {
			const userId = ctx.userId;

			const cacheKey = `project-analytics:${userId}:${
				input.projectId
			}:${JSON.stringify(input)}`;

			return withCache(cacheKey, async () => {
				try {
					// Ensure userId is available
					if (!userId) {
						throw new TRPCError({
							code: "UNAUTHORIZED",
							message: "User ID not found in context",
						});
					}
					// Verify user has access to the project
					const project = await ctx.db.project.findFirst({
						where: {
							id: input.projectId,
							OR: [
								{ members: { some: { userId } } },
								{ organization: { ownerId: userId } },
								{ organization: { members: { some: { userId } } } },
							],
						},
					});

					if (!project) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You don't have access to this project",
						});
					}

					// Use proper UTC dates to avoid timezone issues
					const now = new Date();
					const endDate = input.endDate ?? now;
					const startDate =
						input.startDate ??
						new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
					// Normalize to UTC day boundaries: [startUtc, endUtcExclusive)
					const startUtc = new Date(
						Date.UTC(
							startDate.getUTCFullYear(),
							startDate.getUTCMonth(),
							startDate.getUTCDate(),
						),
					);
					const endUtcExclusive = new Date(
						Date.UTC(
							endDate.getUTCFullYear(),
							endDate.getUTCMonth(),
							endDate.getUTCDate() + 1,
						),
					);

					const whereClause = {
						projectId: input.projectId,
						timestamp: {
							gte: startUtc,
							lt: endUtcExclusive,
						},
						...(input.provider && { provider: input.provider }),
					};

					// Zod schema for aggregate result
					const aggregateSchema = z.object({
						_sum: z.object({
							totalTokens: z.number().nullable(),
							cost: z
								.any()
								.nullable()
								.transform((val) => (val ? Number(val) : 0)),
							creditCost: z
								.any()
								.nullable()
								.transform((val) => (val ? Number(val) : 0)),
							requestCount: z.number().nullable(),
						}),
						_count: z.object({
							id: z.number().nullable(),
						}),
					});

					// Get total metrics
					const aggregateResult = await ctx.db.apiUsage.aggregate({
						where: whereClause,
						_sum: {
							totalTokens: true,
							cost: true,
							creditCost: true,
							requestCount: true,
						},
						_count: {
							id: true,
						},
					});

					const totalMetrics = aggregateSchema.parse(aggregateResult);

					const requestTypeUsageSchema = z.object({
						requestType: z.string(),
						_sum: z.object({
							totalTokens: z.number().nullable(),
							cost: z
								.any()
								.nullable()
								.transform((val) => (val ? Number(val) : 0)),
							requestCount: z.number().nullable(),
						}),
						_count: z.object({
							id: z.number(),
						}),
					});

					// Get usage by request type
					const requestTypeUsage = requestTypeUsageSchema.array().parse(
						await ctx.db.apiUsage.groupBy({
							by: ["requestType"],
							where: whereClause,
							_sum: {
								totalTokens: true,
								cost: true,
								requestCount: true,
							},
							_count: {
								id: true,
							},
						}),
					);

					// Get daily usage trends using Prisma ORM - fetch all usage records
					const allUsageRecords = await ctx.db.apiUsage.findMany({
						where: whereClause,
						select: {
							timestamp: true,
							totalTokens: true,
							inputTokens: true,
							outputTokens: true,
							cost: true,
							creditCost: true,
							requestCount: true,
						},
						orderBy: {
							timestamp: "asc",
						},
					});

					// Group by date in application code
					const dailyUsageMap = new Map<
						string,
						{
							totalTokens: number;
							inputTokens: number;
							outputTokens: number;
							cost: number;
							creditCost: number;
							requestCount: number;
						}
					>();

					for (const record of allUsageRecords) {
						// Extract date in UTC (YYYY-MM-DD)
						const dateKey = record.timestamp.toISOString().split("T")[0];
						if (!dateKey) continue;

						const existing = dailyUsageMap.get(dateKey) || {
							totalTokens: 0,
							inputTokens: 0,
							outputTokens: 0,
							cost: 0,
							creditCost: 0,
							requestCount: 0,
						};

						dailyUsageMap.set(dateKey, {
							totalTokens: existing.totalTokens + (record.totalTokens || 0),
							inputTokens: existing.inputTokens + (record.inputTokens || 0),
							outputTokens: existing.outputTokens + (record.outputTokens || 0),
							cost: existing.cost + (record.cost ? Number(record.cost) : 0),
							creditCost:
								existing.creditCost +
								(record.creditCost ? Number(record.creditCost) : 0),
							requestCount: existing.requestCount + (record.requestCount || 0),
						});
					}

					// Fill in missing dates with zero values
					const fillDateRange = (start: Date, end: Date) => {
						const result: Array<{
							timestamp: Date;
							_sum: {
								totalTokens: number;
								inputTokens: number;
								outputTokens: number;
								cost: number;
								creditCost: number;
								requestCount: number;
							};
						}> = [];

						const currentDate = new Date(start);
						while (currentDate < end) {
							const dateKey = currentDate.toISOString().split("T")[0];
							if (!dateKey) {
								currentDate.setUTCDate(currentDate.getUTCDate() + 1);
								continue;
							}

							const dayData = dailyUsageMap.get(dateKey) || {
								totalTokens: 0,
								inputTokens: 0,
								outputTokens: 0,
								cost: 0,
								creditCost: 0,
								requestCount: 0,
							};

							result.push({
								timestamp: new Date(currentDate),
								_sum: dayData,
							});

							currentDate.setUTCDate(currentDate.getUTCDate() + 1);
						}

						return result;
					};

					const dailyUsage = fillDateRange(startUtc, endUtcExclusive);

					// Calculate comparison costs using database provider pricing
					const totalSpend = totalMetrics._sum.creditCost ?? 0; // Use creditCost for customer spending

					// Get all providers with their pricing data
					const providers = await ctx.db.provider.findMany({
						where: {},
						include: {
							models: {
								where: {},
							},
						},
					});

					// Create a map of provider models for quick lookup
					const providerModelMap = new Map<
						string,
						Map<string, { inputTokenCost: number; outputTokenCost: number }>
					>();
					providers.forEach((provider) => {
						const modelMap = new Map<
							string,
							{ inputTokenCost: number; outputTokenCost: number }
						>();
						provider.models.forEach((model) => {
							modelMap.set(model.name, {
								inputTokenCost: model.inputTokenCost.toNumber(),
								outputTokenCost: model.outputTokenCost.toNumber(),
							});
						});
						providerModelMap.set(provider.name, modelMap);
					});

					// Pre-compute maximum cost per model across all providers
					const maxCostPerModel = new Map<
						string,
						{ inputCost: number; outputCost: number }
					>();

					for (const [_providerName, models] of providerModelMap.entries()) {
						for (const [modelName, modelPricing] of models.entries()) {
							const existing = maxCostPerModel.get(modelName);
							const inputCost = Number(modelPricing.inputTokenCost);
							const outputCost = Number(modelPricing.outputTokenCost);

							if (
								!existing ||
								inputCost > existing.inputCost ||
								outputCost > existing.outputCost
							) {
								maxCostPerModel.set(modelName, {
									inputCost: Math.max(inputCost, existing?.inputCost || 0),
									outputCost: Math.max(outputCost, existing?.outputCost || 0),
								});
							}
						}
					}

					// Get detailed usage data with model information for cost calculations
					const detailedUsage = await ctx.db.apiUsage.findMany({
						where: whereClause,
						select: {
							provider: true,
							model: true,
							inputTokens: true,
							outputTokens: true,
							cost: true,
						},
					});

					// Calculate what it would have cost if all usage went through a specific provider/model
					// This compares Adaptive's cost to direct provider costs
					const calculateModelCostFromProvider = (
						targetModelName: string,
						targetProvider: string,
					) => {
						const targetProviderModels = providerModelMap.get(targetProvider);
						if (!targetProviderModels) return 0;

						const modelPricing = targetProviderModels.get(targetModelName);
						if (!modelPricing) return 0;

						// Apply target provider's pricing to ALL actual usage tokens
						return detailedUsage.reduce((sum, usage) => {
							// Apply target pricing to all token usage regardless of source model
							return (
								sum +
								((usage.inputTokens * modelPricing.inputTokenCost) / 1000000 +
									(usage.outputTokens * modelPricing.outputTokenCost) / 1000000)
							);
						}, 0);
					};

					// Get all unique model-provider combinations
					const modelProviderCombinations: Array<{
						model: string;
						provider: string;
						pricing: { inputTokenCost: number; outputTokenCost: number };
					}> = [];

					for (const [providerName, models] of providerModelMap.entries()) {
						for (const [modelName, pricing] of models.entries()) {
							modelProviderCombinations.push({
								model: modelName,
								provider: providerName,
								pricing,
							});
						}
					}

					const modelProviderBreakdown = modelProviderCombinations.map(
						({ model, provider, pricing }) => {
							const estimatedCost = calculateModelCostFromProvider(
								model,
								provider,
							);
							const savings = Math.max(0, estimatedCost - totalSpend);
							const savingsPercentage =
								estimatedCost > 0 ? (savings / estimatedCost) * 100 : 0;

							return {
								model,
								provider,
								estimatedCost,
								savings,
								savingsPercentage,
								pricing: {
									inputCost: pricing.inputTokenCost,
									outputCost: pricing.outputTokenCost,
								},
							};
						},
					);

					// Calculate total comparison cost (use average of all combinations)
					const totalEstimatedCost =
						modelProviderBreakdown.length > 0
							? modelProviderBreakdown.reduce(
									(sum, combo) => sum + combo.estimatedCost,
									0,
								) / modelProviderBreakdown.length
							: 0;

					const totalSavings = Math.max(0, totalEstimatedCost - totalSpend);
					const totalSavingsPercentage =
						totalEstimatedCost > 0
							? (totalSavings / totalEstimatedCost) * 100
							: 0;

					// Calculate error rate data - find all entries where metadata.error exists
					const errorUsage = await ctx.db.apiUsage.findMany({
						where: {
							...whereClause,
							metadata: {
								path: ["error"],
								not: "null",
							},
						},
						select: {
							timestamp: true,
						},
					});

					const totalCalls = totalMetrics._count.id ?? 0;
					const errorCount = errorUsage.length;
					const errorRate =
						totalCalls > 0 ? (errorCount / totalCalls) * 100 : 0;

					// Group errors by day for trend analysis
					const errorsByDay = errorUsage.reduce(
						(acc, usage) => {
							const dateKey = usage.timestamp.toISOString().split("T")[0];
							if (dateKey) {
								acc[dateKey] = (acc[dateKey] || 0) + 1;
							}
							return acc;
						},
						{} as Record<string, number>,
					);

					return {
						totalSpend,
						totalTokens: totalMetrics._sum.totalTokens ?? 0,
						totalRequests: totalMetrics._sum.requestCount ?? 0,
						totalApiCalls: totalCalls,
						totalEstimatedCost,
						totalSavings,
						totalSavingsPercentage,
						errorRate,
						errorCount,
						modelProviderBreakdown,
						requestTypeBreakdown: requestTypeUsage.map((usage) => ({
							type: usage.requestType,
							spend: usage._sum.cost ?? 0,
							tokens: usage._sum.totalTokens ?? 0,
							requests: usage._sum.requestCount ?? 0,
							calls: usage._count.id,
						})),
						dailyTrends: dailyUsage.map((usage) => {
							const dateKey = usage.timestamp.toISOString().split("T")[0];
							return {
								date: usage.timestamp,
								spend: usage._sum.creditCost ?? 0, // ← Use creditCost for customer spending
								providerCost: usage._sum.cost ?? 0, // ← Keep provider cost for admin
								tokens: usage._sum.totalTokens ?? 0,
								inputTokens: usage._sum.inputTokens ?? 0, // ← Add input tokens
								outputTokens: usage._sum.outputTokens ?? 0, // ← Add output tokens
								requests: usage._sum.requestCount ?? 0,
								errorCount: dateKey ? errorsByDay[dateKey] || 0 : 0,
							};
						}),
					};
				} catch (error) {
					console.error("Error fetching project analytics:", error);
					if (error instanceof TRPCError) {
						throw error;
					}
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message:
							error instanceof Error
								? error.message
								: "Failed to fetch project analytics",
						cause: error,
					});
				}
			});
		}),

	// Get usage analytics for a user across all projects
	getUserAnalytics: protectedProcedure
		.input(userAnalyticsInputSchema)
		.query(async ({ ctx, input }) => {
			const userId = ctx.userId;
			const cacheKey = `user-analytics:${userId}:${JSON.stringify(input)}`;

			return withCache(cacheKey, async () => {
				try {
					// Use proper UTC dates to avoid timezone issues
					const now = new Date();
					const endDate = input.endDate ?? now;
					const startDate =
						input.startDate ??
						new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
					const startUtc = new Date(
						Date.UTC(
							startDate.getUTCFullYear(),
							startDate.getUTCMonth(),
							startDate.getUTCDate(),
						),
					);
					const endUtcExclusive = new Date(
						Date.UTC(
							endDate.getUTCFullYear(),
							endDate.getUTCMonth(),
							endDate.getUTCDate() + 1,
						),
					);

					const whereClause = {
						timestamp: { gte: startUtc, lt: endUtcExclusive },
						...(input.provider && { provider: input.provider }),
						OR: [
							{ apiKey: { userId } },
							{
								apiKeyId: null,
								metadata: { path: ["userId"], equals: userId },
							},
						],
					};

					// Zod schema for aggregate result
					const aggregateSchema = z.object({
						_sum: z.object({
							totalTokens: z.number().nullable(),
							cost: z
								.any()
								.nullable()
								.transform((val) => (val ? Number(val) : 0)),
							creditCost: z
								.any()
								.nullable()
								.transform((val) => (val ? Number(val) : 0)),
							requestCount: z.number().nullable(),
						}),
						_count: z.object({
							id: z.number().nullable(),
						}),
					});

					// Get total metrics
					const totalMetrics = aggregateSchema.parse(
						await ctx.db.apiUsage.aggregate({
							where: whereClause,
							_sum: {
								totalTokens: true,
								cost: true,
								creditCost: true,
								requestCount: true,
							},
							_count: {
								id: true,
							},
						}),
					);

					const projectUsageSchema = z.object({
						projectId: z.string(),
						_sum: z.object({
							totalTokens: z.number().nullable(),
							cost: z
								.any()
								.nullable()
								.transform((val) => (val ? Number(val) : 0)),
							creditCost: z
								.any()
								.nullable()
								.transform((val) => (val ? Number(val) : 0)),
							requestCount: z.number().nullable(),
						}),
						_count: z.object({
							id: z.number(),
						}),
					});

					const projectUsage = projectUsageSchema.array().parse(
						await ctx.db.apiUsage.groupBy({
							by: ["projectId"],
							where: whereClause,
							_sum: {
								totalTokens: true,
								cost: true,
								creditCost: true,
								requestCount: true,
							},
							_count: {
								id: true,
							},
						}),
					);

					// Get project details for the usage
					const projectIds = projectUsage
						.map((usage) => usage.projectId)
						.filter(Boolean) as string[];
					const projects = await ctx.db.project.findMany({
						where: { id: { in: projectIds } },
						select: { id: true, name: true },
					});

					return {
						totalSpend: totalMetrics._sum.creditCost ?? 0,
						totalTokens: totalMetrics._sum.totalTokens ?? 0,
						totalRequests: totalMetrics._sum.requestCount ?? 0,
						totalApiCalls: totalMetrics._count.id ?? 0,
						projectBreakdown: projectUsage.map((usage) => {
							const project = projects.find((p) => p.id === usage.projectId);
							return {
								projectId: usage.projectId,
								projectName: project?.name || "Unknown Project",
								spend: usage._sum.creditCost ?? 0,
								tokens: usage._sum.totalTokens ?? 0,
								requests: usage._sum.requestCount ?? 0,
								calls: usage._count.id,
							};
						}),
					};
				} catch (error) {
					console.error("Error fetching user analytics:", error);
					if (error instanceof TRPCError) {
						throw error;
					}
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message:
							error instanceof Error
								? error.message
								: "Failed to fetch user analytics",
						cause: error,
					});
				}
			});
		}),
});
