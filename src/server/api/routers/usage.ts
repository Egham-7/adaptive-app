import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ApiKeysClient } from "@/lib/api/api-keys";
import { UsageClient } from "@/lib/api/usage";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { UsageLog } from "@/types/api-keys";
import type { UsageByPeriod, UsageStats } from "@/types/usage";

const usageFiltersSchema = z.object({
	provider: z.string().optional(),
	endpoint: z.string().optional(),
	model: z.string().optional(),
	status: z.enum(["success", "client_error", "server_error"]).optional(),
});

type UsageFilters = z.infer<typeof usageFiltersSchema>;

/**
 * Usage router - Proxies usage tracking to adaptive-proxy
 *
 * All usage recording and analytics are handled by adaptive-proxy.
 * This router provides tRPC procedures that call the usage API.
 */
export const usageRouter = createTRPCRouter({
	/**
	 * Get usage records by API key ID
	 */
	getUsageByAPIKey: protectedProcedure
		.input(
			z.object({
				apiKeyId: z.number(),
				limit: z.number().optional(),
				offset: z.number().optional(),
				filters: usageFiltersSchema.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new UsageClient(token);
				const { apiKeyId, filters, ...params } = input;
				const records = await client.getUsageByAPIKey(apiKeyId, params);
				if (!filters) {
					return records;
				}
				return filterUsageRecords(records, filters);
			} catch (error) {
				console.error("Failed to get usage records:", error);

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Failed to get usage records",
					cause: error,
				});
			}
		}),

	/**
	 * Get usage statistics for an API key
	 */
	getUsageStats: protectedProcedure
		.input(
			z.object({
				apiKeyId: z.number(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				filters: usageFiltersSchema.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new UsageClient(token);
				const { apiKeyId, filters, ...params } = input;
				const baseStats = await client.getUsageStats(apiKeyId, params);

				if (!filters) {
					return baseStats;
				}

				const apiKeysClient = new ApiKeysClient(token);
				const usageResponse = await apiKeysClient.getUsage(apiKeyId, {
					start_date: params.startDate,
					end_date: params.endDate,
				});
				const filteredRecords = filterUsageRecords(usageResponse.data, filters);
				return aggregateUsageStats(filteredRecords);
			} catch (error) {
				console.error("Failed to get usage stats:", error);

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Failed to get usage stats",
					cause: error,
				});
			}
		}),

	/**
	 * Get usage grouped by time period
	 */
	getUsageByPeriod: protectedProcedure
		.input(
			z.object({
				apiKeyId: z.number(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				groupBy: z.enum(["day", "week", "month"]).optional(),
				filters: usageFiltersSchema.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ApiKeysClient(token);
				const {
					apiKeyId,
					startDate,
					endDate,
					groupBy = "day",
					filters,
				} = input;
				const usageResponse = await client.getUsage(apiKeyId, {
					start_date: startDate,
					end_date: endDate,
				});

				const filteredRecords = filters
					? filterUsageRecords(usageResponse.data, filters)
					: usageResponse.data;

				return groupUsageRecords(filteredRecords, groupBy);
			} catch (error) {
				console.error("Failed to get usage by period:", error);

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Failed to get usage by period",
					cause: error,
				});
			}
		}),
});

type UsageRecordLike = {
	provider?: string | null;
	model?: string | null;
	endpoint: string;
	status_code: number;
};

function matchesStatusFilter(
	statusCode: number,
	status?: UsageFilters["status"],
) {
	if (!status) return true;
	if (status === "success") return statusCode < 400;
	if (status === "client_error") return statusCode >= 400 && statusCode < 500;
	if (status === "server_error") return statusCode >= 500;
	return true;
}

function filterUsageRecords<T extends UsageRecordLike>(
	records: T[],
	filters?: UsageFilters,
): T[] {
	if (!filters) return records;

	return records.filter((record) => {
		if (
			filters.provider &&
			(record.provider ?? "").toLowerCase() !== filters.provider.toLowerCase()
		) {
			return false;
		}

		if (
			filters.model &&
			(record.model ?? "").toLowerCase() !== filters.model.toLowerCase()
		) {
			return false;
		}

		if (
			filters.endpoint &&
			!record.endpoint.toLowerCase().includes(filters.endpoint.toLowerCase())
		) {
			return false;
		}

		if (!matchesStatusFilter(record.status_code, filters.status)) {
			return false;
		}

		return true;
	});
}

function aggregateUsageStats(records: UsageLog[]): UsageStats {
	if (!records.length) {
		return {
			total_requests: 0,
			total_cost: 0,
			total_tokens: 0,
			success_requests: 0,
			failed_requests: 0,
			avg_latency_ms: 0,
		};
	}

	const totals = records.reduce(
		(acc, record) => {
			acc.totalCost += record.cost;
			acc.totalRequests += 1;
			acc.totalTokens += record.tokens_total ?? 0;
			acc.successfulRequests += record.status_code < 400 ? 1 : 0;
			if (record.latency_ms) {
				acc.latencySum += record.latency_ms;
				acc.latencySamples += 1;
			}
			return acc;
		},
		{
			totalCost: 0,
			totalRequests: 0,
			totalTokens: 0,
			successfulRequests: 0,
			latencySum: 0,
			latencySamples: 0,
		},
	);

	const avgLatency =
		totals.latencySamples > 0 ? totals.latencySum / totals.latencySamples : 0;

	return {
		total_requests: totals.totalRequests,
		total_cost: totals.totalCost,
		total_tokens: totals.totalTokens,
		success_requests: totals.successfulRequests,
		failed_requests: totals.totalRequests - totals.successfulRequests,
		avg_latency_ms: avgLatency,
	};
}

function groupUsageRecords(
	records: UsageLog[],
	groupBy: "day" | "week" | "month",
): UsageByPeriod[] {
	const groups = new Map<
		string,
		{
			totalCost: number;
			totalRequests: number;
			totalTokens: number;
			successfulRequests: number;
		}
	>();

	records.forEach((record) => {
		const date = new Date(record.timestamp);
		if (Number.isNaN(date.getTime())) return;

		const key = getGroupKey(date, groupBy);
		const entry = groups.get(key) ?? {
			totalCost: 0,
			totalRequests: 0,
			totalTokens: 0,
			successfulRequests: 0,
		};

		entry.totalCost += record.cost;
		entry.totalRequests += 1;
		entry.totalTokens += record.tokens_total ?? 0;
		entry.successfulRequests += record.status_code < 400 ? 1 : 0;

		groups.set(key, entry);
	});

	return Array.from(groups.entries())
		.map(([period, values]) => ({
			period,
			total_requests: values.totalRequests,
			total_cost: values.totalCost,
			total_tokens: values.totalTokens,
			success_requests: values.successfulRequests,
			failed_requests: values.totalRequests - values.successfulRequests,
		}))
		.sort((a, b) => a.period.localeCompare(b.period));
}

function getGroupKey(date: Date, groupBy: "day" | "week" | "month") {
	switch (groupBy) {
		case "week": {
			const week = getISOWeek(date);
			return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
		}
		case "month":
			return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
		default:
			return date.toISOString().slice(0, 10);
	}
}

function getISOWeek(date: Date) {
	const tmp = new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);
	const dayNum = tmp.getUTCDay() || 7;
	tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
	return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
