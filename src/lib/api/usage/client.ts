import type {
	RecordUsageRequest,
	UsageRecord,
	UsageStats,
} from "@/types/usage";
import { BaseApiClient } from "../base-client";

/**
 * Usage API client for interacting with adaptive-proxy usage endpoints
 * Extends BaseApiClient to provide usage tracking operations
 */
export class UsageClient extends BaseApiClient {
	constructor(token: string) {
		super({ basePath: "/v1/usage", token });
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
}

/**
 * Singleton instance of the usage client
 */
export const usageClient = new UsageClient("");
