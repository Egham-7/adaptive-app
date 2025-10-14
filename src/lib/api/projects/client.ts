import { BaseApiClient } from "../base-client";
import type {
	AddProjectMemberRequest,
	ProjectCreateRequest,
	ProjectListResponse,
	ProjectMember,
	ProjectMemberListResponse,
	ProjectResponse,
	ProjectUpdateRequest,
} from "./types";

export class ProjectsClient extends BaseApiClient {
	constructor(token: string) {
		super({ basePath: "/admin/projects", token });
	}

	async create(req: ProjectCreateRequest): Promise<ProjectResponse> {
		try {
			return await this.post<ProjectResponse, ProjectCreateRequest>("", {
				body: req,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to create project");
			}
			throw new Error("Failed to create project");
		}
	}

	async getById(id: number): Promise<ProjectResponse> {
		try {
			return await this.get<ProjectResponse>(`/${id}`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get project");
			}
			throw new Error("Failed to get project");
		}
	}

	async listByOrganization(orgId: string): Promise<ProjectResponse[]> {
		try {
			const response = await this.get<ProjectListResponse>(
				`/organization/${orgId}`,
			);
			return response.projects;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to list projects");
			}
			throw new Error("Failed to list projects");
		}
	}

	async update(
		id: number,
		req: ProjectUpdateRequest,
	): Promise<ProjectResponse> {
		try {
			return await this.patch<ProjectResponse, ProjectUpdateRequest>(`/${id}`, {
				body: req,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to update project");
			}
			throw new Error("Failed to update project");
		}
	}

	async deleteProject(id: number): Promise<void> {
		try {
			await this.delete(`/${id}`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to delete project");
			}
			throw new Error("Failed to delete project");
		}
	}

	async addMember(
		projectId: number,
		req: AddProjectMemberRequest,
	): Promise<ProjectMember> {
		try {
			return await this.post<ProjectMember, AddProjectMemberRequest>(
				`/${projectId}/members`,
				{
					body: req,
				},
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to add member");
			}
			throw new Error("Failed to add member");
		}
	}

	async removeMember(projectId: number, userId: string): Promise<void> {
		try {
			await this.delete(`/${projectId}/members/${userId}`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to remove member");
			}
			throw new Error("Failed to remove member");
		}
	}

	async listMembers(projectId: number): Promise<ProjectMember[]> {
		try {
			const response = await this.get<ProjectMemberListResponse>(
				`/${projectId}/members`,
			);
			return response.members;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to list members");
			}
			throw new Error("Failed to list members");
		}
	}

	async updateMemberRole(
		projectId: number,
		userId: string,
		role: string,
	): Promise<ProjectMember> {
		try {
			return await this.patch<ProjectMember, { role: string }>(
				`/${projectId}/members/${userId}`,
				{
					body: { role },
				},
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to update member role");
			}
			throw new Error("Failed to update member role");
		}
	}
}

export const projectsClient = new ProjectsClient("");
