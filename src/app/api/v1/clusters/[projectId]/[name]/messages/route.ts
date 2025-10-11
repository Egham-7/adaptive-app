import type { NextRequest } from "next/server";
import { env } from "@/env";
import { api } from "@/trpc/server";

export const runtime = "nodejs";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ projectId: string; name: string }> },
) {
	try {
		const { projectId, name } = await params;

		const authHeader = request.headers.get("authorization");
		const bearerToken = authHeader?.startsWith("Bearer ")
			? authHeader.slice(7).replace(/\s+/g, "") || null
			: null;

		const apiKey =
			bearerToken ||
			request.headers.get("x-api-key") ||
			request.headers.get("api-key") ||
			request.headers.get("x-stainless-api-key");

		if (!apiKey) {
			return new Response(
				JSON.stringify({
					type: "error",
					error: {
						type: "authentication_error",
						message:
							"API key required. Provide it via Authorization: Bearer, X-API-Key, api-key, or X-Stainless-API-Key header",
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
					type: "error",
					error: {
						type: "authentication_error",
						message: "Invalid API key",
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
					type: "error",
					error: {
						type: "forbidden_error",
						message: "API key does not have access to the specified project",
					},
				}),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const cluster = await api.llmClusters.getByName({
			projectId: verificationResult.projectId,
			name,
		});

		if (!cluster) {
			return new Response(
				JSON.stringify({
					type: "error",
					error: {
						type: "not_found_error",
						message: `Cluster '${name}' not found in project '${projectId}'`,
					},
				}),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const body = await request.text();

		const response = await fetch(
			`${env.ADAPTIVE_API_BASE_URL}/v1/clusters/${projectId}/${name}/messages`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer internal",
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

		if (response.headers.get("content-type")?.includes("text/event-stream")) {
			return new Response(response.body, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				},
			});
		}

		return new Response(await response.text(), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Cluster Anthropic Messages API error:", error);
		return new Response(
			JSON.stringify({
				type: "error",
				error: {
					type: "api_error",
					message: "Internal server error",
				},
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
