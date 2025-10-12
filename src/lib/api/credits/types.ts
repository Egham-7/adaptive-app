import { z } from "zod";

// Response schemas matching Go API
export const getBalanceResponseSchema = z.object({
	organization_id: z.string(),
	balance: z.number(),
	total_purchased: z.number(),
	total_used: z.number(),
});

export const checkCreditsResponseSchema = z.object({
	has_enough_credits: z.boolean(),
	current_balance: z.number(),
	required_amount: z.number(),
	shortfall: z.number().optional(),
});

export const transactionItemSchema = z.object({
	id: z.number(),
	organization_id: z.string(),
	user_id: z.string(),
	type: z.string(),
	amount: z.number(),
	balance_after: z.number(),
	description: z.string(),
	metadata: z.record(z.string(), z.any()).optional(),
	created_at: z.string(),
});

export const getTransactionHistoryResponseSchema = z.object({
	transactions: z.array(transactionItemSchema),
	total: z.number(),
	limit: z.number(),
	offset: z.number(),
});

export const createCheckoutSessionRequestSchema = z.object({
	organization_id: z.string(),
	user_id: z.string(),
	stripe_price_id: z.string(),
	credit_amount: z.number().min(0),
	success_url: z.string(),
	cancel_url: z.string(),
	customer_email: z.string().optional(),
});

export const createCheckoutSessionResponseSchema = z.object({
	session_id: z.string(),
	checkout_url: z.string(),
	amount: z.number(),
});

export const addCreditsRequestSchema = z.object({
	organization_id: z.string(),
	user_id: z.string(),
	amount: z.number(),
	type: z.enum(["purchase", "usage", "refund", "promotional"]),
	description: z.string(),
	metadata: z.record(z.string(), z.any()).optional(),
	stripe_payment_intent_id: z.string().optional(),
	stripe_session_id: z.string().optional(),
});

export const addCreditsResponseSchema = z.object({
	id: z.number(),
	organization_id: z.string(),
	user_id: z.string(),
	type: z.string(),
	amount: z.number(),
	balance_after: z.number(),
	description: z.string().optional(),
	metadata: z.record(z.string(), z.any()).optional(),
	created_at: z.string(),
});

// TypeScript types
export type GetBalanceResponse = z.infer<typeof getBalanceResponseSchema>;
export type CheckCreditsResponse = z.infer<typeof checkCreditsResponseSchema>;
export type TransactionItem = z.infer<typeof transactionItemSchema>;
export type GetTransactionHistoryResponse = z.infer<
	typeof getTransactionHistoryResponseSchema
>;
export type CreateCheckoutSessionRequest = z.infer<
	typeof createCheckoutSessionRequestSchema
>;
export type CreateCheckoutSessionResponse = z.infer<
	typeof createCheckoutSessionResponseSchema
>;
export type AddCreditsRequest = z.infer<typeof addCreditsRequestSchema>;
export type AddCreditsResponse = z.infer<typeof addCreditsResponseSchema>;
