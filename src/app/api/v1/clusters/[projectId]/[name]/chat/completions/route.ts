import type { NextRequest } from "next/server";
import { env } from "@/env";
import { decryptProviderApiKey } from "@/lib/auth";
import { withCache } from "@/lib/shared/cache";
import { api } from "@/trpc/server";
import type { ChatCompletionRequest } from "@/types/chat-completion";
import { chatCompletionRequestSchema } from "@/types/chat-completion";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ projectId: string; name: string }> },
) {
	try {
		const { projectId, name } = await params;

		const requestBody = await request.json();
		const validationResult = chatCompletionRequestSchema.safeParse(requestBody);

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

		if (verificationResult.projectId !== projectId) {
			return new Response(
				JSON.stringify({
					error: "API key does not have access to this project",
				}),
				{ status: 403, headers: { "Content-Type": "application/json" } },
			);
		}

		const cluster = await withCache(
			`cluster:${projectId}:${name}`,
			() => api.llmClusters.getByName({ projectId, name, apiKey }),
			300,
		);

		if (!cluster) {
			return new Response(JSON.stringify({ error: "Cluster not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		const providerConfigs: Record<
			string,
			{
				base_url?: string;
				auth_type?: string;
				auth_header_name?: string;
				api_key?: string;
				health_endpoint?: string;
				rate_limit_rpm?: number;
				timeout_ms?: number;
				retry_config?: Record<string, unknown>;
				headers?: Record<string, string>;
			}
		> = {};

		try {
			const configs = await withCache(
				`provider-configs:${projectId}`,
				() => api.providerConfigs.getAll({ projectId, apiKey }),
				60,
			);

			configs.forEach((config) => {
				const provider = config.provider;
				providerConfigs[provider.name] = {
					base_url: provider.baseUrl ?? undefined,
					auth_type: provider.authType ?? undefined,
					auth_header_name: provider.authHeaderName ?? undefined,
					api_key: decryptProviderApiKey(config.providerApiKey),
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
		}

		const modelDetails = await withCache(
			`model-details:${cluster.id}`,
			async () => {
				const modelDetailsArray: Array<{
					provider: string;
					model_name: string;
					cost_per_1m_input_tokens: number;
					cost_per_1m_output_tokens: number;
					max_context_tokens: number;
					max_output_tokens?: number;
					supports_function_calling: boolean;
					languages_supported: string[];
					model_size_params?: string;
					latency_tier?: string;
					task_type?: string;
					complexity?: string;
				}> = [];

				const providerModelPromises = cluster.providers.map(
					async (clusterProvider) => {
						try {
							const models = await api.providerModels.getForConfig({
								projectId,
								providerId: clusterProvider.providerId,
								configId: clusterProvider.configId ?? undefined,
								apiKey,
							});

							return { clusterProvider, models, error: null };
						} catch (error) {
							console.warn(
								`Failed to get models for provider ${clusterProvider.provider.name}:`,
								error,
							);
							return { clusterProvider, models: [], error };
						}
					},
				);

				const providerResults = await Promise.allSettled(providerModelPromises);

				for (const result of providerResults) {
					if (result.status === "fulfilled") {
						const { clusterProvider, models } = result.value;

						for (const model of models) {
							if (!model.capabilities) {
								console.warn(
									`Model ${model.name} from ${clusterProvider.provider.name} missing capabilities`,
								);
								continue;
							}

							modelDetailsArray.push({
								provider: clusterProvider.provider.name,
								model_name: model.name,
								cost_per_1m_input_tokens: Number(model.inputTokenCost),
								cost_per_1m_output_tokens: Number(model.outputTokenCost),
								max_context_tokens: model.capabilities.maxContextTokens ?? 4096,
								max_output_tokens:
									model.capabilities.maxOutputTokens ?? undefined,
								supports_function_calling:
									model.capabilities.supportsFunctionCalling,
								languages_supported:
									model.capabilities.languagesSupported ?? [],
								model_size_params:
									model.capabilities.modelSizeParams ?? undefined,
								latency_tier: model.capabilities.latencyTier ?? undefined,
								task_type: model.capabilities.taskType ?? undefined,
								complexity: model.capabilities.complexity ?? undefined,
							});
						}
					} else {
						console.warn(
							"Promise.allSettled rejected unexpectedly:",
							result.reason,
						);
					}
				}

				return modelDetailsArray;
			},
			300,
		);

		const enhancedRequest = {
			...body,
			user: name,
			model_router: {
				models: modelDetails,
				cost_bias: cluster.costBias,
				complexity_threshold: cluster.complexityThreshold,
				token_threshold: cluster.tokenThreshold,
			},
			semantic_cache: {
				enabled: cluster.enableSemanticCache,
				semantic_threshold: cluster.semanticThreshold,
			},
			prompt_cache: {
				enabled: cluster.enablePromptCache,
				ttl: cluster.promptCacheTTL,
			},
			fallback: {
				enabled: cluster.fallbackEnabled,
				mode: cluster.fallbackMode,
			},
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
				body: JSON.stringify(enhancedRequest),
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
					"Content-Type": "text/event-stream; charset=utf-8",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
					"Access-Control-Allow-Origin": "*",
				},
			});
		}

		return new Response(await response.text(), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (_error) {
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
