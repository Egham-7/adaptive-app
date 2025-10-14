import type { NextRequest } from "next/server";
import { env } from "@/env";
import { api } from "@/trpc/server";
import type { ProviderConfig } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	try {
		const authHeader = req.headers.get("authorization");

		const bearerToken = authHeader?.startsWith("Bearer ")
			? authHeader.slice(7).replace(/\s+/g, "") || null
			: null;

		const apiKey =
			bearerToken ||
			req.headers.get("x-api-key") ||
			req.headers.get("api-key") ||
			req.headers.get("x-stainless-api-key");

		if (!apiKey) {
			return new Response(
				JSON.stringify({
					error:
						"API key required. Provide it via Authorization: Bearer, X-API-Key, api-key, or X-Stainless-API-Key header",
				}),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const verificationResult = await api.api_keys.verify({
			apiKey,
		});

		if (!verificationResult.valid) {
			return new Response(JSON.stringify({ error: "Invalid API key" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Provider configs removed during refactor - will be handled by proxy
		const providerConfigs: Record<string, ProviderConfig> = {};

		const bodyText = await req.text();
		const bodyJson = JSON.parse(bodyText);

		const bodyWithProviders = {
			...bodyJson,
			provider_configs: providerConfigs,
		};

		const response = await fetch(
			`${env.ADAPTIVE_API_BASE_URL}/v1/chat/completions`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer internal",
				},
				body: JSON.stringify(bodyWithProviders),
			},
		);

		if (!response.ok) {
			return new Response(await response.text(), {
				status: response.status,
				headers: { "Content-Type": "application/json" },
			});
		}

		if (response.headers.get("content-type")?.includes("text/event-stream")) {
			return new Response(response.body, {
				headers: {
					Connection: "keep-alive",
					"Cache-Control": "no-cache, no-transform",
					"Content-Type": "text/event-stream; charset=utf-8",
				},
			});
		}

		return new Response(await response.text(), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.log("Error: ", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
