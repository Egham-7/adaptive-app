import type {
	AdaptiveConfigApiResponse,
	AdaptiveConfigHistoryApiResponse,
	CreateAdaptiveConfigApiRequest,
	UpdateAdaptiveConfigApiRequest,
} from "@/types/adaptive-config";
import { BaseApiClient } from "../base-client";

/**
 * API client for managing adaptive configurations at project and organization levels
 */
export class AdaptiveConfigClient extends BaseApiClient {
	constructor(token: string) {
		super({ basePath: "/v1", token });
	}

	// ==================== Project-level Adaptive Configs ====================

	/**
	 * Get the resolved adaptive configuration for a project
	 * Returns the effective configuration with hierarchy resolution (project -> org -> YAML)
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

	// ==================== Organization-level Adaptive Configs ====================

	/**
	 * Get the resolved adaptive configuration for an organization
	 * Returns the effective configuration (org -> YAML)
	 */
	async getOrganizationAdaptiveConfig(
		organizationId: string,
	): Promise<AdaptiveConfigApiResponse> {
		try {
			return await this.get<AdaptiveConfigApiResponse>(
				`/organizations/${organizationId}/adaptive-config`,
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to get organization adaptive config",
				);
			}
			throw new Error("Failed to get organization adaptive config");
		}
	}

	/**
	 * Create an adaptive configuration for an organization
	 */
	async createOrganizationAdaptiveConfig(
		organizationId: string,
		data: CreateAdaptiveConfigApiRequest,
	): Promise<AdaptiveConfigApiResponse> {
		try {
			return await this.post<
				AdaptiveConfigApiResponse,
				CreateAdaptiveConfigApiRequest
			>(`/organizations/${organizationId}/adaptive-config`, {
				body: data,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to create organization adaptive config",
				);
			}
			throw new Error("Failed to create organization adaptive config");
		}
	}

	/**
	 * Update an adaptive configuration for an organization
	 */
	async updateOrganizationAdaptiveConfig(
		organizationId: string,
		data: UpdateAdaptiveConfigApiRequest,
	): Promise<AdaptiveConfigApiResponse> {
		try {
			return await this.patch<
				AdaptiveConfigApiResponse,
				UpdateAdaptiveConfigApiRequest
			>(`/organizations/${organizationId}/adaptive-config`, {
				body: data,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to update organization adaptive config",
				);
			}
			throw new Error("Failed to update organization adaptive config");
		}
	}

	/**
	 * Delete an adaptive configuration for an organization
	 */
	async deleteOrganizationAdaptiveConfig(
		organizationId: string,
	): Promise<void> {
		try {
			await this.delete(`/organizations/${organizationId}/adaptive-config`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to delete organization adaptive config",
				);
			}
			throw new Error("Failed to delete organization adaptive config");
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
