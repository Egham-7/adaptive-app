import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { creditsClient } from "@/lib/api/credits";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

/**
 * Helper function to verify user has access to organization
 */
async function verifyOrganizationAccess(
	ctx: { clerkAuth: { userId: string | null }; db: any },
	organizationId: string,
): Promise<boolean> {
	const userId = ctx.clerkAuth.userId;
	if (!userId) return false;

	const organization = await ctx.db.organization.findFirst({
		where: {
			id: organizationId,
			OR: [{ ownerId: userId }, { members: { some: { userId } } }],
		},
	});

	return !!organization;
}

/**
 * Credits router - proxies requests to Go backend (adaptive-proxy)
 * All credit operations are handled by the Go backend
 */
export const creditsRouter = createTRPCRouter({
	// Get organization's current credit balance
	getBalance: protectedProcedure
		.input(z.object({ organizationId: z.string() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			if (!userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			// Verify user has access to this organization
			const hasAccess = await verifyOrganizationAccess(
				ctx,
				input.organizationId,
			);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You don't have access to this organization",
				});
			}

			try {
				const response = await creditsClient.getBalance(input.organizationId);
				return {
					balance: response.balance,
					formattedBalance: `$${response.balance.toFixed(2)}`,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Failed to fetch credit balance",
				});
			}
		}),

	// Get comprehensive credit statistics
	getStats: protectedProcedure
		.input(z.object({ organizationId: z.string() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			if (!userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			// Verify user has access to this organization
			const hasAccess = await verifyOrganizationAccess(
				ctx,
				input.organizationId,
			);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You don't have access to this organization",
				});
			}

			try {
				const response = await creditsClient.getBalance(input.organizationId);
				return {
					currentBalance: response.balance,
					totalPurchased: response.total_purchased,
					totalUsed: response.total_used,
					formatted: {
						currentBalance: `$${response.balance.toFixed(2)}`,
						totalPurchased: `$${response.total_purchased.toFixed(2)}`,
						totalUsed: `$${response.total_used.toFixed(2)}`,
					},
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Failed to fetch credit statistics",
				});
			}
		}),

	// Get transaction history with pagination and filtering
	getTransactionHistory: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			if (!userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			// Verify user has access to this organization
			const hasAccess = await verifyOrganizationAccess(
				ctx,
				input.organizationId,
			);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You don't have access to this organization",
				});
			}

			try {
				const response = await creditsClient.getTransactionHistory(
					input.organizationId,
					{
						limit: input.limit,
						offset: input.offset,
					},
				);

				// Format transactions for UI display
				const formattedTransactions = response.transactions.map(
					(transaction) => {
						const amount = transaction.amount;
						return {
							...transaction,
							formattedAmount:
								amount >= 0
									? `+$${amount.toFixed(2)}`
									: `-$${Math.abs(amount).toFixed(2)}`,
							formattedBalance: `$${transaction.balance_after.toFixed(2)}`,
							readableType: (() => {
								const typeMap: Record<string, string> = {
									purchase: "Credit Purchase",
									usage: "API Usage",
									refund: "Refund",
									promotional: "Promotional Credit",
								};
								return typeMap[transaction.type] ?? transaction.type;
							})(),
						};
					},
				);

				return {
					transactions: formattedTransactions,
					hasMore: response.transactions.length === input.limit,
					nextOffset: input.offset + response.transactions.length,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Failed to fetch transaction history",
				});
			}
		}),

	// Get low balance warning threshold (frontend-only logic)
	getLowBalanceStatus: protectedProcedure
		.input(z.object({ organizationId: z.string() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			if (!userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			// Verify user has access to this organization
			const hasAccess = await verifyOrganizationAccess(
				ctx,
				input.organizationId,
			);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You don't have access to this organization",
				});
			}

			try {
				const response = await creditsClient.getBalance(input.organizationId);
				const balance = response.balance;
				const LOW_BALANCE_THRESHOLD = 1.0; // $1.00
				const VERY_LOW_BALANCE_THRESHOLD = 0.1; // $0.10

				let status: "good" | "low" | "very_low" | "empty" = "good";
				let message = "";

				if (balance <= 0) {
					status = "empty";
					message =
						"Your credit balance is empty. Please purchase credits to continue using the API.";
				} else if (balance <= VERY_LOW_BALANCE_THRESHOLD) {
					status = "very_low";
					message = `Your credit balance is very low ($${balance.toFixed(
						2,
					)}). Please consider purchasing credits soon.`;
				} else if (balance <= LOW_BALANCE_THRESHOLD) {
					status = "low";
					message = `Your credit balance is low ($${balance.toFixed(
						2,
					)}). Consider purchasing credits.`;
				}

				return {
					balance,
					status,
					message,
					thresholds: {
						low: LOW_BALANCE_THRESHOLD,
						veryLow: VERY_LOW_BALANCE_THRESHOLD,
					},
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Failed to check balance status",
				});
			}
		}),

	// Create Stripe checkout session for credit purchase
	createCheckoutSession: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				amount: z.number().min(1).max(10000), // $1 minimum, $10,000 maximum
				successUrl: z.string(),
				cancelUrl: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			if (!userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			// Verify user has access to this organization
			const hasAccess = await verifyOrganizationAccess(
				ctx,
				input.organizationId,
			);
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You don't have access to this organization",
				});
			}

			try {
				const response = await creditsClient.createCheckoutSession({
					organization_id: input.organizationId,
					user_id: userId,
					stripe_price_id: "", // Will be determined by amount
					credit_amount: input.amount,
					success_url: input.successUrl,
					cancel_url: input.cancelUrl,
				});

				return {
					checkoutUrl: response.checkout_url,
					sessionId: response.session_id,
					amount: input.amount,
					formattedAmount: `$${input.amount.toFixed(2)}`,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Failed to create checkout session",
				});
			}
		}),
});
