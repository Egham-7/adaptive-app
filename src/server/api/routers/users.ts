import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const usersRouter = createTRPCRouter({
	/**
	 * Get user by ID from Clerk
	 */
	getById: protectedProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ input }) => {
			try {
				const user = await (await clerkClient()).users.getUser(input.userId);

				return {
					id: user.id,
					firstName: user.firstName,
					lastName: user.lastName,
					imageUrl: user.imageUrl,
					emailAddresses: user.emailAddresses.map((email) => ({
						emailAddress: email.emailAddress,
					})),
				};
			} catch (error) {
				// User not found or error fetching
				console.error("Error fetching user:", error);
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}
		}),
});
