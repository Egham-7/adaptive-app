import type { NextRequest } from "next/server";
import { safeParseJson } from "@/lib/server/utils";
import { api } from "@/trpc/server";
import { selectModelRequestSchema } from "@/types/select-model";

export async function POST(req: NextRequest) {
	const rawBody = await safeParseJson(req);

	// Validate request body against schema
	const validationResult = selectModelRequestSchema.safeParse(rawBody);
	if (!validationResult.success) {
		return new Response(
			JSON.stringify({
				error: {
					message: "Invalid request format",
					details: validationResult.error.issues,
				},
			}),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	const body = validationResult.data;

	// Extract API key from OpenAI-compatible headers
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

	// Verify API key
	const verificationResult = await api.api_keys.verify({
		apiKey,
	});

	if (!verificationResult.valid) {
		return new Response(JSON.stringify({ error: "Invalid API key" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	// NOTE: Credit checking is now handled by the Go backend (adaptive-proxy)
	// The Go backend middleware automatically checks and deducts credits
	// No need for pre-flight credit checks in frontend API routes

	// Call the tRPC selectModel procedure
	const result = await api.selectModel.selectModel({
		request: body,
	});

	return Response.json(result);
}
