import type {
	ProjectUsageAnalytics,
	UsageRecord,
	UsageStats,
} from "@/types/usage";
import { EMPTY_PROJECT_USAGE_ANALYTICS } from "@/types/usage";

type EndpointAgg = { count: number; cost: number };
type DailyTrend = {
	spend: number;
	requests: number;
	tokens: number;
	errorCount: number;
};
type ProviderStats = {
	cost: number;
	requests: number;
	successful: number;
	latencyTotal: number;
	latencySamples: number;
	modelBreakdown: Map<string, number>;
};

export type { ProjectUsageAnalytics };
export { EMPTY_PROJECT_USAGE_ANALYTICS };

export function buildProjectUsageAnalytics(
	stats: UsageStats | null | undefined,
	usage: UsageRecord[] | null | undefined,
): ProjectUsageAnalytics {
	if (!stats || !usage?.length) {
		return EMPTY_PROJECT_USAGE_ANALYTICS;
	}

	const aggregated = {
		totalSpend: stats.total_cost ?? 0,
		totalTokens: stats.total_tokens ?? 0,
		totalRequests: stats.total_requests ?? 0,
		errorCount: stats.failed_requests ?? 0,
		dailyTrendsMap: new Map<string, DailyTrend>(),
		recentRequests: [] as ProjectUsageAnalytics["recentRequests"],
		providerStats: new Map<string, ProviderStats>(),
		usageEndpointBreakdown: new Map<string, EndpointAgg>(),
	};

	usage.forEach((entry) => {
		const promptTokens = entry.prompt_tokens ?? 0;
		const completionTokens = entry.completion_tokens ?? 0;
		const cachedTokens = entry.cached_tokens ?? 0;
		const tokensUsed = entry.tokens_total ?? promptTokens + completionTokens;
		const parsedTimestamp = entry.timestamp ? new Date(entry.timestamp) : null;
		const trendKey = parsedTimestamp?.toISOString();
		if (trendKey) {
			const current = aggregated.dailyTrendsMap.get(trendKey) ?? {
				spend: 0,
				requests: 0,
				tokens: 0,
				errorCount: 0,
			};
			aggregated.dailyTrendsMap.set(trendKey, {
				spend: current.spend + entry.cost,
				requests: current.requests + 1,
				tokens: current.tokens + tokensUsed,
				errorCount: current.errorCount + (entry.status_code >= 400 ? 1 : 0),
			});
		}

		aggregated.recentRequests.push({
			id: entry.id,
			apiKeyId: entry.api_key_id ?? null,
			endpoint: entry.endpoint,
			statusCode: entry.status_code,
			cost: entry.cost,
			provider: entry.provider ?? "unknown",
			model: entry.model ?? "unknown",
			promptTokens,
			completionTokens,
			cachedTokens,
			latencyMs: entry.latency_ms ?? undefined,
			finishReason: entry.finish_reason ?? "unknown",
			timestamp: parsedTimestamp ?? new Date(0),
		});

		const providerKey = entry.provider ?? "unknown";
		const providerEntry = aggregated.providerStats.get(providerKey) ?? {
			cost: 0,
			requests: 0,
			successful: 0,
			latencyTotal: 0,
			latencySamples: 0,
			modelBreakdown: new Map<string, number>(),
		};
		providerEntry.cost += entry.cost;
		providerEntry.requests += 1;
		if (entry.status_code < 400) {
			providerEntry.successful += 1;
		}
		if (entry.latency_ms) {
			providerEntry.latencyTotal += entry.latency_ms;
			providerEntry.latencySamples += 1;
		}
		if (entry.model) {
			const modelCount = providerEntry.modelBreakdown.get(entry.model) ?? 0;
			providerEntry.modelBreakdown.set(entry.model, modelCount + 1);
		}
		aggregated.providerStats.set(providerKey, providerEntry);

		const endpointBucket = aggregated.usageEndpointBreakdown.get(
			entry.endpoint,
		) ?? { count: 0, cost: 0 };
		endpointBucket.count += 1;
		endpointBucket.cost += entry.cost;
		aggregated.usageEndpointBreakdown.set(entry.endpoint, endpointBucket);
	});

	const requestTypeBreakdown = Array.from(
		aggregated.usageEndpointBreakdown.entries(),
	)
		.map(([endpoint, data]) => ({
			type: endpoint,
			count: data.count,
			cost: data.cost,
		}))
		.sort((a, b) => b.count - a.count);

	const dailyTrends = Array.from(aggregated.dailyTrendsMap.entries())
		.map(([period, data]) => ({
			date: new Date(period),
			spend: data.spend,
			requests: data.requests,
			tokens: data.tokens,
			errorCount: data.errorCount,
		}))
		.sort((a, b) => a.date.getTime() - b.date.getTime());

	const errorRate =
		aggregated.totalRequests > 0
			? (aggregated.errorCount / aggregated.totalRequests) * 100
			: 0;

	const providerPerformance = Array.from(
		aggregated.providerStats.entries(),
	).map(([provider, statsEntry]) => {
		const avgLatencyMs =
			statsEntry.latencySamples > 0
				? statsEntry.latencyTotal / statsEntry.latencySamples
				: null;
		const topModel = Array.from(statsEntry.modelBreakdown.entries())
			.sort((a, b) => b[1] - a[1])
			.map(([model]) => model)[0];

		return {
			provider,
			requests: statsEntry.requests,
			cost: statsEntry.cost,
			costShare:
				aggregated.totalSpend > 0
					? (statsEntry.cost / aggregated.totalSpend) * 100
					: 0,
			successRate:
				statsEntry.requests > 0
					? (statsEntry.successful / statsEntry.requests) * 100
					: 0,
			avgLatencyMs,
			topModel,
		};
	});

	const recentRequests = aggregated.recentRequests.sort(
		(a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
	);

	return {
		totalSpend: aggregated.totalSpend,
		totalTokens: aggregated.totalTokens,
		totalRequests: aggregated.totalRequests,
		totalApiCalls: aggregated.totalRequests,
		errorRate,
		errorCount: aggregated.errorCount,
		requestTypeBreakdown,
		dailyTrends,
		providerPerformance,
		recentRequests,
	};
}
