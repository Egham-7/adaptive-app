import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { apiKeysClient } from "@/lib/api/api-keys";
import { usageClient } from "@/lib/api/usage";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { recordUsageRequestSchema } from "@/types/usage";

/**
 * Usage router - Proxies usage tracking to adaptive-proxy
 *
 * All usage recording and analytics are handled by adaptive-proxy.
 * This router provides tRPC procedures that call the usage API.
 */
export const usageRouter = createTRPCRouter({
	/**
	 * Record API usage - proxies to adaptive-proxy
	 */
	recordUsage: protectedProcedure
		.input(recordUsageRequestSchema)
		.mutation(async ({ input }) => {
			try {
				const record = await usageClient.recordUsage(input);
				return {
					success: true,
					usage: record,
				};
			} catch (error) {
				console.error("Failed to record usage:", error);

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

	/**
	 * Get usage records by API key ID
	 */
	getUsageByAPIKey: protectedProcedure
		.input(
			z.object({
				apiKeyId: z.number(),
				limit: z.number().optional(),
				offset: z.number().optional(),
			}),
		)
		.query(async ({ input }) => {
			try {
				const { apiKeyId, ...params } = input;
				return await usageClient.getUsageByAPIKey(apiKeyId, params);
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
			}),
		)
		.query(async ({ input }) => {
			try {
				const { apiKeyId, ...params } = input;
				return await usageClient.getUsageStats(apiKeyId, params);
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
			}),
		)
		.query(async ({ input }) => {
			try {
				const { apiKeyId, startDate, endDate } = input;
				return await apiKeysClient.getUsage(apiKeyId, {
					start_date: startDate,
					end_date: endDate,
				});
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
