import type {
	AdaptiveConfigApiResponse,
	AdaptiveConfigHistoryApiResponse,
	CreateAdaptiveConfigApiRequest,
	UpdateAdaptiveConfigApiRequest,
} from "@/types/adaptive-config";
import { BaseApiClient } from "../base-client";

/**
 * API client for managing adaptive configurations at project level
 */
export class AdaptiveConfigClient extends BaseApiClient {
	constructor(token: string) {
		super({ basePath: "/admin", token });
	}

	// ==================== Project-level Adaptive Configs ====================

	/**
	 * Get the adaptive configuration for a project
	 */
	async getProjectAdaptiveConfig(
		projectId: number,
	): Promise<AdaptiveConfigApiResponse> {
		try {
			return await this.get<AdaptiveConfigApiResponse>(
				`/projects/${projectId}/adaptive-config`,
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to get project adaptive config",
				);
			}
			throw new Error("Failed to get project adaptive config");
		}
	}

	/**
	 * Create an adaptive configuration for a project
	 */
	async createProjectAdaptiveConfig(
		projectId: number,
		data: CreateAdaptiveConfigApiRequest,
	): Promise<AdaptiveConfigApiResponse> {
		try {
			return await this.post<
				AdaptiveConfigApiResponse,
				CreateAdaptiveConfigApiRequest
			>(`/projects/${projectId}/adaptive-config`, {
				body: data,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to create project adaptive config",
				);
			}
			throw new Error("Failed to create project adaptive config");
		}
	}

	/**
	 * Update an adaptive configuration for a project
	 */
	async updateProjectAdaptiveConfig(
		projectId: number,
		data: UpdateAdaptiveConfigApiRequest,
	): Promise<AdaptiveConfigApiResponse> {
		try {
			return await this.patch<
				AdaptiveConfigApiResponse,
				UpdateAdaptiveConfigApiRequest
			>(`/projects/${projectId}/adaptive-config`, {
				body: data,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to update project adaptive config",
				);
			}
			throw new Error("Failed to update project adaptive config");
		}
	}

	/**
	 * Delete an adaptive configuration for a project
	 */
	async deleteProjectAdaptiveConfig(projectId: number): Promise<void> {
		try {
			await this.delete(`/projects/${projectId}/adaptive-config`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to delete project adaptive config",
				);
			}
			throw new Error("Failed to delete project adaptive config");
		}
	}

	// ==================== Configuration History ====================

	/**
	 * Get the change history for an adaptive configuration
	 */
	async getAdaptiveConfigHistory(
		configId: number,
	): Promise<AdaptiveConfigHistoryApiResponse> {
		try {
			return await this.get<AdaptiveConfigHistoryApiResponse>(
				`/adaptive-configs/${configId}/history`,
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to get adaptive config history",
				);
			}
			throw new Error("Failed to get adaptive config history");
		}
	}
}
