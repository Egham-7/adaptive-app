import type { GetStatsResponse } from "@/types/api-keys";
import type {
	RecordUsageRequest,
	UsageByPeriod,
	UsageRecord,
	UsageStats,
} from "@/types/usage";
import { BaseApiClient } from "../base-client";

/**
 * Usage API client for interacting with adaptive-proxy usage endpoints
 * Extends BaseApiClient to provide usage tracking operations
 */
export class UsageClient extends BaseApiClient {
	constructor() {
		super({ basePath: "/v1/usage" });
	}

	/**
	 * Record API usage
	 */
	async recordUsage(data: RecordUsageRequest): Promise<UsageRecord> {
		try {
			return await this.post<UsageRecord, RecordUsageRequest>("/", {
				body: data,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to record usage");
			}
			throw new Error("Failed to record usage");
		}
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
			return await this.get<UsageRecord[]>(`/${apiKeyId}`, { params });
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
	async getUsageStats(
		apiKeyId: number,
		params?: {
			startDate?: string;
			endDate?: string;
		},
	): Promise<UsageStats> {
		try {
			return await this.get<UsageStats>(`/${apiKeyId}/stats`, { params });
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get usage stats");
			}
			throw new Error("Failed to get usage stats");
		}
	}

	/**
	 * Get detailed usage statistics for an API key (via API keys endpoint)
	 */
	async getStats(
		apiKeyId: number,
		params?: {
			start_time?: string;
			end_time?: string;
		},
	): Promise<GetStatsResponse> {
		try {
			return await this.get<GetStatsResponse>(
				`/admin/api-keys/${apiKeyId}/stats`,
				{ params },
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get stats");
			}
			throw new Error("Failed to get stats");
		}
	}

	/**
	 * Get usage grouped by time period
	 */
	async getUsageByPeriod(
		apiKeyId: number,
		params?: {
			startDate?: string;
			endDate?: string;
			groupBy?: "day" | "week" | "month";
		},
	): Promise<UsageByPeriod[]> {
		try {
			return await this.get<UsageByPeriod[]>(`/${apiKeyId}/by-period`, {
				params,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get usage by period");
			}
			throw new Error("Failed to get usage by period");
		}
	}
}

/**
 * Singleton instance of the usage client
 */
export const usageClient = new UsageClient();
