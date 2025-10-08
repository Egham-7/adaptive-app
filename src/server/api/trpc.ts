import { auth as getClerkAuth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError, z } from "zod";
import { db } from "@/server/db";

export const createTRPCContext = async (opts: { headers: Headers }) => {
	return {
		db,
		...opts,
	};
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof ZodError ? z.treeifyError(error.cause) : null,
			},
		};
	},
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
	const start = Date.now();

	if (t._config.isDev) {
		const waitMs = Math.floor(Math.random() * 400) + 100;
		await new Promise((resolve) => setTimeout(resolve, waitMs));
	}

	const result = await next();

	const end = Date.now();
	console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

	return result;
});

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
	const clerkAuthResult = await getClerkAuth();

	if (!clerkAuthResult.userId) {
		throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
	}

	return next({
		ctx: {
			...ctx,
			clerkAuth: clerkAuthResult,
			userId: clerkAuthResult.userId,
		},
	});
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
	.use(timingMiddleware)
	.use(enforceUserIsAuthed);
