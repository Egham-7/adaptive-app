import { z } from "zod";

export const projectStatusSchema = z.enum(["active", "inactive", "paused"]);

export const projectMemberRoleSchema = z.enum(["owner", "admin", "member"]);

export const projectMemberSchema = z.object({
	id: z.number(),
	user_id: z.string(),
	project_id: z.number(),
	role: projectMemberRoleSchema,
	created_at: z.string(),
	updated_at: z.string(),
});

export const projectResponseSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string(),
	status: projectStatusSchema,
	progress: z.number(),
	organization_id: z.string(),
	members: z.array(projectMemberSchema).optional(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const projectListResponseSchema = z.object({
	projects: z.array(projectResponseSchema),
	total: z.number(),
});

export const projectMemberListResponseSchema = z.object({
	members: z.array(projectMemberSchema),
	total: z.number(),
});

export const projectCreateRequestSchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().optional(),
	organization_id: z.string(),
	status: projectStatusSchema.optional(),
});

export const projectUpdateRequestSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().nullable().optional(),
	status: projectStatusSchema.optional(),
	progress: z.number().min(0).max(100).nullable().optional(),
});

export const addProjectMemberRequestSchema = z.object({
	user_id: z.string(),
	role: projectMemberRoleSchema,
});

export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ProjectMemberRole = z.infer<typeof projectMemberRoleSchema>;
export type ProjectMember = z.infer<typeof projectMemberSchema>;
export type ProjectResponse = z.infer<typeof projectResponseSchema>;
export type ProjectListResponse = z.infer<typeof projectListResponseSchema>;
export type ProjectMemberListResponse = z.infer<
	typeof projectMemberListResponseSchema
>;
export type ProjectCreateRequest = z.infer<typeof projectCreateRequestSchema>;
export type ProjectUpdateRequest = z.infer<typeof projectUpdateRequestSchema>;
export type AddProjectMemberRequest = z.infer<
	typeof addProjectMemberRequestSchema
>;
