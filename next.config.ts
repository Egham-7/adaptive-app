/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import { withPostHogConfig } from "@posthog/nextjs-config";
import type { NextConfig } from "next";
import { env } from "./src/env.js";

const config: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "assets.aceternity.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "ik.imagekit.io",
				port: "",
				pathname: "/**",
			},
		],
	},

	async rewrites() {
		return [
			{
				source: "/ingest/static/:path*",
				destination: "https://eu-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ingest/:path*",
				destination: "https://eu.i.posthog.com/:path*",
			},
		];
	},

	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
};

export default withPostHogConfig(config, {
	personalApiKey: env.POSTHOG_API_KEY, // Personal API Key
	envId: env.POSTHOG_ENV_ID, // Environment ID
	host: env.NEXT_PUBLIC_POSTHOG_API_HOST, // (optional), defaults to https://us.posthog.com
	sourcemaps: {
		// (optional)
		enabled: process.env.NODE_ENV === "production", // Only enable sourcemaps in production builds
		project: "adaptive", // (optional) Project name, defaults to repository name
		deleteAfterUpload: true, // (optional) Delete sourcemaps after upload, defaults to true
	},
});
