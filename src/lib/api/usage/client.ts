import type { UsageRecord, UsageStats } from "@/types/usage";
import { BaseApiClient } from "../base-client";

/**
 * Usage API client for interacting with adaptive-proxy usage endpoints
 * Extends BaseApiClient to provide usage tracking operations
 */
export class UsageClient extends BaseApiClient {
	constructor(token: string) {
		super({ basePath: "/admin/usage", token });
	}

	/**
	 * Get usage records by API key ID
	 */
	async getUsageByAPIKey(
		apiKeyId: number,
		params?: {
			limit?: number;
			offset?: number;
		},
	): Promise<UsageRecord[]> {
		try {
			return await this.get<UsageRecord[]>(`/api-key/${apiKeyId}`, { params });
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get usage records");
			}
			throw new Error("Failed to get usage records");
		}
	}

	/**
	 * Get usage statistics for an API key
	 */
	async getUsageStatsByAPIKey(
		apiKeyId: number,
		params?: {
			startDate?: string;
			endDate?: string;
		},
	): Promise<UsageStats> {
		try {
			return await this.get<UsageStats>(`/api-key/${apiKeyId}/stats`, {
				params,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get usage stats");
			}
			throw new Error("Failed to get usage stats");
		}
	}

	/**
	 * Get usage records by organization ID (admin endpoint)
	 */
	async getUsageByOrganization(
		organizationId: string,
		params?: {
			limit?: number;
			offset?: number;
		},
	): Promise<UsageRecord[]> {
		try {
			return await this.get<UsageRecord[]>(`/organization/${organizationId}`, {
				params,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get organization usage");
			}
			throw new Error("Failed to get organization usage");
		}
	}

	/**
	 * Get usage statistics by organization ID (admin endpoint)
	 */
	async getUsageStatsByOrganization(
		organizationId: string,
		params?: {
			startDate?: string;
			endDate?: string;
		},
	): Promise<UsageStats> {
		try {
			return await this.get<UsageStats>(
				`/organization/${organizationId}/stats`,
				{ params },
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					error.message || "Failed to get organization usage stats",
				);
			}
			throw new Error("Failed to get organization usage stats");
		}
	}

	/**
	 * Get usage records by project ID (admin endpoint)
	 */
	async getUsageByProject(
		projectId: number,
		params?: {
			limit?: number;
			offset?: number;
		},
	): Promise<UsageRecord[]> {
		try {
			return await this.get<UsageRecord[]>(`/project/${projectId}`, { params });
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get project usage");
			}
			throw new Error("Failed to get project usage");
		}
	}

	/**
	 * Get usage statistics by project ID (admin endpoint)
	 */
	async getUsageStatsByProject(
		projectId: number,
		params?: {
			startDate?: string;
			endDate?: string;
		},
	): Promise<UsageStats> {
		try {
			return await this.get<UsageStats>(`/project/${projectId}/stats`, {
				params,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get project usage stats");
			}
			throw new Error("Failed to get project usage stats");
		}
	}
}

/**
 * Singleton instance of the usage client
 */
export const usageClient = new UsageClient("");
