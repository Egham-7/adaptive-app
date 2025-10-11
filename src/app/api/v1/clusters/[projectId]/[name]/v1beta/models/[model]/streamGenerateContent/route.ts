import type { NextRequest } from "next/server";
import { env } from "@/env";
import { extractModelFromGeminiParam } from "@/lib/gemini-utils";
import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";

export async function POST(
	req: NextRequest,
	{
		params,
	}: { params: Promise<{ projectId: string; name: string; model: string }> },
) {
	const { projectId, name, model: modelParam } = await params;

	try {
		const model = extractModelFromGeminiParam(modelParam);

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

		if (verificationResult.projectId !== projectId) {
			return new Response(
				JSON.stringify({
					error: {
						code: 403,
						message: "API key does not have access to the specified project",
						status: "PERMISSION_DENIED",
					},
				}),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const body = await req.text();

		const response = await fetch(
			`${env.ADAPTIVE_API_BASE_URL}/v1/clusters/${projectId}/${name}/v1beta/models/${model}:streamGenerateContent`,
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

		return new Response(response.body, {
			headers: {
				"Content-Type": "text/event-stream; charset=utf-8",
				"Cache-Control": "no-cache, no-transform",
				Pragma: "no-cache",
				"X-Accel-Buffering": "no",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("Gemini cluster streamGenerateContent API error:", error);
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
