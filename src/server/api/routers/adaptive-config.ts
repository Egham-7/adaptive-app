import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AdaptiveConfigClient } from "@/lib/api/adaptive-config";
import {
	isBadRequestError,
	isConflictError,
	isForbiddenError,
	isNotFoundError,
} from "@/lib/api/helpers/error-helpers";
import {
	invalidateProjectAdaptiveConfigCache,
	invalidateProjectCache,
	withCache,
} from "@/lib/shared/cache";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
	createAdaptiveConfigSchema,
	updateAdaptiveConfigSchema,
} from "@/types/adaptive-config";

/**
 * Maps error messages to TRPC error codes and user-friendly messages
 */
function handleAdaptiveConfigError(error: unknown, operation: string): never {
	console.error(`Error ${operation}:`, error);

	if (error instanceof Error) {
		if (isForbiddenError(error)) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"You don't have permission to perform this action. Organization-level configs require admin access.",
			});
		}

		if (isConflictError(error)) {
			throw new TRPCError({
				code: "CONFLICT",
				message: "Adaptive configuration already exists",
			});
		}

		if (isBadRequestError(error)) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: error.message, // Use exact error message from API
			});
		}
	}

	throw new TRPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: `Failed to ${operation}`,
	});
}

export const adaptiveConfigRouter = createTRPCRouter({
	// ==================== Project-level Adaptive Configs ====================

	/**
	 * Get the resolved adaptive configuration for a project
	 */
	getProjectAdaptiveConfig: protectedProcedure
		.input(z.object({ projectId: z.number() }))
		.query(async ({ ctx, input }) => {
			const cacheKey = `adaptive-config:project:${input.projectId}`;

			return withCache(cacheKey, async () => {
				try {
					const token = await ctx.clerkAuth.getToken();
					if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

					const client = new AdaptiveConfigClient(token);
					const response = await client.getProjectAdaptiveConfig(
						input.projectId,
					);
					return response;
				} catch (error) {
					// Check if it's a 404 - return null instead of throwing
					if (isNotFoundError(error)) {
						return null;
					}
					// Only throw for actual errors
					handleAdaptiveConfigError(error, "fetch adaptive configuration");
				}
			});
		}),

	/**
	 * Create an adaptive configuration for a project
	 */
	createProjectAdaptiveConfig: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				data: createAdaptiveConfigSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new AdaptiveConfigClient(token);
				const config = await client.createProjectAdaptiveConfig(
					input.projectId,
					input.data,
				);

				// Invalidate project cache
				await invalidateProjectCache(userId, input.projectId.toString());
				// Invalidate adaptive config cache
				await invalidateProjectAdaptiveConfigCache(input.projectId);

				return config;
			} catch (error) {
				handleAdaptiveConfigError(
					error,
					"create project adaptive configuration",
				);
			}
		}),

	/**
	 * Update an adaptive configuration for a project
	 */
	updateProjectAdaptiveConfig: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				data: updateAdaptiveConfigSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new AdaptiveConfigClient(token);
				const config = await client.updateProjectAdaptiveConfig(
					input.projectId,
					input.data,
				);

				// Invalidate project cache
				await invalidateProjectCache(userId, input.projectId.toString());
				// Invalidate adaptive config cache
				await invalidateProjectAdaptiveConfigCache(input.projectId);

				return config;
			} catch (error) {
				handleAdaptiveConfigError(
					error,
					"update project adaptive configuration",
				);
			}
		}),

	/**
	 * Delete an adaptive configuration for a project
	 */
	deleteProjectAdaptiveConfig: protectedProcedure
		.input(z.object({ projectId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new AdaptiveConfigClient(token);
				await client.deleteProjectAdaptiveConfig(input.projectId);

				// Invalidate project cache
				await invalidateProjectCache(userId, input.projectId.toString());
				// Invalidate adaptive config cache
				await invalidateProjectAdaptiveConfigCache(input.projectId);

				return { success: true };
			} catch (error) {
				handleAdaptiveConfigError(
					error,
					"delete project adaptive configuration",
				);
			}
		}),

	// ==================== Configuration History ====================

	/**
	 * Get audit history for an adaptive configuration
	 */
	getAdaptiveConfigHistory: protectedProcedure
		.input(z.object({ configId: z.number() }))
		.query(async ({ ctx, input }) => {
			const cacheKey = `adaptive-config-history:${input.configId}`;

			return withCache(cacheKey, async () => {
				try {
					const token = await ctx.clerkAuth.getToken();
					if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

					const client = new AdaptiveConfigClient(token);
					const response = await client.getAdaptiveConfigHistory(
						input.configId,
					);
					return response;
				} catch (error) {
					handleAdaptiveConfigError(error, "fetch configuration history");
				}
			});
		}),
});
