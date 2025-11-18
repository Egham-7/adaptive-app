import type { DateRange } from "react-day-picker";
import type { ProjectUsageAnalytics } from "@/types/usage";

// ---- tRPC-derived Types ----

/**
 * Project analytics data from the usage router
 */
export type ProjectAnalytics = ProjectUsageAnalytics;

/**
 * Daily usage trend data point
 */
export type DailyTrendDataPoint = ProjectAnalytics["dailyTrends"][number];

/**
 * Model-provider breakdown data point
 */
export type ModelProviderBreakdown = {
	model: string;
	provider: string;
	spend: number;
	tokens: number;
	requests: number;
};

/**
 * Request type breakdown data point
 */
export type RequestTypeBreakdown =
	ProjectAnalytics["requestTypeBreakdown"][number];

// ---- UI-specific Types ----

/**
 * Provider type from usage filters
 */
export type ProviderType = string;

/**
 * Supported provider types for filtering - includes "all" option
 */
export type ProviderFilter = "all" | NonNullable<ProviderType>;

/**
 * Dashboard filters
 */
export interface DashboardFilters {
	dateRange: DateRange | undefined;
	provider: ProviderFilter;
	refreshInterval?: number;
}

/**
 * Metric card data for UI components
 */
export interface MetricCardData {
	title: string;
	value: string;
	change?: string;
	changeType?: "positive" | "negative" | "neutral";
	icon?: React.ReactNode;
	description?: string;
}

// ---- Chart Data Types ----

/**
 * Chart data point types for backwards compatibility
 * These derive from the usage analytics structure
 */
export type DashboardData = ProjectAnalytics;
export type Provider = ProviderType;

export interface UsageDataPoint {
	date: string;
	totalCost: number;
	totalTokens: number;
	requestCount: number;
	savings?: number;
}

export interface RequestDataPoint {
	date: string;
	requests: number;
	successfulRequests: number;
	failedRequests: number;
}

export interface TokenDataPoint {
	date: string;
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
}

export interface ErrorRateDataPoint {
	date: string;
	errorRate: number;
	totalRequests: number;
	errorCount: number;
}
