import type {
	CreateProviderApiRequest,
	GetProviderHistoryApiResponse,
	ListProvidersApiResponse,
	ProviderConfigApiResponse,
	UpdateProviderApiRequest,
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
	): Promise<ListProvidersApiResponse> {
		try {
			return await this.get<ListProvidersApiResponse>(
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
		data: CreateProviderApiRequest,
	): Promise<ProviderConfigApiResponse> {
		try {
			return await this.post<
				ProviderConfigApiResponse,
				CreateProviderApiRequest
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
		data: UpdateProviderApiRequest,
	): Promise<ProviderConfigApiResponse> {
		try {
			return await this.patch<
				ProviderConfigApiResponse,
				UpdateProviderApiRequest
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
	): Promise<ListProvidersApiResponse> {
		try {
			return await this.get<ListProvidersApiResponse>(
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
		data: CreateProviderApiRequest,
	): Promise<ProviderConfigApiResponse> {
		try {
			return await this.post<
				ProviderConfigApiResponse,
				CreateProviderApiRequest
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
		data: UpdateProviderApiRequest,
	): Promise<ProviderConfigApiResponse> {
		try {
			return await this.patch<
				ProviderConfigApiResponse,
				UpdateProviderApiRequest
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
	): Promise<GetProviderHistoryApiResponse> {
		try {
			return await this.get<GetProviderHistoryApiResponse>(
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
