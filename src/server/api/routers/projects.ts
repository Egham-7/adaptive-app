import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ProjectsClient } from "@/lib/api/projects";
import { invalidateProjectCache, withCache } from "@/lib/shared/cache";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const projectsRouter = createTRPCRouter({
	// Get all projects for an organization
	getByOrganization: protectedProcedure
		.input(z.object({ organizationId: z.string() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			const cacheKey = `projects:${userId}:${input.organizationId}`;

			return withCache(cacheKey, async () => {
				try {
					const token = await ctx.clerkAuth.getToken();
					if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

					const client = new ProjectsClient(token);
					const projects = await client.listByOrganization(
						input.organizationId,
					);
					return projects;
				} catch (error) {
					console.error("Error fetching projects:", error);
					if (error instanceof Error && error.message.includes("FORBIDDEN")) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You don't have access to this organization",
						});
					}
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to fetch projects",
					});
				}
			});
		}),

	// Get a specific project by ID
	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			const cacheKey = `project:${userId}:${input.id}`;

			return withCache(cacheKey, async () => {
				try {
					const token = await ctx.clerkAuth.getToken();
					if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

					const client = new ProjectsClient(token);
					const project = await client.getById(input.id);

					const currentUserMember = project.members?.find(
						(m) => m.user_id === userId,
					);
					const currentUserRole = currentUserMember?.role ?? null;

					return {
						...project,
						currentUserRole,
					};
				} catch (error) {
					console.error("Error fetching project:", error);
					if (error instanceof Error && error.message.includes("NOT_FOUND")) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "Project not found",
						});
					}
					if (error instanceof Error && error.message.includes("FORBIDDEN")) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You don't have access to this project",
						});
					}
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to fetch project",
					});
				}
			});
		}),

	// Create a new project
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, "Project name is required"),
				description: z.string().optional(),
				organizationId: z.string(),
				status: z.enum(["active", "inactive", "paused"]).default("active"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ProjectsClient(token);
				const project = await client.create({
					name: input.name,
					description: input.description,
					organization_id: input.organizationId,
					status: input.status,
				});

				await invalidateProjectCache(userId);

				return project;
			} catch (error) {
				console.error("Error creating project:", error);
				if (error instanceof Error && error.message.includes("FORBIDDEN")) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message:
							"You don't have permission to create projects in this organization",
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create project",
				});
			}
		}),

	// Update a project
	update: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1, "Project name is required").optional(),
				description: z.string().optional(),
				status: z.enum(["active", "inactive", "paused"]).optional(),
				progress: z.number().min(0).max(100).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const { id, ...updateData } = input;
				const client = new ProjectsClient(token);
				const project = await client.update(id, updateData);

				await invalidateProjectCache(userId, input.id.toString());

				return project;
			} catch (error) {
				console.error("Error updating project:", error);
				if (error instanceof Error && error.message.includes("FORBIDDEN")) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You don't have permission to update this project",
					});
				}
				if (error instanceof Error && error.message.includes("NOT_FOUND")) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Project not found",
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update project",
				});
			}
		}),

	// Delete a project
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ProjectsClient(token);
				await client.deleteProject(input.id);

				await invalidateProjectCache(userId, input.id.toString());

				return { success: true };
			} catch (error) {
				console.error("Error deleting project:", error);
				if (error instanceof Error && error.message.includes("FORBIDDEN")) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You don't have permission to delete this project",
					});
				}
				if (error instanceof Error && error.message.includes("NOT_FOUND")) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Project not found",
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete project",
				});
			}
		}),

	// Add a member to a project
	addMember: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				userId: z.string(),
				role: z.enum(["admin", "member"]).default("member"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const currentUserId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ProjectsClient(token);
				const member = await client.addMember(input.projectId, {
					user_id: input.userId,
					role: input.role,
				});

				await invalidateProjectCache(currentUserId, input.projectId.toString());
				await invalidateProjectCache(input.userId, input.projectId.toString());

				return member;
			} catch (error) {
				console.error("Error adding project member:", error);
				if (error instanceof Error && error.message.includes("FORBIDDEN")) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You don't have permission to add members to this project",
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to add project member",
				});
			}
		}),

	// Remove a member from a project
	removeMember: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				userId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const currentUserId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ProjectsClient(token);
				await client.removeMember(input.projectId, input.userId);

				await invalidateProjectCache(currentUserId, input.projectId.toString());
				await invalidateProjectCache(input.userId, input.projectId.toString());

				return { success: true };
			} catch (error) {
				console.error("Error removing project member:", error);
				if (error instanceof Error && error.message.includes("FORBIDDEN")) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message:
							"You don't have permission to remove members from this project",
					});
				}
				if (error instanceof Error && error.message.includes("NOT_FOUND")) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Member not found",
					});
				}
				if (
					error instanceof Error &&
					error.message.includes("Cannot remove project owner")
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Cannot remove the project owner",
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to remove project member",
				});
			}
		}),

	// List members of a project
	listMembers: protectedProcedure
		.input(z.object({ projectId: z.number() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			const cacheKey = `project-members:${userId}:${input.projectId}`;

			return withCache(cacheKey, async () => {
				try {
					const token = await ctx.clerkAuth.getToken();
					if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

					const client = new ProjectsClient(token);
					const members = await client.listMembers(input.projectId);

					const membersWithUserData = await Promise.all(
						members.map(async (member) => {
							try {
								const clerk = await clerkClient();
								const user = await clerk.users.getUser(member.user_id);
								return {
									...member,
									userName:
										user.fullName ??
										user.username ??
										user.emailAddresses[0]?.emailAddress ??
										member.user_id,
									userEmail: user.emailAddresses[0]?.emailAddress ?? null,
									userImageUrl: user.imageUrl ?? null,
								};
							} catch (error) {
								console.error(
									`Failed to fetch user data for ${member.user_id}:`,
									error,
								);
								return {
									...member,
									userName: member.user_id,
									userEmail: null,
									userImageUrl: null,
								};
							}
						}),
					);

					return membersWithUserData;
				} catch (error) {
					console.error("Error fetching project members:", error);
					if (error instanceof Error && error.message.includes("FORBIDDEN")) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You don't have access to this project",
						});
					}
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to fetch project members",
					});
				}
			});
		}),

	// Update a member's role
	updateMemberRole: protectedProcedure
		.input(
			z.object({
				projectId: z.number(),
				userId: z.string(),
				role: z.enum(["admin", "member"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const currentUserId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new ProjectsClient(token);
				await client.updateMemberRole(
					input.projectId,
					input.userId,
					input.role,
				);

				await invalidateProjectCache(currentUserId, input.projectId.toString());
				await invalidateProjectCache(input.userId, input.projectId.toString());

				return { success: true };
			} catch (error) {
				console.error("Error updating member role:", error);
				if (error instanceof Error && error.message.includes("FORBIDDEN")) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You don't have permission to update member roles",
					});
				}
				if (error instanceof Error && error.message.includes("NOT_FOUND")) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Member not found",
					});
				}
				if (
					error instanceof Error &&
					error.message.includes("Cannot change owner role")
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Cannot change the owner's role",
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update member role",
				});
			}
		}),
});
