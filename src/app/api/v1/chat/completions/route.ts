import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { decryptProviderApiKey } from "@/lib/auth";
import { safeParseJson } from "@/lib/server/json-utils";
import {
	filterUsageFromChunk,
	userRequestedUsage,
	withUsageTracking,
} from "@/lib/server/usage-utils";
import { api } from "@/trpc/server";
import type {
	AuthType,
	ChatCompletion,
	ChatCompletionChunk,
	ChatCompletionRequest,
	ProviderConfig,
} from "@/types";
import { chatCompletionRequestSchema } from "@/types/chat-completion";

// Note: Usage tracking is now handled automatically by adaptive-proxy backend
// The proxy records all usage to the database including metadata (projectId, organizationId, clusterId, etc.)

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	// Parse and validate request body outside try-catch to let validation errors bubble up naturally
	const rawBody = await safeParseJson(req);
	const validationResult = chatCompletionRequestSchema.safeParse(rawBody);

	if (!validationResult.success) {
		return new Response(
			JSON.stringify({
				error: "Invalid request body",
				details: validationResult.error.issues,
			}),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	const body = validationResult.data as ChatCompletionRequest;

	try {
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

		const verificationResult = await api.api_keys.verify({
			apiKey,
		});

		if (!verificationResult.valid) {
			return new Response(JSON.stringify({ error: "Invalid API key" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		const { projectId } = verificationResult;

		// Fetch provider configurations from database if project is specified
		const providerConfigs: Record<string, ProviderConfig> = {};

		if (projectId) {
			try {
				const configs = await api.providerConfigs.getAll({
					projectId,
					apiKey,
				});

				// Transform database provider configs to Go backend format
				configs.forEach((config) => {
					const provider = config.provider;
					providerConfigs[provider.name] = {
						base_url: provider.baseUrl ?? undefined,
						auth_type: (provider.authType as AuthType | undefined) ?? undefined,
						auth_header_name: provider.authHeaderName ?? undefined,
						api_key: decryptProviderApiKey(config.providerApiKey), // Decrypt user's API key from config
						health_endpoint: provider.healthEndpoint ?? undefined,
						rate_limit_rpm: provider.rateLimitRpm ?? undefined,
						timeout_ms: provider.timeoutMs ?? undefined,
						retry_config:
							(provider.retryConfig as Record<string, unknown>) ?? undefined,
						headers: {
							...(provider.headers as Record<string, string>),
							...(config.customHeaders as Record<string, string>),
						},
					};
				});
			} catch (error) {
				console.warn("Failed to fetch provider configs:", error);
				// Continue without provider configs - will use default providers
			}
		}

		// Support both streaming and non-streaming requests
		const shouldStream = body.stream === true;

		// Check if user requested usage data
		const userWantsUsage = userRequestedUsage(body);
		// Only add include_usage: true for streaming requests
		// Non-streaming requests will get usage info by default from most providers
		const internalBody = shouldStream ? withUsageTracking(body) : body;

		const baseURL = `${process.env.ADAPTIVE_API_BASE_URL}/v1`;

		const openai = new OpenAI({
			apiKey: "internal", // Internal communication - no real API key needed
			baseURL,
		});

		if (shouldStream) {
			const streamStartTime = Date.now();
			const encoder = new TextEncoder(); // Reuse encoder
			const abortController = new AbortController();
			const timeoutMs = 300000; // 5 minutes timeout

			// Set up stream timeout
			const timeoutId = setTimeout(() => {
				abortController.abort();
			}, timeoutMs);

			// Create custom ReadableStream that intercepts OpenAI SDK chunks
			const customReadable = new ReadableStream({
				async start(controller) {
					try {
						const stream = await openai.chat.completions.create(
							{
								...internalBody,
								stream: true,
							},
							{
								body: {
									...internalBody,
									stream: true,
									provider_configs: providerConfigs,
								},
								signal: abortController.signal,
							},
						);

						for await (const chunk of stream) {
							const typedChunk = chunk as ChatCompletionChunk;

							// Usage is now tracked automatically by adaptive-proxy
							if (typedChunk.usage) {
								console.log("Usage: ", typedChunk.usage);
							}

							// Filter out usage data if user didn't request it
							const responseChunk = filterUsageFromChunk(
								typedChunk,
								userWantsUsage,
							);

							// Convert chunk to SSE format and enqueue
							const sseData = `data: ${JSON.stringify(responseChunk)}\n\n`;
							controller.enqueue(encoder.encode(sseData));
						}

						// Send [DONE] message
						controller.enqueue(encoder.encode("data: [DONE]\n\n"));
						controller.close();
						clearTimeout(timeoutId);
					} catch (error) {
						console.error("Streaming error:", error);
						clearTimeout(timeoutId); // Clear timeout on error

						const isAborted = abortController.signal.aborted;
						const errorMessage = isAborted ? "Stream timeout" : "Stream failed";
						const errorData = `data: ${JSON.stringify({ error: errorMessage })}\n\n`;
						controller.enqueue(encoder.encode(errorData));
						controller.close();

						// Error usage is now tracked automatically by adaptive-proxy
					}
				},
			});

			return new Response(customReadable, {
				headers: {
					Connection: "keep-alive",
					"Cache-Control": "no-cache, no-transform",
					"Content-Type": "text/event-stream; charset=utf-8",
				},
			});
		}
		// Non-streaming request
		const nonStreamStartTime = Date.now();

		try {
			const bodyWithProviders = {
				...internalBody,
				provider_configs: providerConfigs,
			};

			const completion = (await openai.chat.completions.create(internalBody, {
				body: bodyWithProviders,
			})) as ChatCompletion;

			// Usage is now tracked automatically by adaptive-proxy

			return Response.json(completion);
		} catch (error) {
			// Error usage is now tracked automatically by adaptive-proxy
			throw error; // Re-throw to be handled by outer catch
		}
	} catch (error) {
		console.log("Error: ", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
