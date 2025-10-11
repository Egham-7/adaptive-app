import type { NextRequest } from "next/server";
import { TOKEN_PRICING } from "@/lib/config/pricing";
import { safeParseJson } from "@/lib/server/json-utils";
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

	// Pre-flight credit check for select-model request ($0.001 per request)
	// Convert $0.001 to tokens using centralized pricing
	const selectModelCostInTokens = TOKEN_PRICING.tokensForUsd(0.001);

	try {
		await api.credits.checkCreditsBeforeUsage({
			apiKey,
			estimatedInputTokens: selectModelCostInTokens,
			estimatedOutputTokens: 0,
		});
	} catch (error: unknown) {
		const statusCode =
			(error as { code?: string }).code === "PAYMENT_REQUIRED" ? 402 : 400;
		return new Response(
			JSON.stringify({
				error: (error as { message?: string }).message || "Credit check failed",
			}),
			{
				status: statusCode,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
	// Call the tRPC selectModel procedure
	const result = await api.selectModel.selectModel({
		request: body,
	});

	return Response.json(result);
}
