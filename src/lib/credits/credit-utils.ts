import { TRPCError } from "@trpc/server";
import type { CreditTransactionType } from "prisma/generated";
import type { InputJsonValue } from "prisma/generated/runtime/library";
import {
	getPromotionalCreditStats,
	hasUserReceivedPromotionalCredits,
	PROMOTIONAL_CONFIG,
} from "@/lib/credits/config";
import { CREDIT_LIMITS, TOKEN_PRICING } from "@/lib/pricing/config";
import { db } from "@/server/db";

// ---- Core Credit Operations ----

/**
 * Get or create organization credit record
 * Every organization needs an OrganizationCredit record to track their balance
 * Automatically awards promotional credits to user's first organization (if available)
 */
export async function getOrCreateOrganizationCredit(organizationId: string) {
	try {
		// First, verify the organization exists
		const organization = await db.organization.findUnique({
			where: { id: organizationId },
		});

		if (!organization) {
			throw new Error(`Organization with ID ${organizationId} not found`);
		}

		// Use upsert to handle race conditions properly
		const userId = organization.ownerId;

		try {
			// Try to get existing credit first
			const existingCredit = await db.organizationCredit.findUnique({
				where: { organizationId },
			});

			if (existingCredit) {
				return existingCredit;
			}

			// Use transaction to ensure atomic operation and prevent race conditions
			return await db.$transaction(async (tx) => {
				// Check eligibility inside transaction for atomicity
				const [promoStats, userAlreadyHasPromo] = await Promise.all([
					getPromotionalCreditStats(),
					hasUserReceivedPromotionalCredits(userId),
				]);

				const shouldAwardPromoCredits =
					promoStats.available && !userAlreadyHasPromo;

				if (!shouldAwardPromoCredits) {
					return await tx.organizationCredit.create({
						data: {
							organizationId,
							balance: 0,
							totalPurchased: 0,
							totalUsed: 0,
						},
					});
				}

				// Create organization credit with promotional balance
				const orgCredit = await tx.organizationCredit.create({
					data: {
						organizationId,
						balance: PROMOTIONAL_CONFIG.FREE_CREDIT_AMOUNT,
						totalPurchased: 0,
						totalUsed: 0,
					},
				});

				// Create promotional credit transaction
				await tx.creditTransaction.create({
					data: {
						organizationId,
						userId,
						type: "promotional",
						amount: PROMOTIONAL_CONFIG.FREE_CREDIT_AMOUNT,
						balanceAfter: PROMOTIONAL_CONFIG.FREE_CREDIT_AMOUNT,
						description: PROMOTIONAL_CONFIG.DESCRIPTION,
						metadata: {
							promotionType: "new_user_bonus",
							awardedAt: new Date().toISOString(),
							promotionalUser: promoStats.used + 1,
							firstOrganization: true,
						},
					},
				});

				return orgCredit;
			});
		} catch (error: unknown) {
			// Handle race condition - if record was created by another request
			if (
				(error as { code?: string }).code === "P2002" &&
				(error as { meta?: { target?: string[] } }).meta?.target?.includes(
					"organizationId",
				)
			) {
				const existingCredit = await db.organizationCredit.findUnique({
					where: { organizationId },
				});
				if (existingCredit) {
					return existingCredit;
				}
			}
			throw error;
		}
	} catch (error) {
		console.error("Error in getOrCreateOrganizationCredit:", error);
		throw error;
	}
}

/**
 * Get organization's current credit balance
 */
export async function getOrganizationBalance(
	organizationId: string,
): Promise<number> {
	try {
		const orgCredit = await getOrCreateOrganizationCredit(organizationId);
		return orgCredit.balance?.toNumber() || 0;
	} catch (error) {
		console.error("Error getting organization balance:", error);
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: `Failed to get credit balance: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		});
	}
}

/**
 * Check if organization has sufficient credits for a cost
 */
export async function hasSufficientCredits(
	organizationId: string,
	requiredAmount: number,
): Promise<boolean> {
	const balance = await getOrganizationBalance(organizationId);
	return balance >= requiredAmount;
}

/**
 * Calculate credit cost for API usage based on token consumption
 * Uses centralized pricing configuration
 */
export function calculateCreditCost(
	inputTokens: number,
	outputTokens: number,
): number {
	const inputCost = TOKEN_PRICING.calculateInputCost(inputTokens);
	const outputCost = TOKEN_PRICING.calculateOutputCost(outputTokens);

	return inputCost + outputCost;
}

// ---- Credit Transaction Operations ----

/**
 * Add credits to organization's account (for purchases, refunds, promotions)
 * This method handles the transaction safely with database atomicity
 */
export async function addCredits(params: {
	organizationId: string;
	userId: string; // User who initiated the transaction
	amount: number;
	type: CreditTransactionType;
	description?: string;
	metadata?: InputJsonValue;
	stripePaymentIntentId?: string;
	stripeSessionId?: string;
}) {
	const {
		organizationId,
		userId,
		amount,
		type,
		description,
		metadata,
		stripePaymentIntentId,
		stripeSessionId,
	} = params;

	if (amount <= 0) {
		throw new Error("Credit amount must be positive");
	}

	if (!Number.isFinite(amount)) {
		throw new Error("Credit amount must be a finite number");
	}

	if (amount > CREDIT_LIMITS.MAXIMUM_PURCHASE) {
		throw new Error("Credit amount exceeds maximum allowed limit");
	}

	// Use database transaction to ensure data consistency
	return await db.$transaction(async (tx) => {
		// Get current organization credit state
		const orgCredit = await tx.organizationCredit.findUnique({
			where: { organizationId },
		});

		if (!orgCredit) {
			throw new Error("Organization credit record not found");
		}

		const currentBalance = orgCredit.balance.toNumber();
		const newBalance = currentBalance + amount;

		// Update organization credit balance and totals
		const updatedOrgCredit = await tx.organizationCredit.update({
			where: { organizationId },
			data: {
				balance: newBalance,
				totalPurchased:
					type === "purchase"
						? orgCredit.totalPurchased.toNumber() + amount
						: orgCredit.totalPurchased,
			},
		});

		// Create transaction record
		const transaction = await tx.creditTransaction.create({
			data: {
				organizationId,
				userId,
				type,
				amount,
				balanceAfter: newBalance,
				description: description || `${type} of $${amount.toFixed(2)}`,
				metadata,
				stripePaymentIntentId,
				stripeSessionId,
			},
		});

		return {
			organizationCredit: updatedOrgCredit,
			transaction,
			newBalance,
		};
	});
}

/**
 * Deduct credits from organization's account (for API usage)
 * This is the core method called when user makes API requests
 */
export async function deductCredits(params: {
	organizationId: string;
	userId: string; // User who made the API request
	amount: number;
	description?: string;
	metadata?: InputJsonValue;
	apiKeyId?: number;
	apiUsageId?: number; // Reference to usage record in adaptive-proxy
}) {
	const {
		organizationId,
		userId,
		amount,
		description,
		metadata,
		apiKeyId,
		apiUsageId,
	} = params;

	if (amount <= 0) {
		throw new Error("Deduction amount must be positive");
	}

	if (!Number.isFinite(amount)) {
		throw new Error("Deduction amount must be a finite number");
	}

	if (amount > CREDIT_LIMITS.MAXIMUM_DEDUCTION) {
		throw new Error("Deduction amount exceeds maximum allowed limit");
	}

	// Use database transaction for atomicity
	return await db.$transaction(async (tx) => {
		// Get current organization credit state
		const orgCredit = await tx.organizationCredit.findUnique({
			where: { organizationId },
		});

		if (!orgCredit) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message:
					"Organization credit record not found. Please contact support.",
			});
		}

		const currentBalance = orgCredit.balance.toNumber();

		// Check if organization has sufficient credits
		if (currentBalance < amount) {
			throw new TRPCError({
				code: "PAYMENT_REQUIRED",
				message: `Insufficient credits. Required: $${amount.toFixed(
					4,
				)}, Available: $${currentBalance.toFixed(4)}`,
			});
		}

		const newBalance = currentBalance - amount;

		// Update organization credit balance and totals
		const updatedOrgCredit = await tx.organizationCredit.update({
			where: { organizationId },
			data: {
				balance: newBalance,
				totalUsed: orgCredit.totalUsed.toNumber() + amount,
			},
		});

		// Create transaction record
		const transaction = await tx.creditTransaction.create({
			data: {
				organizationId,
				userId,
				type: "usage",
				amount: -amount, // Negative for deductions
				balanceAfter: newBalance,
				description: description || `API usage charge: $${amount.toFixed(4)}`,
				metadata,
				apiKeyId,
				apiUsageId,
			},
		});

		return {
			organizationCredit: updatedOrgCredit,
			transaction,
			newBalance,
			deductedAmount: amount,
		};
	});
}

// ---- Data Retrieval Operations ----

/**
 * Get organization's credit transaction history
 */
export async function getOrganizationTransactionHistory(
	organizationId: string,
	options: {
		limit?: number;
		offset?: number;
		type?: CreditTransactionType;
	} = {},
) {
	const { limit = 50, offset = 0, type } = options;

	const transactions = await db.creditTransaction.findMany({
		where: {
			organizationId,
			...(type && { type }),
		},
		orderBy: { createdAt: "desc" },
		take: limit,
		skip: offset,
		// Note: apiUsage is now tracked in adaptive-proxy, not in this database
		// apiUsageId is just a reference (number) to the record in adaptive-proxy
	});

	return transactions;
}

/**
 * Get credit statistics for an organization
 */
export async function getOrganizationCreditStats(organizationId: string) {
	const orgCredit = await getOrCreateOrganizationCredit(organizationId);

	// Get transaction counts by type
	const transactionStats = await db.creditTransaction.groupBy({
		by: ["type"],
		where: { organizationId },
		_count: { type: true },
		_sum: { amount: true },
	});

	// Calculate statistics
	const transactionCounts: Record<
		string,
		{ count: number; totalAmount: number }
	> = {};

	for (const stat of transactionStats) {
		transactionCounts[stat.type] = {
			count: stat._count.type || 0,
			totalAmount: stat._sum.amount ? Number(stat._sum.amount) : 0,
		};
	}

	const stats = {
		currentBalance: orgCredit.balance.toNumber(),
		totalPurchased: orgCredit.totalPurchased.toNumber(),
		totalUsed: orgCredit.totalUsed.toNumber(),
		transactionCounts,
	};

	return stats;
}

// ---- Promotional Credit Operations ----

/**
 * Award promotional credits to new organizations
 * This will be used for your $5 promotional credit for first 20 users
 */
export async function awardPromotionalCredits(
	organizationId: string,
	userId: string,
	amount: number,
	description: string,
) {
	// Check if organization has already received promotional credits
	const existingPromotion = await db.creditTransaction.findFirst({
		where: {
			organizationId,
			type: "promotional",
		},
	});

	if (existingPromotion) {
		throw new Error("Organization has already received promotional credits");
	}

	return await addCredits({
		organizationId,
		userId,
		amount,
		type: "promotional",
		description,
		metadata: {
			promotionType: "new_user_bonus",
			awardedAt: new Date().toISOString(),
		},
	});
}
