import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		DATABASE_URL: z.url(),
		REDIS_URL: z.url(),
		RESEND_API_KEY: z.string().min(1),
		ADAPTIVE_API_BASE_URL: z.url().default("http://localhost:8080/v1"),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),

		POSTHOG_API_KEY: z.string().min(1),
		POSTHOG_ENV_ID: z.string().min(1),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		NEXT_PUBLIC_POSTHOG_API_HOST: z.url().default("https://app.posthog.com"),
		NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
		NEXT_PUBLIC_ADAPTIVE_API_BASE_URL: z.url(),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		REDIS_URL: process.env.REDIS_URL,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		ADAPTIVE_API_BASE_URL: process.env.ADAPTIVE_API_BASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
		POSTHOG_ENV_ID: process.env.POSTHOG_ENV_ID,
		NEXT_PUBLIC_POSTHOG_API_HOST: process.env.POSTHOG_API_HOST,
		NEXT_PUBLIC_POSTHOG_KEY: process.env.POSTHOG_KEY,
		NEXT_PUBLIC_ADAPTIVE_API_BASE_URL:
			process.env.NEXT_PUBLIC_ADAPTIVE_API_BASE_URL,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	/**
	 * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
	 * `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true,
});
