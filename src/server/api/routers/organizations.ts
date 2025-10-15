import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

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
				emailAddress: z.string().email(),
				role: z.enum(["org:admin", "org:member"]),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				const invitation = await (
					await clerkClient()
				).organizations.createOrganizationInvitation({
					organizationId: input.organizationId,
					emailAddress: input.emailAddress,
					role: input.role,
					inviterUserId: undefined,
				});

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
		.query(async ({ input }) => {
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
					})),
				};
			} catch (error) {
				console.error("Error listing organization invitations:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to list organization invitations",
				});
			}
		}),

	revokeInvitation: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				invitationId: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				await (await clerkClient()).organizations.revokeOrganizationInvitation({
					organizationId: input.organizationId,
					invitationId: input.invitationId,
				});

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
		.query(async ({ input }) => {
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
		}),

	updateMemberRole: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				userId: z.string(),
				role: z.enum(["org:admin", "org:member"]),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				await (await clerkClient()).organizations.updateOrganizationMembership({
					organizationId: input.organizationId,
					userId: input.userId,
					role: input.role,
				});

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
		.mutation(async ({ input }) => {
			try {
				await (await clerkClient()).organizations.deleteOrganizationMembership({
					organizationId: input.organizationId,
					userId: input.userId,
				});

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
