import type {
	ProviderConfigCreateRequest,
	ProviderConfigHistoryResponse,
	ProviderConfigListResponse,
	ProviderConfigResponse,
	ProviderConfigUpdateRequest,
} from "@/types/providers";
import { BaseApiClient } from "../base-client";

/**
 * API client for managing provider configurations at project and organization levels
 */
export class ProviderConfigsClient extends BaseApiClient {
	constructor(token: string) {
		super({ basePath: "/v1", token });
	}

	// ==================== Project-level Provider Configs ====================

	/**
	 * List all provider configurations for a project (effective configs with inheritance)
	 * Returns a map of provider names to their configurations
	 */
	async listProjectProviders(
		projectId: number,
		endpoint?: string,
	): Promise<ProviderConfigListResponse> {
		try {
			return await this.get<ProviderConfigListResponse>(
				`/projects/${projectId}/providers`,
				{ params: endpoint ? { endpoint } : undefined },
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to list project providers");
			}
			throw new Error("Failed to list project providers");
		}
	}

	/**
	 * Create a provider configuration for a project
	 */
	async createProjectProvider(
		projectId: number,
		provider: string,
		data: ProviderConfigCreateRequest,
	): Promise<ProviderConfigResponse> {
		try {
			return await this.post<
				ProviderConfigResponse,
				ProviderConfigCreateRequest
			>(`/projects/${projectId}/providers/${provider}`, {
				body: data,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to create project provider");
			}
			throw new Error("Failed to create project provider");
		}
	}

	/**
	 * Update a provider configuration for a project
	 */
	async updateProjectProvider(
		projectId: number,
		provider: string,
		data: ProviderConfigUpdateRequest,
	): Promise<ProviderConfigResponse> {
		try {
			return await this.patch<
				ProviderConfigResponse,
				ProviderConfigUpdateRequest
			>(`/projects/${projectId}/providers/${provider}`, {
				body: data,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to update project provider");
			}
			throw new Error("Failed to update project provider");
		}
	}

	/**
	 * Delete a provider configuration for a project
	 */
	async deleteProjectProvider(
		projectId: number,
		provider: string,
	): Promise<void> {
		try {
			await this.delete(`/projects/${projectId}/providers/${provider}`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to delete project provider");
			}
			throw new Error("Failed to delete project provider");
		}
	}

	// ==================== Organization-level Provider Configs ====================

	/**
	 * List all provider configurations for an organization
	 * Returns a map of provider names to their configurations
	 */
	async listOrganizationProviders(
		organizationId: string,
		endpoint?: string,
	): Promise<ProviderConfigListResponse> {
		try {
			return await this.get<ProviderConfigListResponse>(
				`/organizations/${organizationId}/providers`,
				{ params: endpoint ? { endpoint } : undefined },
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to list organization providers",
				);
			}
			throw new Error("Failed to list organization providers");
		}
	}

	/**
	 * Create a provider configuration for an organization
	 */
	async createOrganizationProvider(
		organizationId: string,
		provider: string,
		data: ProviderConfigCreateRequest,
	): Promise<ProviderConfigResponse> {
		try {
			return await this.post<
				ProviderConfigResponse,
				ProviderConfigCreateRequest
			>(`/organizations/${organizationId}/providers/${provider}`, {
				body: data,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to create organization provider",
				);
			}
			throw new Error("Failed to create organization provider");
		}
	}

	/**
	 * Update a provider configuration for an organization
	 */
	async updateOrganizationProvider(
		organizationId: string,
		provider: string,
		data: ProviderConfigUpdateRequest,
	): Promise<ProviderConfigResponse> {
		try {
			return await this.patch<
				ProviderConfigResponse,
				ProviderConfigUpdateRequest
			>(`/organizations/${organizationId}/providers/${provider}`, {
				body: data,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to update organization provider",
				);
			}
			throw new Error("Failed to update organization provider");
		}
	}

	/**
	 * Delete a provider configuration for an organization
	 */
	async deleteOrganizationProvider(
		organizationId: string,
		provider: string,
	): Promise<void> {
		try {
			await this.delete(
				`/organizations/${organizationId}/providers/${provider}`,
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to delete organization provider",
				);
			}
			throw new Error("Failed to delete organization provider");
		}
	}

	// ==================== Configuration History ====================

	/**
	 * Get the change history for a provider configuration
	 */
	async getProviderHistory(
		configId: number,
	): Promise<ProviderConfigHistoryResponse> {
		try {
			return await this.get<ProviderConfigHistoryResponse>(
				`/provider-configs/${configId}/history`,
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get provider history");
			}
			throw new Error("Failed to get provider history");
		}
	}
}
