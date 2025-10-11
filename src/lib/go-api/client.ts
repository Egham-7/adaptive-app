import { betterFetch } from "@better-fetch/fetch";
import { env } from "@/env";
import type {
	ApiKeyResponse,
	CreateApiKeyRequest,
	GetStatsResponse,
	GetUsageResponse,
	ListApiKeysResponse,
	UpdateApiKeyRequest,
	VerifyApiKeyRequest,
	VerifyApiKeyResponse,
} from "@/types/go-api-keys";

const baseURL = env.ADAPTIVE_API_BASE_URL;

export const goApiClient = {
	apiKeys: {
		async create(data: CreateApiKeyRequest): Promise<ApiKeyResponse> {
			const response = await betterFetch<ApiKeyResponse>("/admin/api-keys", {
				method: "POST",
				baseURL,
				body: data,
			});

			if (!response.data) {
				throw new Error(response.error?.message ?? "Failed to create API key");
			}

			return response.data;
		},

		async list(params?: {
			limit?: number;
			offset?: number;
			metadata?: string;
		}): Promise<ListApiKeysResponse> {
			const searchParams = new URLSearchParams();
			if (params?.limit) searchParams.set("limit", params.limit.toString());
			if (params?.offset) searchParams.set("offset", params.offset.toString());
			if (params?.metadata) searchParams.set("metadata", params.metadata);

			const response = await betterFetch<ListApiKeysResponse>(
				`/admin/api-keys?${searchParams.toString()}`,
				{
					method: "GET",
					baseURL,
				},
			);

			if (!response.data) {
				throw new Error(response.error?.message ?? "Failed to list API keys");
			}

			return response.data;
		},

		async get(id: number): Promise<ApiKeyResponse> {
			const response = await betterFetch<ApiKeyResponse>(
				`/admin/api-keys/${id}`,
				{
					method: "GET",
					baseURL,
				},
			);

			if (!response.data) {
				throw new Error(response.error?.message ?? "Failed to get API key");
			}

			return response.data;
		},

		async update(
			id: number,
			data: UpdateApiKeyRequest,
		): Promise<ApiKeyResponse> {
			const response = await betterFetch<ApiKeyResponse>(
				`/admin/api-keys/${id}`,
				{
					method: "PATCH",
					baseURL,
					body: data,
				},
			);

			if (!response.data) {
				throw new Error(response.error?.message ?? "Failed to update API key");
			}

			return response.data;
		},

		async delete(id: number): Promise<void> {
			const response = await betterFetch(`/admin/api-keys/${id}`, {
				method: "DELETE",
				baseURL,
			});

			if (response.error) {
				throw new Error(response.error.message ?? "Failed to delete API key");
			}
		},

		async revoke(id: number): Promise<ApiKeyResponse> {
			const response = await betterFetch<ApiKeyResponse>(
				`/admin/api-keys/${id}/revoke`,
				{
					method: "POST",
					baseURL,
				},
			);

			if (!response.data) {
				throw new Error(response.error?.message ?? "Failed to revoke API key");
			}

			return response.data;
		},

		async verify(data: VerifyApiKeyRequest): Promise<VerifyApiKeyResponse> {
			const response = await betterFetch<VerifyApiKeyResponse>(
				"/admin/api-keys/verify",
				{
					method: "POST",
					baseURL,
					body: data,
				},
			);

			if (!response.data) {
				throw new Error(response.error?.message ?? "Failed to verify API key");
			}

			return response.data;
		},

		async getUsage(
			id: number,
			params?: { start_date?: string; end_date?: string; limit?: number },
		): Promise<GetUsageResponse> {
			const searchParams = new URLSearchParams();
			if (params?.start_date) searchParams.set("start_date", params.start_date);
			if (params?.end_date) searchParams.set("end_date", params.end_date);
			if (params?.limit) searchParams.set("limit", params.limit.toString());

			const response = await betterFetch<GetUsageResponse>(
				`/admin/api-keys/${id}/usage?${searchParams.toString()}`,
				{
					method: "GET",
					baseURL,
				},
			);

			if (!response.data) {
				throw new Error(
					response.error?.message ?? "Failed to get API key usage",
				);
			}

			return response.data;
		},

		async getStats(
			id: number,
			params?: { start_date?: string; end_date?: string },
		): Promise<GetStatsResponse> {
			const searchParams = new URLSearchParams();
			if (params?.start_date) searchParams.set("start_date", params.start_date);
			if (params?.end_date) searchParams.set("end_date", params.end_date);

			const response = await betterFetch<GetStatsResponse>(
				`/admin/api-keys/${id}/stats?${searchParams.toString()}`,
				{
					method: "GET",
					baseURL,
				},
			);

			if (!response.data) {
				throw new Error(
					response.error?.message ?? "Failed to get API key stats",
				);
			}

			return response.data;
		},

		async resetBudget(id: number): Promise<ApiKeyResponse> {
			const response = await betterFetch<ApiKeyResponse>(
				`/admin/api-keys/${id}/reset-budget`,
				{
					method: "POST",
					baseURL,
				},
			);

			if (!response.data) {
				throw new Error(
					response.error?.message ?? "Failed to reset API key budget",
				);
			}

			return response.data;
		},
	},
};
