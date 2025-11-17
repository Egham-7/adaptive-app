import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ProviderConfigsClient } from "@/lib/api/provider-configs";
import { cleanEndpointOverrides } from "@/lib/providers/utils";
import {
	invalidateProjectCache,
	invalidateProviderConfigCache,
	withCache,
} from "@/lib/shared/cache";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
	type CreateProviderApiRequest,
	createProviderFormSchema,
	PROVIDER_ENDPOINT_CONFIG,
	type ProviderName,
	updateProviderFormSchema,
} from "@/types/providers";

export const providerConfigsRouter = createTRPCRouter({
	// ==================== Project-level Provider Configs ====================

	/**
	 * List all effective provider configurations for a project
	 */
	listProjectProviders: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				endpoint: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const cacheKey = `provider-configs:project:${input.projectId}:${input.endpoint ?? "default"}`;

			return withCache(cacheKey, async () => {
				try {
					const token = await ctx.clerkAuth.getToken();
					if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

					const client = new ProviderConfigsClient(token);
					const response = await client.listProjectProviders(
						input.projectId,
						input.endpoint,
					);
					return response;
				} catch (error) {
					console.error("Error fetching project provider configs:", error);
					if (error instanceof Error && error.message.includes("FORBIDDEN")) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You don't have access to this project",
						});
					}
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to fetch provider configurations",
					});
				}
			});
		}),

	/**
	 * Create a provider configuration for a project
	 */
	createProjectProvider: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				provider: z.string(),
				data: createProviderFormSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ProviderConfigsClient(token);

				// Convert form data to API request format
				const apiRequest: CreateProviderApiRequest = {
					...input.data,
					endpoint_types:
						input.data.endpoint_types ||
						PROVIDER_ENDPOINT_CONFIG[input.provider as ProviderName]
							?.supported_endpoints ||
						[],
					endpoint_overrides: cleanEndpointOverrides(
						input.data.endpoint_overrides,
					),
				};
				const config = await client.createProjectProvider(
					input.projectId,
					input.provider,
					apiRequest,
				);

				// Invalidate both project cache and provider-specific cache
				await Promise.all([
					invalidateProjectCache(userId, input.projectId.toString()),
					invalidateProviderConfigCache(
						input.projectId.toString(),
						input.provider,
					),
				]);

				return config;
			} catch (error) {
				console.error("Error creating project provider config:", error);
				if (error instanceof Error && error.message.includes("FORBIDDEN")) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You don't have permission to modify this project",
					});
				}
				if (
					error instanceof Error &&
					error.message.includes("already exists")
				) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Provider configuration already exists",
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create provider configuration",
				});
			}
		}),

	/**
	 * Update a provider configuration for a project
	 */
	updateProjectProvider: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				provider: z.string(),
				data: updateProviderFormSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ProviderConfigsClient(token);
				// Convert form data to API request format
				const apiRequest = {
					...input.data,
					endpoint_overrides: cleanEndpointOverrides(
						input.data.endpoint_overrides,
					),
				};
				const config = await client.updateProjectProvider(
					input.projectId,
					input.provider,
					apiRequest,
				);

				// Invalidate both project cache and provider-specific cache
				await Promise.all([
					invalidateProjectCache(userId, input.projectId.toString()),
					invalidateProviderConfigCache(
						input.projectId.toString(),
						input.provider,
					),
				]);

				return config;
			} catch (error) {
				console.error("Error updating project provider config:", error);
				if (error instanceof Error && error.message.includes("FORBIDDEN")) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You don't have permission to modify this project",
					});
				}
				if (error instanceof Error && error.message.includes("not found")) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Provider configuration not found",
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update provider configuration",
				});
			}
		}),

	/**
	 * Delete a provider configuration for a project
	 */
	deleteProjectProvider: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				provider: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ProviderConfigsClient(token);
				await client.deleteProjectProvider(input.projectId, input.provider);

				// Invalidate both project cache and provider-specific cache
				await Promise.all([
					invalidateProjectCache(userId, input.projectId.toString()),
					invalidateProviderConfigCache(
						input.projectId.toString(),
						input.provider,
					),
				]);

				return { success: true };
			} catch (error) {
				console.error("Error deleting project provider config:", error);
				if (error instanceof Error && error.message.includes("FORBIDDEN")) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You don't have permission to modify this project",
					});
				}
				if (error instanceof Error && error.message.includes("not found")) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Provider configuration not found",
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete provider configuration",
				});
			}
		}),

	// ==================== Configuration History ====================

	/**
	 * Get audit history for a provider configuration
	 */
	getProviderHistory: protectedProcedure
		.input(z.object({ configId: z.number() }))
		.query(async ({ ctx, input }) => {
			const cacheKey = `provider-config-history:${input.configId}`;

			return withCache(cacheKey, async () => {
				try {
					const token = await ctx.clerkAuth.getToken();
					if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

					const client = new ProviderConfigsClient(token);
					const response = await client.getProviderHistory(input.configId);
					return response;
				} catch (error) {
					console.error("Error fetching provider config history:", error);
					if (error instanceof Error && error.message.includes("FORBIDDEN")) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You don't have access to this configuration",
						});
					}
					if (error instanceof Error && error.message.includes("not found")) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "Configuration not found",
						});
					}
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to fetch configuration history",
					});
				}
			});
		}),

	/**
	 * Get combined audit history for all project configurations
	 * Includes both provider configs and adaptive config history
	 */
	getProjectHistory: protectedProcedure
		.input(z.object({ projectId: z.number() }))
		.query(async ({ ctx, input }) => {
			const cacheKey = `project-history:${input.projectId}`;

			return withCache(cacheKey, async () => {
				try {
					const token = await ctx.clerkAuth.getToken();
					if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

					const client = new ProviderConfigsClient(token);
					const response = await client.getProjectHistory(input.projectId);
					return response;
				} catch (error) {
					console.error("Error fetching project history:", error);
					if (error instanceof Error && error.message.includes("FORBIDDEN")) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You don't have access to this project",
						});
					}
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to fetch project history",
					});
				}
			});
		}),
});
