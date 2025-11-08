import { type BetterFetchResponse, betterFetch } from "@better-fetch/fetch";
import { env } from "@/env";

/**
 * Configuration for API client
 */
export interface ApiClientConfig {
	baseURL: string;
	basePath?: string;
	token: string;
}

/**
 * Options for API requests
 */
export interface RequestOptions<T = unknown> {
	headers?: Record<string, string>;
	body?: T;
	params?: Record<
		string,
		string | number | boolean | string[] | undefined | null
	>;
}

/**
 * Base API client for making requests to the Adaptive backend
 * Provides standardized methods for HTTP operations with proper error handling
 */
export class BaseApiClient {
	protected readonly baseURL: string;
	protected readonly basePath: string;
	protected readonly token?: string;

	constructor(config?: Partial<ApiClientConfig>) {
		this.baseURL = config?.baseURL ?? env.ADAPTIVE_API_BASE_URL;
		this.basePath = config?.basePath ?? "";
		this.token = config?.token;
	}

	protected getAuthHeaders(): Record<string, string> {
		if (!this.token) {
			return {};
		}

		return {
			Authorization: `Bearer ${this.token}`,
		};
	}

	/**
	 * Build full URL with optional query parameters
	 */
	protected buildUrl(path: string, params?: RequestOptions["params"]): string {
		const fullPath = `${this.basePath}${path}`;
		const url = new URL(fullPath, this.baseURL);

		if (params) {
			for (const [key, value] of Object.entries(params)) {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						// Handle arrays with repeated keys (e.g., ?author=openai&author=anthropic)
						for (const item of value) {
							url.searchParams.append(key, String(item));
						}
					} else {
						url.searchParams.set(key, String(value));
					}
				}
			}
		}

		return url.toString();
	}

	/**
	 * Make a GET request
	 */
	protected async get<TResponse>(
		path: string,
		options?: RequestOptions,
	): Promise<TResponse> {
		const url = this.buildUrl(path, options?.params);
		const authHeaders = this.getAuthHeaders();

		const response = await betterFetch<TResponse>(url, {
			method: "GET",
			headers: { ...authHeaders, ...options?.headers },
		});

		if (!response.data) {
			// Check if this is a 404 by looking at the response object
			const errorMessage = response.error?.message ?? "Request failed";
			const is404 =
				errorMessage.toLowerCase().includes("not found") ||
				errorMessage.toLowerCase().includes("404") ||
				(response as BetterFetchResponse<TResponse> & { status?: number })
					.status === 404;
			throw new Error(is404 ? "not found" : errorMessage);
		}

		return response.data;
	}

	/**
	 * Make a POST request
	 */
	protected async post<TResponse, TBody = unknown>(
		path: string,
		options?: RequestOptions<TBody>,
	): Promise<TResponse> {
		const url = this.buildUrl(path, options?.params);
		const authHeaders = this.getAuthHeaders();

		const response = await betterFetch<TResponse>(url, {
			method: "POST",
			headers: { ...authHeaders, ...options?.headers },
			body: options?.body,
		});

		if (!response.data) {
			throw new Error(response.error?.message ?? "Request failed");
		}

		return response.data;
	}

	/**
	 * Make a PATCH request
	 */
	protected async patch<TResponse, TBody = unknown>(
		path: string,
		options?: RequestOptions<TBody>,
	): Promise<TResponse> {
		const url = this.buildUrl(path, options?.params);
		const authHeaders = this.getAuthHeaders();

		const response = await betterFetch<TResponse>(url, {
			method: "PATCH",
			headers: { ...authHeaders, ...options?.headers },
			body: options?.body,
		});

		if (!response.data) {
			throw new Error(response.error?.message ?? "Request failed");
		}

		return response.data;
	}

	/**
	 * Make a DELETE request
	 */
	protected async delete<TResponse = void>(
		path: string,
		options?: RequestOptions,
	): Promise<TResponse> {
		const url = this.buildUrl(path, options?.params);
		const authHeaders = this.getAuthHeaders();

		const response = await betterFetch<TResponse>(url, {
			method: "DELETE",
			headers: { ...authHeaders, ...options?.headers },
		});

		if (response.error) {
			throw new Error(response.error.message ?? "Request failed");
		}

		return response.data as TResponse;
	}
}
