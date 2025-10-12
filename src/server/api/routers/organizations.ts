import { TRPCError } from "@trpc/server";
import type { Prisma } from "prisma/generated";
import { z } from "zod";
import { creditsClient } from "@/lib/api/credits";
import { invalidateOrganizationCache, withCache } from "@/lib/shared/cache";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

type OrganizationWithMembersAndCount = Prisma.OrganizationGetPayload<{
	include: {
		members: true;
		_count: {
			select: {
				projects: true;
			};
		};
	};
}>;

export const organizationsRouter = createTRPCRouter({
	// Get all organizations for the current user
	getAll: protectedProcedure.query(
		async ({ ctx }): Promise<OrganizationWithMembersAndCount[]> => {
			const userId = ctx.clerkAuth.userId;
			const cacheKey = `organizations:${userId}`;

			return withCache(cacheKey, async () => {
				try {
					const organizations = await ctx.db.organization.findMany({
						where: {
							OR: [{ ownerId: userId }, { members: { some: { userId } } }],
						},
						include: {
							members: true,
							_count: {
								select: {
									projects: true,
								},
							},
						},
						orderBy: { createdAt: "desc" },
					});

					return organizations as OrganizationWithMembersAndCount[];
				} catch (error) {
					console.error("Error fetching organizations:", error);
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to fetch organizations",
					});
				}
			});
		},
	),

	// Get a specific organization by ID
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(
			async ({
				ctx,
				input,
			}): Promise<OrganizationWithMembersAndCount | null> => {
				const userId = ctx.clerkAuth.userId;
				const cacheKey = `organization:${userId}:${input.id}`;

				return withCache(cacheKey, async () => {
					try {
						const organization = await ctx.db.organization.findFirst({
							where: {
								id: input.id,
								OR: [{ ownerId: userId }, { members: { some: { userId } } }],
							},
							include: {
								members: true,
								_count: {
									select: {
										projects: true,
									},
								},
							},
						});

						if (!organization) {
							throw new TRPCError({
								code: "NOT_FOUND",
								message: "Organization not found",
							});
						}

						return organization as OrganizationWithMembersAndCount;
					} catch (error) {
						console.error("Error fetching organization:", error);
						if (error instanceof TRPCError) {
							throw error;
						}
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "Failed to fetch organization",
						});
					}
				});
			},
		),

	// Create a new organization
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, "Organization name is required"),
				description: z.string().optional(),
			}),
		)
		.mutation(
			async ({ ctx, input }): Promise<OrganizationWithMembersAndCount> => {
				const userId = ctx.clerkAuth.userId;

				try {
					// Check if this is the user's first organization
					const existingOrgCount = await ctx.db.organization.count({
						where: {
							OR: [{ ownerId: userId }, { members: { some: { userId } } }],
						},
					});

					const isFirstOrganization = existingOrgCount === 0;

					const organization = await ctx.db.organization.create({
						data: {
							name: input.name,
							description: input.description,
							ownerId: userId,
							members: {
								create: {
									userId: userId,
									role: "owner",
								},
							},
						},
						include: {
							members: true,
							_count: {
								select: {
									projects: true,
								},
							},
						},
					});

					// Award promotional credits for first organization ($3.14)
					if (isFirstOrganization) {
						try {
							await creditsClient.addCredits({
								organization_id: organization.id,
								user_id: userId,
								amount: 3.14,
								type: "promotional",
								description: "Welcome bonus - First organization created",
								metadata: {
									source: "first_organization",
									timestamp: new Date().toISOString(),
								},
							});
							console.log(
								`Awarded $3.14 promotional credits to user ${userId} for organization ${organization.id}`,
							);
						} catch (creditError) {
							// Log error but don't fail organization creation
							console.error(
								"Failed to award promotional credits:",
								creditError,
							);
						}
					}

					// Invalidate organization cache
					await invalidateOrganizationCache(userId);

					return organization as OrganizationWithMembersAndCount;
				} catch (error) {
					console.error("Error creating organization:", error);
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create organization",
					});
				}
			},
		),

	// Update an organization
	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1, "Organization name is required").optional(),
				description: z.string().optional(),
			}),
		)
		.mutation(
			async ({ ctx, input }): Promise<OrganizationWithMembersAndCount> => {
				const userId = ctx.clerkAuth.userId;

				try {
					// Check if user is owner or admin
					const organization = await ctx.db.organization.findFirst({
						where: {
							id: input.id,
							OR: [
								{ ownerId: userId },
								{
									members: {
										some: { userId, role: { in: ["owner", "admin"] } },
									},
								},
							],
						},
					});

					if (!organization) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You don't have permission to update this organization",
						});
					}

					const updatedOrganization = await ctx.db.organization.update({
						where: { id: input.id },
						data: {
							...(input.name && { name: input.name }),
							...(input.description !== undefined && {
								description: input.description,
							}),
						},
						include: {
							members: true,
							_count: {
								select: {
									projects: true,
								},
							},
						},
					});

					// Invalidate organization cache
					await invalidateOrganizationCache(userId, input.id);

					return updatedOrganization;
				} catch (error) {
					console.error("Error updating organization:", error);
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to update organization",
					});
				}
			},
		),

	// Delete an organization
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				// Check if user is owner
				const organization = await ctx.db.organization.findFirst({
					where: {
						id: input.id,
						ownerId: userId,
					},
				});

				if (!organization) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You don't have permission to delete this organization",
					});
				}

				// Check if this is the user's last organization
				const userOrganizationCount = await ctx.db.organization.count({
					where: {
						OR: [{ ownerId: userId }, { members: { some: { userId } } }],
					},
				});

				if (userOrganizationCount <= 1) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message:
							"Cannot delete your last organization. You must have at least one organization.",
					});
				}

				await ctx.db.organization.delete({
					where: { id: input.id },
				});

				// Invalidate organization cache
				await invalidateOrganizationCache(userId, input.id);

				return { success: true };
			} catch (error) {
				console.error("Error deleting organization:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete organization",
				});
			}
		}),

	// Add a member to an organization
	addMember: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				userId: z.string(),
				role: z.enum(["admin", "member"]).default("member"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const currentUserId = ctx.clerkAuth.userId;

			try {
				// Check if current user is owner or admin
				const organization = await ctx.db.organization.findFirst({
					where: {
						id: input.organizationId,
						OR: [
							{ ownerId: currentUserId },
							{
								members: {
									some: {
										userId: currentUserId,
										role: { in: ["owner", "admin"] },
									},
								},
							},
						],
					},
				});

				if (!organization) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message:
							"You don't have permission to add members to this organization",
					});
				}

				// Check if user is already a member
				const existingMember = await ctx.db.organizationMember.findUnique({
					where: {
						userId_organizationId: {
							userId: input.userId,
							organizationId: input.organizationId,
						},
					},
				});

				if (existingMember) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "User is already a member of this organization",
					});
				}

				const member = await ctx.db.organizationMember.create({
					data: {
						userId: input.userId,
						organizationId: input.organizationId,
						role: input.role,
					},
				});

				// Invalidate organization cache for all affected users
				await invalidateOrganizationCache(currentUserId, input.organizationId);
				await invalidateOrganizationCache(input.userId, input.organizationId);

				return member;
			} catch (error) {
				console.error("Error adding member:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to add member",
				});
			}
		}),

	// Remove a member from an organization
	removeMember: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				userId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const currentUserId = ctx.clerkAuth.userId;
			if (!currentUserId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			try {
				// Check if current user is owner or admin
				const organization = await ctx.db.organization.findFirst({
					where: {
						id: input.organizationId,
						OR: [
							{ ownerId: currentUserId },
							{
								members: {
									some: {
										userId: currentUserId,
										role: { in: ["owner", "admin"] },
									},
								},
							},
						],
					},
				});

				if (!organization) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message:
							"You don't have permission to remove members from this organization",
					});
				}

				// Prevent removing the owner
				if (organization.ownerId === input.userId) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Cannot remove the organization owner",
					});
				}

				await ctx.db.organizationMember.delete({
					where: {
						userId_organizationId: {
							userId: input.userId,
							organizationId: input.organizationId,
						},
					},
				});

				// Invalidate organization cache for all affected users
				await invalidateOrganizationCache(currentUserId, input.organizationId);
				await invalidateOrganizationCache(input.userId, input.organizationId);

				return { success: true };
			} catch (error) {
				console.error("Error removing member:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to remove member",
				});
			}
		}),
});
