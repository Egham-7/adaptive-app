import { TRPCError } from "@trpc/server";
import { ApiKeysClient } from "@/lib/api/api-keys";
import { ProjectsClient } from "@/lib/api/projects";
import { withCache } from "@/lib/shared/cache";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
	projectAnalyticsInputSchema,
	userAnalyticsInputSchema,
} from "@/types/analytics";

const EMPTY_PROJECT_ANALYTICS = {
	totalSpend: 0,
	totalTokens: 0,
	totalRequests: 0,
	totalApiCalls: 0,
	errorRate: 0,
	errorCount: 0,
	requestTypeBreakdown: [],
	dailyTrends: [],
} as const;

const EMPTY_USER_ANALYTICS = {
	totalSpend: 0,
	totalTokens: 0,
	totalRequests: 0,
	totalApiCalls: 0,
	projectBreakdown: [],
} as const;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const projectAnalyticsRouter = createTRPCRouter({
	getProjectAnalytics: protectedProcedure
		.input(projectAnalyticsInputSchema)
		.query(async ({ ctx, input }) => {
			const { userId } = ctx;
			const cacheKey = `project-analytics:${userId}:${input.projectId}:${JSON.stringify(input)}`;

			return withCache(cacheKey, async () => {
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User ID not found in context",
					});
				}

				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const projectsClient = new ProjectsClient(token);
				try {
					await projectsClient.getById(input.projectId);
				} catch (_error) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You don't have access to this project",
					});
				}

				const client = new ApiKeysClient(token);
				const apiKeysResponse = await client.listByProjectId(input.projectId);
				const apiKeys = apiKeysResponse.data;

				if (!apiKeys?.length) {
					return EMPTY_PROJECT_ANALYTICS;
				}

				const now = new Date();
				const endDate = input.endDate ?? now;
				const startDate =
					input.startDate ?? new Date(endDate.getTime() - THIRTY_DAYS_MS);

				const startDateStr = startDate.toISOString();
				const endDateStr = endDate.toISOString();

				const usageResults = await Promise.all(
					apiKeys.map((apiKey) =>
						Promise.all([
							client.getStats(apiKey.id, {
								start_date: startDateStr,
								end_date: endDateStr,
							}),
							client.getUsage(apiKey.id, {
								start_date: startDateStr,
								end_date: endDateStr,
							}),
						]),
					),
				);

				const aggregated = usageResults.reduce(
					(acc, [statsResult, usageResult]) => {
						if (!statsResult) return acc;

						const { overall } = statsResult;
						acc.totalSpend += overall.total_cost;
						acc.totalTokens += overall.total_tokens ?? 0;
						acc.totalRequests += overall.total_requests;
						acc.errorCount += overall.error_count ?? 0;

						if (
							statsResult.by_endpoint &&
							Array.isArray(statsResult.by_endpoint)
						) {
							statsResult.by_endpoint.forEach((endpoint) => {
								const existing = acc.endpointBreakdown.get(
									endpoint.endpoint,
								) ?? {
									count: 0,
									cost: 0,
								};
								acc.endpointBreakdown.set(endpoint.endpoint, {
									count: existing.count + endpoint.request_count,
									cost: existing.cost + endpoint.total_cost,
								});
							});
						}

						if (usageResult?.data) {
							usageResult.data.forEach((dayData) => {
								const existing = acc.dailyTrendsMap.get(dayData.timestamp) ?? {
									spend: 0,
									requests: 0,
									tokens: 0,
									errorCount: 0,
								};
								acc.dailyTrendsMap.set(dayData.timestamp, {
									spend: existing.spend + dayData.cost,
									requests: existing.requests + 1,
									tokens: existing.tokens,
									errorCount:
										existing.errorCount + (dayData.status_code >= 400 ? 1 : 0),
								});
							});
						}

						return acc;
					},
					{
						totalSpend: 0,
						totalTokens: 0,
						totalRequests: 0,
						errorCount: 0,
						endpointBreakdown: new Map<
							string,
							{ count: number; cost: number }
						>(),
						dailyTrendsMap: new Map<
							string,
							{
								spend: number;
								requests: number;
								tokens: number;
								errorCount: number;
							}
						>(),
					},
				);

				const requestTypeBreakdown = Array.from(
					aggregated.endpointBreakdown.entries(),
				)
					.map(([endpoint, data]) => ({
						type: endpoint,
						count: data.count,
						cost: data.cost,
					}))
					.sort((a, b) => b.count - a.count);

				const dailyTrends = Array.from(aggregated.dailyTrendsMap.entries())
					.map(([period, data]) => ({
						date: new Date(period),
						spend: data.spend,
						requests: data.requests,
						tokens: data.tokens,
						errorCount: data.errorCount,
					}))
					.sort((a, b) => a.date.getTime() - b.date.getTime());

				const errorRate =
					aggregated.totalRequests > 0
						? (aggregated.errorCount / aggregated.totalRequests) * 100
						: 0;

				return {
					totalSpend: aggregated.totalSpend,
					totalTokens: aggregated.totalTokens,
					totalRequests: aggregated.totalRequests,
					totalApiCalls: aggregated.totalRequests,
					errorRate,
					errorCount: aggregated.errorCount,
					requestTypeBreakdown,
					dailyTrends,
				};
			});
		}),

	getUserAnalytics: protectedProcedure
		.input(userAnalyticsInputSchema)
		.query(async ({ ctx, input }) => {
			const { userId } = ctx;
			const cacheKey = `user-analytics:${userId}:${JSON.stringify(input)}`;

			return withCache(cacheKey, async () => {
				const now = new Date();
				const endDate = input.endDate ?? now;
				const startDate =
					input.startDate ?? new Date(endDate.getTime() - THIRTY_DAYS_MS);

				const startDateStr = startDate.toISOString();
				const endDateStr = endDate.toISOString();

				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ApiKeysClient(token);
				const apiKeysResponse = await client.listByUserId(userId);
				const apiKeys = apiKeysResponse.data;

				if (!apiKeys?.length) {
					return EMPTY_USER_ANALYTICS;
				}

				const usageResults = await Promise.all(
					apiKeys.map((apiKey) =>
						client.getStats(apiKey.id, {
							start_date: startDateStr,
							end_date: endDateStr,
						}),
					),
				);

				const aggregated = usageResults.reduce(
					(acc, result, index) => {
						const apiKey = apiKeys[index];
						if (!apiKey || !result) return acc;

						const { overall } = result;
						acc.totalSpend += overall.total_cost;
						acc.totalTokens += overall.total_tokens ?? 0;
						acc.totalRequests += overall.total_requests;

						const projectId = apiKey.project_id ?? "unknown";
						const existing = acc.projectMap.get(projectId) ?? {
							spend: 0,
							requests: 0,
							tokens: 0,
						};
						acc.projectMap.set(projectId, {
							spend: existing.spend + overall.total_cost,
							requests: existing.requests + overall.total_requests,
							tokens: existing.tokens + (overall.total_tokens ?? 0),
						});

						return acc;
					},
					{
						totalSpend: 0,
						totalTokens: 0,
						totalRequests: 0,
						projectMap: new Map<
							string,
							{ spend: number; requests: number; tokens: number }
						>(),
					},
				);

				const projectBreakdown = Array.from(aggregated.projectMap.entries())
					.map(([projectId, data]) => ({
						projectId,
						spend: data.spend,
						requests: data.requests,
						tokens: data.tokens,
					}))
					.sort((a, b) => b.spend - a.spend);

				return {
					totalSpend: aggregated.totalSpend,
					totalTokens: aggregated.totalTokens,
					totalRequests: aggregated.totalRequests,
					totalApiCalls: aggregated.totalRequests,
					projectBreakdown,
				};
			});
		}),
});
