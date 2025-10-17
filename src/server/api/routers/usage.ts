import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ApiKeysClient } from "@/lib/api/api-keys";
import { UsageClient } from "@/lib/api/usage";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

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
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new UsageClient(token);
				const { apiKeyId, ...params } = input;
				return await client.getUsageByAPIKey(apiKeyId, params);
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
		.query(async ({ ctx, input }) => {
			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new UsageClient(token);
				const { apiKeyId, ...params } = input;
				return await client.getUsageStats(apiKeyId, params);
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
		.query(async ({ ctx, input }) => {
			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ApiKeysClient(token);
				const { apiKeyId, startDate, endDate } = input;
				return await client.getUsage(apiKeyId, {
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
