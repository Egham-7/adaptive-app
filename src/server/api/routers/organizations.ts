import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ProjectsClient } from "@/lib/api/projects/client";
import type { ProjectResponse } from "@/lib/api/projects/types";
import { invalidateOrganizationCache, withCache } from "@/lib/shared/cache";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const STARTER_PROJECT_NAME = "Starter Project";
const STARTER_PROJECT_DESCRIPTION =
	"Auto-created when you joined Adaptive to help you get started faster.";

type MinimalUserProfile = {
	firstName?: string | null;
	lastName?: string | null;
	emailAddresses?: Array<{ emailAddress: string }>;
};

const buildDefaultOrganizationName = (user: MinimalUserProfile) => {
	if (user.firstName && user.lastName) {
		return `${user.firstName} ${user.lastName}'s Organization`;
	}

	if (user.firstName) {
		return `${user.firstName}'s Organization`;
	}

	const email = user.emailAddresses?.[0]?.emailAddress;
	if (email) {
		const localPart = email.split("@")[0] ?? "adaptive-user";
		return `${localPart}'s Organization`;
	}

	return "My Organization";
};

export const organizationsRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, "Organization name is required"),
				slug: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const organization = await (
					await clerkClient()
				).organizations.createOrganization({
					name: input.name,
					slug: input.slug,
					createdBy: ctx.userId,
				});

				// Note: No cache invalidation needed - organization creation doesn't affect existing queries
				// The user will be redirected to the new organization page

				return {
					id: organization.id,
					name: organization.name,
					slug: organization.slug,
				};
			} catch (error) {
				console.error("Error creating organization:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create organization",
				});
			}
		}),

	bootstrapAfterSignup: protectedProcedure.mutation(async ({ ctx }) => {
		const userId = ctx.userId;

		try {
			const token = await ctx.clerkAuth.getToken();
			if (!token) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const clerk = await clerkClient();
			const [user, memberships] = await Promise.all([
				clerk.users.getUser(userId),
				clerk.users.getOrganizationMembershipList({ userId }),
			]);

			const existingOrganization = memberships.data[0]?.organization;
			const organization =
				existingOrganization ??
				(await clerk.organizations.createOrganization({
					name: buildDefaultOrganizationName(user),
					createdBy: userId,
				}));

			if (!organization?.id) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unable to determine organization context",
				});
			}

			const projectsClient = new ProjectsClient(token);
			const project = await (async (): Promise<ProjectResponse> => {
				try {
					const projects =
						(await projectsClient.listByOrganization(organization.id)) ?? [];
					const existingProject = projects[0];
					if (existingProject) {
						return existingProject;
					}
				} catch (error) {
					console.error("Error listing projects during bootstrap:", error);
				}

				return projectsClient.create({
					name: STARTER_PROJECT_NAME,
					description: STARTER_PROJECT_DESCRIPTION,
					organization_id: organization.id,
					status: "active",
				});
			})();

			return {
				organizationId: organization.id,
				organizationSlug: organization.slug ?? null,
				projectId: project.id,
			};
		} catch (error) {
			console.error("Error bootstrapping organization after signup:", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to provision your workspace",
			});
		}
	}),

	delete: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				await (await clerkClient()).organizations.deleteOrganization(
					input.organizationId,
				);

				// Note: No cache invalidation needed - organization deletion will redirect user away
				// All cached data for this organization will no longer be accessible

				return { success: true };
			} catch (error) {
				console.error("Error deleting organization:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete organization",
				});
			}
		}),

	createInvitation: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				emailAddress: z.email(),
				role: z.enum(["org:admin", "org:member"]),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.userId;

			try {
				const invitation = await (
					await clerkClient()
				).organizations.createOrganizationInvitation({
					organizationId: input.organizationId,
					emailAddress: input.emailAddress,
					role: input.role,
					inviterUserId: undefined,
				});

				await invalidateOrganizationCache(userId, input.organizationId);

				return {
					success: true,
					invitation: {
						id: invitation.id,
						emailAddress: invitation.emailAddress,
						role: invitation.role,
						status: invitation.status,
						createdAt: invitation.createdAt,
					},
				};
			} catch (error) {
				console.error("Error creating organization invitation:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create organization invitation",
				});
			}
		}),

	listInvitations: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const userId = ctx.userId;
			const cacheKey = `org-invitations:${userId}:${input.organizationId}`;

			return withCache(cacheKey, async () => {
				try {
					const invitations = await (
						await clerkClient()
					).organizations.getOrganizationInvitationList({
						organizationId: input.organizationId,
					});

					return {
						invitations: invitations.data.map((inv) => ({
							id: inv.id,
							emailAddress: inv.emailAddress,
							role: inv.role,
							status: inv.status,
							createdAt: inv.createdAt,
							updatedAt: inv.updatedAt,
						})),
					};
				} catch (error) {
					console.error("Error listing organization invitations:", error);
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to list organization invitations",
					});
				}
			});
		}),

	revokeInvitation: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				invitationId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.userId;

			try {
				await (await clerkClient()).organizations.revokeOrganizationInvitation({
					organizationId: input.organizationId,
					invitationId: input.invitationId,
				});

				await invalidateOrganizationCache(userId, input.organizationId);

				return { success: true };
			} catch (error) {
				console.error("Error revoking organization invitation:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to revoke organization invitation",
				});
			}
		}),

	getInvitation: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				invitationId: z.string(),
			}),
		)
		.query(async ({ input }) => {
			try {
				const invitation = await (
					await clerkClient()
				).organizations.getOrganizationInvitation({
					organizationId: input.organizationId,
					invitationId: input.invitationId,
				});

				return {
					invitation: {
						id: invitation.id,
						emailAddress: invitation.emailAddress,
						role: invitation.role,
						status: invitation.status,
						createdAt: invitation.createdAt,
					},
				};
			} catch (error) {
				console.error("Error getting organization invitation:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get organization invitation",
				});
			}
		}),

	listMembers: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const userId = ctx.userId;
			const cacheKey = `org-members:${userId}:${input.organizationId}`;

			return withCache(cacheKey, async () => {
				try {
					const memberships = await (
						await clerkClient()
					).organizations.getOrganizationMembershipList({
						organizationId: input.organizationId,
					});

					return {
						members: memberships.data.map((membership) => ({
							id: membership.id,
							userId: membership.publicUserData?.userId,
							email: membership.publicUserData?.identifier,
							firstName: membership.publicUserData?.firstName,
							lastName: membership.publicUserData?.lastName,
							imageUrl: membership.publicUserData?.imageUrl,
							role: membership.role,
							createdAt: membership.createdAt,
						})),
					};
				} catch (error) {
					console.error("Error listing organization members:", error);
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to list organization members",
					});
				}
			});
		}),

	updateMemberRole: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				userId: z.string(),
				role: z.enum(["org:admin", "org:member"]),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const currentUserId = ctx.userId;

			try {
				await (await clerkClient()).organizations.updateOrganizationMembership({
					organizationId: input.organizationId,
					userId: input.userId,
					role: input.role,
				});

				await invalidateOrganizationCache(currentUserId, input.organizationId);

				return { success: true };
			} catch (error) {
				console.error("Error updating member role:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update member role",
				});
			}
		}),

	removeMember: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				userId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const currentUserId = ctx.userId;

			try {
				await (await clerkClient()).organizations.deleteOrganizationMembership({
					organizationId: input.organizationId,
					userId: input.userId,
				});

				await invalidateOrganizationCache(currentUserId, input.organizationId);

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
