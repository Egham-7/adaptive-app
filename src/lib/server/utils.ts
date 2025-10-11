/**
 * Safe JSON parsing utilities for Next.js API routes
 */

import type { JsonErrorResponse } from "@/types/api-responses";

/**
 * Safely parses JSON from a Request object with proper error handling
 * @param req The Request object
 * @returns Promise that resolves to parsed JSON or throws a Response with 400 status
 */
export async function safeParseJson<T = unknown>(req: Request): Promise<T> {
	try {
		const json = await req.json();
		return json as T;
	} catch (parseError) {
		const errorResponse: JsonErrorResponse = {
			error: {
				code: 400,
				message: "Invalid JSON in request body",
				status: "INVALID_ARGUMENT",
				details:
					parseError instanceof Error ? parseError.message : "JSON parse error",
			},
		};

		throw new Response(JSON.stringify(errorResponse), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}
}

/**
 * Creates a standardized error response for API routes
 * @param message Error message
 * @param status HTTP status code
 * @param code Error code
 * @param details Additional error details
 * @returns Response object with error
 */
export function createErrorResponse(
	message: string,
	status = 400,
	code = "INVALID_ARGUMENT",
	details?: string,
): Response {
	const errorResponse: JsonErrorResponse = {
		error: {
			code: status,
			message,
			status: code,
			details: details ?? message,
		},
	};

	return new Response(JSON.stringify(errorResponse), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

import type { NextRequest } from "next/server";

/**
 * Extracts API key from OpenAI-compatible request headers
 */
export function extractApiKey(req: NextRequest): string | null {
	const authHeader = req.headers.get("authorization");
	const bearerToken = authHeader?.startsWith("Bearer ")
		? authHeader.slice(7).replace(/\s+/g, "") || null
		: null;

	return (
		bearerToken ||
		req.headers.get("x-api-key") ||
		req.headers.get("api-key") ||
		req.headers.get("x-stainless-api-key")
	);
}

/**
 * Creates standardized 401 Unauthorized response for missing API key
 */
export function createAuthError(): Response {
	return new Response(
		JSON.stringify({
			error: {
				message: "API key required",
				details:
					"Provide it via Authorization: Bearer, X-API-Key, api-key, or X-Stainless-API-Key header",
			},
		}),
		{
			status: 401,
			headers: { "Content-Type": "application/json" },
		},
	);
}

/**
 * Creates standardized success response
 */
export function createSuccessResponse(data: unknown, status = 200): Response {
	return Response.json(data, { status });
}
