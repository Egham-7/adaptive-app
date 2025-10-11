import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { apiKeyClient, createMetadata } from "@/lib/api-keys";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import type { ApiKeyResponse } from "@/types/api-keys";
import { createApiKeySchema, updateApiKeySchema } from "@/types/api-keys";

async function verifyProjectAccess(
	ctx: { clerkAuth: { userId: string | null }; db: any },
	projectId: string,
	requireAdmin = false,
): Promise<boolean> {
	const userId = ctx.clerkAuth.userId;
	if (!userId) return false;

	const where = {
		id: projectId,
		OR: requireAdmin
			? [
					{ members: { some: { userId, role: { in: ["owner", "admin"] } } } },
					{ organization: { ownerId: userId } },
					{
						organization: {
							members: { some: { userId, role: { in: ["owner", "admin"] } } },
						},
					},
				]
			: [
					{ members: { some: { userId } } },
					{ organization: { ownerId: userId } },
					{ organization: { members: { some: { userId } } } },
				],
	};

	const project = await ctx.db.project.findFirst({ where });
	return !!project;
}

function filterKeysByUser(
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

		const response = await apiKeyClient.apiKeys.list();
		return filterKeysByUser(response.data, userId);
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const key = await apiKeyClient.apiKeys.get(input.id);

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

			const hasAccess = await verifyProjectAccess(ctx, input.projectId, true);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"You don't have permission to create API keys for this project",
				});
			}

			const project = await ctx.db.project.findUnique({
				where: { id: input.projectId },
				select: { organizationId: true },
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const metadata = createMetadata(userId, input.projectId);

			const key = await apiKeyClient.apiKeys.create({
				name: input.name,
				organization_id: project.organizationId,
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

			const hasAccess = await verifyProjectAccess(ctx, input.projectId, true);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"You don't have permission to create API keys for this project",
				});
			}

			const project = await ctx.db.project.findUnique({
				where: { id: input.projectId },
				select: { organizationId: true },
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const metadata = createMetadata(userId, input.projectId);

			const key = await apiKeyClient.apiKeys.create({
				name: input.name,
				organization_id: project.organizationId,
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

			const existing = await apiKeyClient.apiKeys.get(input.id);

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
			const key = await apiKeyClient.apiKeys.update(id, updateData);

			return key;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const existing = await apiKeyClient.apiKeys.get(input.id);

			if (existing.user_id !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			await apiKeyClient.apiKeys.delete(input.id);
			return { success: true };
		}),

	revoke: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const existing = await apiKeyClient.apiKeys.get(input.id);

			if (existing.user_id !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const key = await apiKeyClient.apiKeys.revoke(input.id);
			return key;
		}),

	verify: publicProcedure
		.input(z.object({ apiKey: z.string() }))
		.query(async ({ input }) => {
			const result = await apiKeyClient.apiKeys.verify({ key: input.apiKey });

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
		.input(z.object({ projectId: z.string() }))
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

			const response = await apiKeyClient.apiKeys.list();

			return response.data.filter(
				(key: ApiKeyResponse) => key.project_id === input.projectId,
			);
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

			const existing = await apiKeyClient.apiKeys.get(input.id);

			if (existing.user_id !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const { id, ...params } = input;
			return apiKeyClient.apiKeys.getUsage(id, params);
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

			const existing = await apiKeyClient.apiKeys.get(input.id);

			if (existing.user_id !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const { id, ...params } = input;
			return apiKeyClient.apiKeys.getStats(id, params);
		}),

	resetBudget: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const existing = await apiKeyClient.apiKeys.get(input.id);

			if (existing.user_id !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return apiKeyClient.apiKeys.resetBudget(input.id);
		}),
});
