import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ProviderConfigsClient } from "@/lib/api/provider-configs";
import { invalidateProjectCache, withCache } from "@/lib/shared/cache";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
	providerConfigCreateRequestSchema,
	providerConfigUpdateRequestSchema,
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
			const _userId = ctx.clerkAuth.userId;
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
				data: providerConfigCreateRequestSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ProviderConfigsClient(token);
				const config = await client.createProjectProvider(
					input.projectId,
					input.provider,
					input.data,
				);

				// Invalidate cache
				await invalidateProjectCache(userId, input.projectId.toString());

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
				data: providerConfigUpdateRequestSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ProviderConfigsClient(token);
				const config = await client.updateProjectProvider(
					input.projectId,
					input.provider,
					input.data,
				);

				// Invalidate cache
				await invalidateProjectCache(userId, input.projectId.toString());

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

				// Invalidate cache
				await invalidateProjectCache(userId, input.projectId.toString());

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

	// ==================== Organization-level Provider Configs ====================

	/**
	 * List all provider configurations for an organization
	 */
	listOrganizationProviders: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				endpoint: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const _userId = ctx.clerkAuth.userId;
			const cacheKey = `provider-configs:org:${input.organizationId}:${input.endpoint ?? "default"}`;

			return withCache(cacheKey, async () => {
				try {
					const token = await ctx.clerkAuth.getToken();
					if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

					const client = new ProviderConfigsClient(token);
					const response = await client.listOrganizationProviders(
						input.organizationId,
						input.endpoint,
					);
					return response;
				} catch (error) {
					console.error("Error fetching organization provider configs:", error);
					if (error instanceof Error && error.message.includes("FORBIDDEN")) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You don't have access to this organization",
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
	 * Create a provider configuration for an organization
	 */
	createOrganizationProvider: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				provider: z.string(),
				data: providerConfigCreateRequestSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const _userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ProviderConfigsClient(token);
				const config = await client.createOrganizationProvider(
					input.organizationId,
					input.provider,
					input.data,
				);

				return config;
			} catch (error) {
				console.error("Error creating organization provider config:", error);
				if (error instanceof Error && error.message.includes("FORBIDDEN")) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message:
							"You don't have permission to modify this organization. Only organization admins can manage provider configurations.",
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
	 * Update a provider configuration for an organization
	 */
	updateOrganizationProvider: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				provider: z.string(),
				data: providerConfigUpdateRequestSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const _userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ProviderConfigsClient(token);
				const config = await client.updateOrganizationProvider(
					input.organizationId,
					input.provider,
					input.data,
				);

				return config;
			} catch (error) {
				console.error("Error updating organization provider config:", error);
				if (error instanceof Error && error.message.includes("FORBIDDEN")) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message:
							"You don't have permission to modify this organization. Only organization admins can manage provider configurations.",
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
	 * Delete a provider configuration for an organization
	 */
	deleteOrganizationProvider: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				provider: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const _userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ProviderConfigsClient(token);
				await client.deleteOrganizationProvider(
					input.organizationId,
					input.provider,
				);

				return { success: true };
			} catch (error) {
				console.error("Error deleting organization provider config:", error);
				if (error instanceof Error && error.message.includes("FORBIDDEN")) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message:
							"You don't have permission to modify this organization. Only organization admins can manage provider configurations.",
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
});
