import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ApiKeysClient, createMetadata } from "@/lib/api/api-keys";
import { ProjectsClient } from "@/lib/api/projects/client";
import {
	type Context,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import type { ApiKeyResponse } from "@/types/api-keys";
import { createApiKeySchema, updateApiKeySchema } from "@/types/api-keys";

async function verifyProjectAccess(
	ctx: Context & {
		clerkAuth: { userId: string; getToken: () => Promise<string | null> };
		userId: string;
	},
	projectId: number,
	requireAdmin = false,
): Promise<boolean> {
	const userId = ctx.clerkAuth.userId;
	if (!userId) return false;

	const token = await ctx.clerkAuth.getToken();
	if (!token) return false;

	const projectsClient = new ProjectsClient(token);

	try {
		const _project = await projectsClient.getById(projectId);
		const members = await projectsClient.listMembers(projectId);

		const userMember = members.find((m) => m.user_id === userId);

		if (requireAdmin) {
			return userMember ? ["owner", "admin"].includes(userMember.role) : false;
		}

		return !!userMember;
	} catch {
		return false;
	}
}

function _filterKeysByUser(
	keys: ApiKeyResponse[],
	userId: string,
): ApiKeyResponse[] {
	return keys.filter((key) => key.user_id === userId);
}

export const apiKeysRouter = createTRPCRouter({
	list: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.clerkAuth.userId;
		if (!userId) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		const token = await ctx.clerkAuth.getToken();
		if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

		const client = new ApiKeysClient(token);
		const response = await client.listByUserId(userId);
		return response.data;
	}),

	getByOrganization: protectedProcedure
		.input(z.object({ organizationId: z.string() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const token = await ctx.clerkAuth.getToken();
			if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

			const projectsClient = new ProjectsClient(token);
			const projects = await projectsClient.listByOrganization(
				input.organizationId,
			);

			const client = new ApiKeysClient(token);

			const keyPromises = projects.map(async (project) => {
				try {
					const response = await client.listByProjectId(project.id);
					return response.data.map((key) => ({
						...key,
						projectName: project.name,
						projectId: project.id,
					}));
				} catch (error) {
					console.error(
						`Failed to fetch API keys for project ${project.id}:`,
						error,
					);
					return [];
				}
			});

			const results = await Promise.all(keyPromises);
			const allKeys = results.flat();

			return allKeys;
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const token = await ctx.clerkAuth.getToken();
			if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

			const client = new ApiKeysClient(token);
			const key = await client.getById(input.id);

			if (key.user_id !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return key;
		}),

	create: protectedProcedure
		.input(createApiKeySchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const token = await ctx.clerkAuth.getToken();
			if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

			const hasAccess = await verifyProjectAccess(ctx, input.projectId, true);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"You don't have permission to create API keys for this project",
				});
			}

			const projectsClient = new ProjectsClient(token);
			const project = await projectsClient
				.getById(input.projectId)
				.catch(() => {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Project not found",
					});
				});

			const metadata = createMetadata(userId, input.projectId);

			const client = new ApiKeysClient(token);
			const key = await client.create({
				name: input.name,
				organization_id: project.organization_id,
				user_id: userId,
				project_id: input.projectId,
				metadata,
				scopes: input.scopes,
				rate_limit_rpm: input.rate_limit_rpm,
				budget_limit: input.budget_limit,
				budget_currency: input.budget_currency,
				budget_reset_type: input.budget_reset_type,
				expires_at: input.expires_at,
			});

			return key;
		}),

	createForProject: protectedProcedure
		.input(createApiKeySchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const token = await ctx.clerkAuth.getToken();
			if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

			const hasAccess = await verifyProjectAccess(ctx, input.projectId, true);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"You don't have permission to create API keys for this project",
				});
			}

			const projectsClient = new ProjectsClient(token);
			const project = await projectsClient
				.getById(input.projectId)
				.catch(() => {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Project not found",
					});
				});

			const metadata = createMetadata(userId, input.projectId);

			const client = new ApiKeysClient(token);
			const key = await client.create({
				name: input.name,
				organization_id: project.organization_id,
				user_id: userId,
				project_id: input.projectId,
				metadata,
				scopes: input.scopes,
				rate_limit_rpm: input.rate_limit_rpm,
				budget_limit: input.budget_limit,
				budget_currency: input.budget_currency,
				budget_reset_type: input.budget_reset_type,
				expires_at: input.expires_at,
			});

			return key;
		}),

	update: protectedProcedure
		.input(updateApiKeySchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const token = await ctx.clerkAuth.getToken();
			if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

			const client = new ApiKeysClient(token);
			const existing = await client.getById(input.id);

			if (existing.user_id !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (existing.project_id) {
				const hasAccess = await verifyProjectAccess(
					ctx,
					existing.project_id,
					true,
				);
				if (!hasAccess) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You don't have permission to update this API key",
					});
				}
			}

			const { id, ...updateData } = input;
			const key = await client.update(id, updateData);

			return key;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const token = await ctx.clerkAuth.getToken();
			if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

			const client = new ApiKeysClient(token);
			const existing = await client.getById(input.id);

			if (existing.user_id !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			await client.deleteById(input.id);
			return { success: true };
		}),

	revoke: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const token = await ctx.clerkAuth.getToken();
			if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

			const client = new ApiKeysClient(token);
			const existing = await client.getById(input.id);

			if (existing.user_id !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const key = await client.revoke(input.id);
			return key;
		}),

	verify: publicProcedure
		.input(z.object({ apiKey: z.string() }))
		.query(async ({ input }) => {
			const client = new ApiKeysClient("");
			const result = await client.verify({ key: input.apiKey });

			if (!result.valid) {
				return { valid: false };
			}

			return {
				valid: true,
				api_key_id: result.api_key_id,
				projectId: result.project_id,
				userId: result.user_id,
			};
		}),

	getByProject: protectedProcedure
		.input(z.object({ projectId: z.number() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const hasAccess = await verifyProjectAccess(ctx, input.projectId);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You don't have access to this project",
				});
			}

			const token = await ctx.clerkAuth.getToken();
			if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

			const client = new ApiKeysClient(token);
			const response = await client.listByProjectId(input.projectId);

			return response.data;
		}),

	getUsage: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				start_date: z.string().optional(),
				end_date: z.string().optional(),
				limit: z.number().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const token = await ctx.clerkAuth.getToken();
			if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

			const client = new ApiKeysClient(token);
			const existing = await client.getById(input.id);

			if (existing.user_id !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const { id, ...params } = input;
			return client.getUsage(id, params);
		}),

	getStats: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				start_date: z.string().optional(),
				end_date: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const token = await ctx.clerkAuth.getToken();
			if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

			const client = new ApiKeysClient(token);
			const existing = await client.getById(input.id);

			if (existing.user_id !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const { id, ...params } = input;
			return client.getStats(id, params);
		}),

	resetBudget: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const token = await ctx.clerkAuth.getToken();
			if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

			const client = new ApiKeysClient(token);
			const existing = await client.getById(input.id);

			if (existing.user_id !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return client.resetBudget(input.id);
		}),
});
