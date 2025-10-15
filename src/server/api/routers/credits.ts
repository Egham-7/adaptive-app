import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { CreditsClient } from "@/lib/api/credits";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const creditsRouter = createTRPCRouter({
	getBalance: protectedProcedure
		.input(z.object({ organizationId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new CreditsClient(token);
				const response = await client.getBalance(input.organizationId);
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

	getStats: protectedProcedure
		.input(z.object({ organizationId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new CreditsClient(token);
				const response = await client.getBalance(input.organizationId);
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

	getTransactionHistory: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new CreditsClient(token);
				const response = await client.getTransactionHistory(
					input.organizationId,
					{
						limit: input.limit,
						offset: input.offset,
					},
				);

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

	getLowBalanceStatus: protectedProcedure
		.input(z.object({ organizationId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new CreditsClient(token);
				const response = await client.getBalance(input.organizationId);
				const balance = response.balance;
				const LOW_BALANCE_THRESHOLD = 1.0;
				const VERY_LOW_BALANCE_THRESHOLD = 0.1;

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

	createCheckoutSession: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				amount: z.number().min(1).max(10000),
				successUrl: z.string(),
				cancelUrl: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new CreditsClient(token);
				const response = await client.createCheckoutSession({
					organization_id: input.organizationId,
					user_id: userId,
					stripe_price_id: "",
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

	addPromotionalCredits: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				amount: z.number().min(0).max(100),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.clerkAuth.userId;

			try {
				const token = await ctx.clerkAuth.getToken();
				if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

				const client = new CreditsClient(token);
				const response = await client.addCredits({
					organization_id: input.organizationId,
					user_id: userId,
					amount: input.amount,
					type: "promotional",
					description: "Welcome bonus for new organization",
					metadata: {
						source: "onboarding",
						timestamp: new Date().toISOString(),
					},
				});

				return {
					success: true,
					transaction: {
						id: response.id,
						amount: response.amount,
						balanceAfter: response.balance_after,
						formattedAmount: `+$${response.amount.toFixed(2)}`,
						formattedBalance: `$${response.balance_after.toFixed(2)}`,
					},
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Failed to add promotional credits",
				});
			}
		}),
});
