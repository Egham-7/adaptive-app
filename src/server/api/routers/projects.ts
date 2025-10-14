import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { ProjectMember, ProjectResponse } from "@/lib/api/projects";
import { ProjectsClient } from "@/lib/api/projects";
import { invalidateProjectCache, withCache } from "@/lib/shared/cache";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

function transformProjectResponse(project: ProjectResponse) {
	return {
		id: project.id,
		name: project.name,
		description: project.description,
		status: project.status,
		progress: project.progress,
		organizationId: project.organization_id,
		createdAt: new Date(project.created_at),
		updatedAt: new Date(project.updated_at),
		members: project.members?.map(transformProjectMember) ?? [],
	};
}

function transformProjectMember(member: ProjectMember) {
	return {
		id: member.id,
		userId: member.user_id,
		projectId: member.project_id,
		role: member.role,
		createdAt: new Date(member.created_at),
		updatedAt: new Date(member.updated_at),
	};
}

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
					return projects.map(transformProjectResponse);
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
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;
			const cacheKey = `project:${userId}:${input.id}`;

			return withCache(cacheKey, async () => {
				try {
					const token = await ctx.clerkAuth.getToken();
					if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });
					
					const client = new ProjectsClient(token);
					const project = await client.getById(input.id);
					return transformProjectResponse(project);
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

				return transformProjectResponse(project);
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
				id: z.string(),
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

				await invalidateProjectCache(userId, input.id);

				return transformProjectResponse(project);
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
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });
				
				const client = new ProjectsClient(token);
				await client.deleteProject(input.id);

				await invalidateProjectCache(userId, input.id);

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
				projectId: z.string(),
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

				await invalidateProjectCache(currentUserId, input.projectId);
				await invalidateProjectCache(input.userId, input.projectId);

				return transformProjectMember(member);
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
				projectId: z.string(),
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

				await invalidateProjectCache(currentUserId, input.projectId);
				await invalidateProjectCache(input.userId, input.projectId);

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
});
