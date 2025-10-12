import { TRPCError } from "@trpc/server";
import { apiKeysClient } from "@/lib/api/api-keys";
import { withCache } from "@/lib/shared/cache";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
	projectAnalyticsInputSchema,
	userAnalyticsInputSchema,
} from "@/types/analytics";

/**
 * Project analytics router for usage analytics and cost comparisons
 * Now uses usageClient to fetch data from adaptive-proxy
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

					// Get API keys for this project from adaptive-proxy
					const apiKeysResponse = await apiKeysClient.listByProjectId(
						input.projectId,
					);
					const apiKeys = apiKeysResponse.data;

					if (!apiKeys || apiKeys.length === 0) {
						return {
							totalSpend: 0,
							totalTokens: 0,
							totalRequests: 0,
							totalApiCalls: 0,
							errorRate: 0,
							errorCount: 0,
							requestTypeBreakdown: [],
							dailyTrends: [],
						};
					}

					// Use proper UTC dates to avoid timezone issues
					const now = new Date();
					const endDate = input.endDate ?? now;
					const startDate =
						input.startDate ??
						new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

					// Format dates for API
					const startDateStr = startDate.toISOString();
					const endDateStr = endDate.toISOString();

					// Fetch usage stats and daily trends for all API keys in this project
					const usagePromises = apiKeys.map((apiKey) =>
						Promise.all([
							apiKeysClient.getStats(apiKey.id, {
								start_date: startDateStr,
								end_date: endDateStr,
							}),
							apiKeysClient.getUsage(apiKey.id, {
								start_date: startDateStr,
								end_date: endDateStr,
							}),
						]),
					);

					const usageResults = await Promise.all(usagePromises);

					// Aggregate the results
					let totalSpend = 0;
					let totalTokens = 0;
					let totalRequests = 0;
					let errorCount = 0;
					const endpointBreakdown = new Map<
						string,
						{ count: number; cost: number }
					>();
					const dailyTrendsMap = new Map<
						string,
						{
							spend: number;
							requests: number;
							tokens: number;
							errorCount: number;
						}
					>();

					for (let i = 0; i < usageResults.length; i++) {
						const [statsResult, usageResult] = usageResults[i] ?? [];
						if (!statsResult) continue;

						const overall = statsResult.overall;
						totalSpend += overall.total_cost;
						totalTokens += overall.total_tokens ?? 0;
						totalRequests += overall.total_requests;
						errorCount += overall.error_count ?? 0;

						// Aggregate by endpoint
						for (const endpoint of statsResult.by_endpoint) {
							const existing = endpointBreakdown.get(endpoint.endpoint) || {
								count: 0,
								cost: 0,
							};
							endpointBreakdown.set(endpoint.endpoint, {
								count: existing.count + endpoint.request_count,
								cost: existing.cost + endpoint.total_cost,
							});
						}

						// Aggregate daily trends
						if (usageResult?.data) {
							for (const dayData of usageResult.data) {
								const existing = dailyTrendsMap.get(dayData.timestamp) || {
									spend: 0,
									requests: 0,
									tokens: 0,
									errorCount: 0,
								};
								dailyTrendsMap.set(dayData.timestamp, {
									spend: existing.spend + dayData.cost,
									requests: existing.requests + 1,
									tokens: existing.tokens + 0,
									errorCount:
										existing.errorCount + (dayData.status_code >= 400 ? 1 : 0),
								});
							}
						}
					}

					// Build request type breakdown
					const requestTypeBreakdown = Array.from(endpointBreakdown.entries())
						.map(([endpoint, data]) => ({
							type: endpoint,
							count: data.count,
							cost: data.cost,
						}))
						.sort((a, b) => b.count - a.count);

					// Build daily trends array sorted by date
					const dailyTrends = Array.from(dailyTrendsMap.entries())
						.map(([period, data]) => ({
							date: new Date(period),
							spend: data.spend,
							requests: data.requests,
							tokens: data.tokens,
							errorCount: data.errorCount,
						}))
						.sort((a, b) => a.date.getTime() - b.date.getTime());

					const errorRate =
						totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

					return {
						totalSpend,
						totalTokens,
						totalRequests,
						totalApiCalls: totalRequests,
						errorRate,
						errorCount,
						requestTypeBreakdown,
						dailyTrends,
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

					// Format dates for API
					const startDateStr = startDate.toISOString();
					const endDateStr = endDate.toISOString();

					// Get all API keys for the user
					const apiKeysResponse = await apiKeysClient.listByUserId(userId);
					const apiKeys = apiKeysResponse.data;

					if (!apiKeys || apiKeys.length === 0) {
						return {
							totalSpend: 0,
							totalTokens: 0,
							totalRequests: 0,
							totalApiCalls: 0,
							projectBreakdown: [],
						};
					}

					// Fetch usage stats for all API keys
					const usagePromises = apiKeys.map((apiKey) =>
						apiKeysClient.getStats(apiKey.id, {
							start_date: startDateStr,
							end_date: endDateStr,
						}),
					);

					const usageResults = await Promise.all(usagePromises);

					// Aggregate by project
					let totalSpend = 0;
					let totalTokens = 0;
					let totalRequests = 0;
					const projectMap = new Map<
						string,
						{ spend: number; requests: number; tokens: number }
					>();

					for (let i = 0; i < usageResults.length; i++) {
						const result = usageResults[i];
						const apiKey = apiKeys[i];
						if (!apiKey || !result) continue;

						const overall = result.overall;

						totalSpend += overall.total_cost;
						totalTokens += overall.total_tokens || 0;
						totalRequests += overall.total_requests;

						// Aggregate by project
						const projectId = apiKey.project_id ?? "unknown";
						const existing = projectMap.get(projectId) || {
							spend: 0,
							requests: 0,
							tokens: 0,
						};
						projectMap.set(projectId, {
							spend: existing.spend + overall.total_cost,
							requests: existing.requests + overall.total_requests,
							tokens: existing.tokens + (overall.total_tokens || 0),
						});
					}

					// Build project breakdown
					const projectBreakdown = Array.from(projectMap.entries())
						.map(([projectId, data]) => ({
							projectId,
							spend: data.spend,
							requests: data.requests,
							tokens: data.tokens,
						}))
						.sort((a, b) => b.spend - a.spend);

					return {
						totalSpend,
						totalTokens,
						totalRequests,
						totalApiCalls: totalRequests,
						projectBreakdown,
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
