import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createMetadata, goApiClient, parseMetadata } from "@/lib/go-api";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import type { ApiKeyResponse } from "@/types/go-api-keys";

const createAPIKeySchema = z.object({
	name: z.string().min(1).max(255),
	projectId: z.string(),
	scopes: z.array(z.string()).optional(),
	rate_limit_rpm: z.number().nullable().optional(),
	budget_limit: z.number().nullable().optional(),
	budget_currency: z.string().optional(),
	budget_reset_type: z.enum(["", "daily", "weekly", "monthly"]).optional(),
	expires_at: z.string().nullable().optional(),
});

const updateAPIKeySchema = z.object({
	id: z.number(),
	name: z.string().min(1).max(255).optional(),
	scopes: z.string().optional(),
	rate_limit_rpm: z.number().nullable().optional(),
	budget_limit: z.number().nullable().optional(),
	budget_currency: z.string().optional(),
	budget_reset_type: z.string().optional(),
	is_active: z.boolean().optional(),
	expires_at: z.string().nullable().optional(),
});

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
	return keys.filter((key) => {
		const meta = parseMetadata(key.metadata);
		return meta.userId === userId;
	});
}

export const apiKeysRouter = createTRPCRouter({
	list: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.clerkAuth.userId;
		if (!userId) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		const response = await goApiClient.apiKeys.list();
		return filterKeysByUser(response.data, userId);
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const key = await goApiClient.apiKeys.get(input.id);
			const meta = parseMetadata(key.metadata);

			if (meta.userId !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return key;
		}),

	create: protectedProcedure
		.input(createAPIKeySchema)
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

			const metadata = createMetadata(userId, input.projectId);

			const key = await goApiClient.apiKeys.create({
				name: input.name,
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
		.input(createAPIKeySchema)
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

			const metadata = createMetadata(userId, input.projectId);

			const key = await goApiClient.apiKeys.create({
				name: input.name,
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
		.input(updateAPIKeySchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const existing = await goApiClient.apiKeys.get(input.id);
			const meta = parseMetadata(existing.metadata);

			if (meta.userId !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (meta.projectId) {
				const hasAccess = await verifyProjectAccess(ctx, meta.projectId, true);
				if (!hasAccess) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You don't have permission to update this API key",
					});
				}
			}

			const { id, ...updateData } = input;
			const key = await goApiClient.apiKeys.update(id, updateData);

			return key;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const existing = await goApiClient.apiKeys.get(input.id);
			const meta = parseMetadata(existing.metadata);

			if (meta.userId !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			await goApiClient.apiKeys.delete(input.id);
			return { success: true };
		}),

	revoke: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const existing = await goApiClient.apiKeys.get(input.id);
			const meta = parseMetadata(existing.metadata);

			if (meta.userId !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const key = await goApiClient.apiKeys.revoke(input.id);
			return key;
		}),

	verify: publicProcedure
		.input(z.object({ apiKey: z.string() }))
		.query(async ({ input }) => {
			const result = await goApiClient.apiKeys.verify({ key: input.apiKey });

			if (!result.valid) {
				return { valid: false };
			}

			const meta = parseMetadata(result.metadata);

			return {
				valid: true,
				api_key_id: result.api_key_id,
				projectId: meta.projectId,
				userId: meta.userId,
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

			const response = await goApiClient.apiKeys.list();

			return response.data.filter((key) => {
				const meta = parseMetadata(key.metadata);
				return meta.projectId === input.projectId;
			});
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

			const existing = await goApiClient.apiKeys.get(input.id);
			const meta = parseMetadata(existing.metadata);

			if (meta.userId !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const { id, ...params } = input;
			return goApiClient.apiKeys.getUsage(id, params);
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

			const existing = await goApiClient.apiKeys.get(input.id);
			const meta = parseMetadata(existing.metadata);

			if (meta.userId !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const { id, ...params } = input;
			return goApiClient.apiKeys.getStats(id, params);
		}),

	resetBudget: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const existing = await goApiClient.apiKeys.get(input.id);
			const meta = parseMetadata(existing.metadata);

			if (meta.userId !== userId) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return goApiClient.apiKeys.resetBudget(input.id);
		}),
});
