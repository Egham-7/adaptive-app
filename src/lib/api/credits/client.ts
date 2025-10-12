import { BaseApiClient } from "../base-client";
import type {
	AddCreditsRequest,
	AddCreditsResponse,
	CreateCheckoutSessionRequest,
	CreateCheckoutSessionResponse,
	GetBalanceResponse,
	GetTransactionHistoryResponse,
} from "./types";

/**
 * Credits client for managing credits through the Adaptive backend
 * Extends BaseApiClient to provide credit-specific operations
 */
export class CreditsClient extends BaseApiClient {
	constructor() {
		super({ basePath: "/admin/credits" });
	}

	/**
	 * Get credit balance for an organization
	 */
	async getBalance(organizationId: string): Promise<GetBalanceResponse> {
		try {
			return await this.get<GetBalanceResponse>(`/balance/${organizationId}`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get credit balance");
			}
			throw new Error("Failed to get credit balance");
		}
	}

	/**
	 * Get transaction history for an organization
	 */
	async getTransactionHistory(
		organizationId: string,
		params?: {
			limit?: number;
			offset?: number;
		},
	): Promise<GetTransactionHistoryResponse> {
		try {
			return await this.get<GetTransactionHistoryResponse>(
				`/transactions/${organizationId}`,
				{ params },
			);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to get transaction history");
			}
			throw new Error("Failed to get transaction history");
		}
	}

	/**
	 * Create a Stripe checkout session for purchasing credits
	 */
	async createCheckoutSession(
		data: CreateCheckoutSessionRequest,
	): Promise<CreateCheckoutSessionResponse> {
		try {
			// Use the Stripe-specific endpoint
			const url = this.buildUrl("/admin/stripe/checkout-session");

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create checkout session");
			}

			return await response.json();
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to create checkout session");
			}
			throw new Error("Failed to create checkout session");
		}
	}

	/**
	 * Add credits to an organization (promotional, purchase, refund)
	 */
	async addCredits(data: AddCreditsRequest): Promise<AddCreditsResponse> {
		try {
			// Use the credits add endpoint
			const url = this.buildUrl("/admin/credits/add");

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to add credits");
			}

			return await response.json();
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message || "Failed to add credits");
			}
			throw new Error("Failed to add credits");
		}
	}

	/**
	 * Build full URL for API requests (used by createCheckoutSession)
	 * Override to make public for Stripe endpoint
	 */
	protected buildUrl(
		path: string,
		params?: Record<string, string | number | boolean | undefined | null>,
	): string {
		const fullPath = `${this.basePath}${path}`;
		const url = new URL(fullPath, this.baseURL);

		if (params) {
			for (const [key, value] of Object.entries(params)) {
				if (value !== undefined && value !== null) {
					url.searchParams.set(key, String(value));
				}
			}
		}

		return url.toString();
	}
}

/**
 * Singleton instance of the credits client
 */
export const creditsClient = new CreditsClient();

