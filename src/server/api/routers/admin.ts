import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

// Admin user IDs from environment variable
const ADMIN_USER_IDS =
	process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()) || [];

/**
 * Middleware to check if user is admin
 */
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	const userId = ctx.userId;

	if (!userId || !ADMIN_USER_IDS.includes(userId)) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin access required",
		});
	}

	return next({
		ctx: {
			...ctx,
			userId,
		},
	});
});

export const adminRouter = createTRPCRouter({
	/**
	 * Get detailed promotional credit statistics
	 * Admin only - shows all promotional credit awards
	 * NOTE: This functionality has been moved to the Go backend (adaptive-proxy)
	 * TODO: Implement by calling Go backend admin endpoints when needed
	 */
	getPromotionalStats: adminProcedure.query(async () => {
		// Placeholder - to be implemented by calling Go backend
		return {
			totalAwarded: 0,
			totalUsers: 0,
			transactions: [],
			stats: {
				used: 0,
				remaining: 0,
				available: false,
			},
			config: {
				FREE_CREDIT_AMOUNT: 0,
				MAX_PROMOTIONAL_USERS: 0,
				ENABLED: false,
				DESCRIPTION:
					"Promotional credits system (To be implemented in Go backend)",
			},
		};
	}),
});
