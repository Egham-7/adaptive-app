import type { NextRequest } from "next/server";
import { env } from "@/env";
import { extractModelFromGeminiParam } from "@/lib/gemini-utils";
import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";

export async function POST(
	req: NextRequest,
	{ params }: { params: { model: string } },
) {
	try {
		const model = extractModelFromGeminiParam(params.model);

		const apiKey =
			req.headers.get("x-goog-api-key") ||
			req.headers.get("authorization")?.replace("Bearer ", "") ||
			req.headers.get("x-api-key") ||
			req.headers.get("api-key");

		if (!apiKey) {
			return new Response(
				JSON.stringify({
					error: {
						code: 401,
						message:
							"API key required. Provide it via x-goog-api-key, Authorization: Bearer, X-API-Key, or api-key header",
						status: "UNAUTHENTICATED",
					},
				}),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const verificationResult = await api.api_keys.verify({ apiKey });
		if (!verificationResult.valid) {
			return new Response(
				JSON.stringify({
					error: {
						code: 401,
						message: "Invalid API key",
						status: "UNAUTHENTICATED",
					},
				}),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const body = await req.text();

		const response = await fetch(
			`${env.ADAPTIVE_API_BASE_URL}/v1beta/models/${model}:generateContent`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-goog-api-key": "internal",
				},
				body,
			},
		);

		if (!response.ok) {
			return new Response(await response.text(), {
				status: response.status,
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response(await response.text(), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Gemini generateContent API error:", error);
		return new Response(
			JSON.stringify({
				error: {
					code: 500,
					message: "Internal server error",
					status: "INTERNAL",
				},
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
