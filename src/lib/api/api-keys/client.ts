import type {
	ApiKeyResponse,
	CreateApiKeyRequest,
	GetStatsResponse,
	GetUsageResponse,
	ListApiKeysResponse,
	UpdateApiKeyRequest,
	VerifyApiKeyRequest,
	VerifyApiKeyResponse,
} from "@/types/api-keys";
import { BaseApiClient } from "../base-client";

/**
 * API Keys client for managing API keys through the Adaptive backend
 * Extends BaseApiClient to provide API key-specific operations
 */
export class ApiKeysClient extends BaseApiClient {
	constructor() {
		super({ basePath: "/admin/api-keys" });
	}

	/**
	 * Create a new API key
	 */
	async create(data: CreateApiKeyRequest): Promise<ApiKeyResponse> {
		try {
			return await this.post<ApiKeyResponse, CreateApiKeyRequest>("", {
				body: data,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to create API key");
			}
			throw new Error("Failed to create API key");
		}
	}

	/**
	 * List API keys by user ID with optional pagination
	 */
	async listByUserId(
		userId: string,
		params?: {
			limit?: number;
			offset?: number;
		},
	): Promise<ListApiKeysResponse> {
		try {
			return await this.get<ListApiKeysResponse>(`/user/${userId}`, { params });
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to list API keys by user ID");
			}
			throw new Error("Failed to list API keys by user ID");
		}
	}

	/**
	 * List API keys by project ID with optional pagination
	 */
	async listByProjectId(
		projectId: string,
		params?: {
			limit?: number;
			offset?: number;
		},
	): Promise<ListApiKeysResponse> {
		try {
			return await this.get<ListApiKeysResponse>(`/project/${projectId}`, {
				params,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to list API keys by project ID",
				);
			}
			throw new Error("Failed to list API keys by project ID");
		}
	}

	/**
	 * Get a single API key by ID
	 */
	async getById(id: number): Promise<ApiKeyResponse> {
		try {
			return await this.get<ApiKeyResponse>(`/${id}`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get API key");
			}
			throw new Error("Failed to get API key");
		}
	}

	/**
	 * Update an existing API key
	 */
	async update(id: number, data: UpdateApiKeyRequest): Promise<ApiKeyResponse> {
		try {
			return await this.patch<ApiKeyResponse, UpdateApiKeyRequest>(`/${id}`, {
				body: data,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to update API key");
			}
			throw new Error("Failed to update API key");
		}
	}

	/**
	 * Delete an API key
	 */
	async deleteById(id: number): Promise<void> {
		try {
			return await super.delete<void>(`/${id}`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to delete API key");
			}
			throw new Error("Failed to delete API key");
		}
	}

	/**
	 * Revoke an API key (mark as inactive)
	 */
	async revoke(id: number): Promise<ApiKeyResponse> {
		try {
			return await this.post<ApiKeyResponse>(`/${id}/revoke`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to revoke API key");
			}
			throw new Error("Failed to revoke API key");
		}
	}

	/**
	 * Verify an API key is valid and active
	 */
	async verify(data: VerifyApiKeyRequest): Promise<VerifyApiKeyResponse> {
		try {
			return await this.post<VerifyApiKeyResponse, VerifyApiKeyRequest>(
				"/verify",
				{
					body: data,
				},
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to verify API key");
			}
			throw new Error("Failed to verify API key");
		}
	}

	/**
	 * Get usage logs for an API key
	 */
	async getUsage(
		id: number,
		params?: { start_date?: string; end_date?: string; limit?: number },
	): Promise<GetUsageResponse> {
		try {
			return await this.get<GetUsageResponse>(`/${id}/usage`, { params });
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get API key usage");
			}
			throw new Error("Failed to get API key usage");
		}
	}

	/**
	 * Get usage statistics for an API key
	 */
	async getStats(
		id: number,
		params?: { start_date?: string; end_date?: string },
	): Promise<GetStatsResponse> {
		try {
			return await this.get<GetStatsResponse>(`/${id}/stats`, { params });
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get API key stats");
			}
			throw new Error("Failed to get API key stats");
		}
	}

	/**
	 * Reset the budget for an API key
	 */
	async resetBudget(id: number): Promise<ApiKeyResponse> {
		try {
			return await this.post<ApiKeyResponse>(`/${id}/reset-budget`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to reset API key budget");
			}
			throw new Error("Failed to reset API key budget");
		}
	}
}

/**
 * Singleton instance of the API keys client
 */
export const apiKeysClient = new ApiKeysClient();
