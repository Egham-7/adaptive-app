"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DashboardHeader } from "@/app/_components/api-platform/organizations/projects/dashboard/dashboard-header";
import { MetricsOverview } from "@/app/_components/api-platform/organizations/projects/dashboard/metrics-overview";
import type { ProviderPerformancePoint } from "@/app/_components/api-platform/organizations/projects/dashboard/provider-performance-card";
import { ProviderPerformanceCard } from "@/app/_components/api-platform/organizations/projects/dashboard/provider-performance-card";
import type { ReliabilityPoint } from "@/app/_components/api-platform/organizations/projects/dashboard/reliability-card";
import { ReliabilityCard } from "@/app/_components/api-platform/organizations/projects/dashboard/reliability-card";
import type { RequestBreakdownPoint } from "@/app/_components/api-platform/organizations/projects/dashboard/request-breakdown-card";
import { RequestBreakdownCard } from "@/app/_components/api-platform/organizations/projects/dashboard/request-breakdown-card";
import type { UsageRequestRow } from "@/app/_components/api-platform/organizations/projects/dashboard/usage-requests-table";
import { UsageRequestsTable } from "@/app/_components/api-platform/organizations/projects/dashboard/usage-requests-table";
import type { UsageTrendPoint } from "@/app/_components/api-platform/organizations/projects/dashboard/usage-trends-card";
import { UsageTrendsCard } from "@/app/_components/api-platform/organizations/projects/dashboard/usage-trends-card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useProjectDashboardData } from "@/hooks/usage/use-project-dashboard-data";
import { useDateRange } from "@/hooks/use-date-range";
import { getProviderDisplayName } from "@/lib/providers/utils";
import type { DashboardFilters } from "@/types/api-platform/dashboard";

type TrendWithError = UsageTrendPoint & { errorCount: number };

export default function DashboardPage() {
	const params = useParams();
	const projectId = params.projectId as string;
	const { dateRange, setDateRange } = useDateRange();
	const [requestProviderFilter, setRequestProviderFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");

	const filters: DashboardFilters = useMemo(
		() => ({
			dateRange,
			provider: "all",
		}),
		[dateRange],
	);

	const { data, loading, error } = useProjectDashboardData(projectId, filters);

	const formattedTrends: TrendWithError[] = useMemo(() => {
		if (!data?.dailyTrends?.length) return [];
		return data.dailyTrends.map<TrendWithError>((trend) => {
			const date =
				trend.date instanceof Date ? trend.date : new Date(trend.date);
			const dateLabel = date.toLocaleDateString(undefined, {
				month: "short",
				day: "numeric",
			});
			return {
				dateLabel,
				spend: trend.spend,
				requests: trend.requests,
				tokens: trend.tokens,
				errorCount: trend.errorCount,
			};
		});
	}, [data]);

	const reliabilitySeries: ReliabilityPoint[] = useMemo(() => {
		if (!formattedTrends.length) return [];
		return formattedTrends.map((trend) => ({
			dateLabel: trend.dateLabel,
			errorRate:
				trend.requests > 0
					? Number(((trend.errorCount / trend.requests) * 100).toFixed(2))
					: 0,
			errorCount: trend.errorCount,
		}));
	}, [formattedTrends]);

	const requestBreakdown: RequestBreakdownPoint[] = useMemo(() => {
		const breakdown = data?.requestTypeBreakdown ?? [];
		if (!breakdown.length) return [];
		const total = breakdown.reduce((sum, item) => sum + item.count, 0);
		return breakdown.map((item) => ({
			endpoint: item.type,
			count: item.count,
			cost: item.cost,
			percentage: total > 0 ? (item.count / total) * 100 : 0,
		}));
	}, [data]);

	const recentRequests: UsageRequestRow[] = useMemo(() => {
		if (!data?.recentRequests?.length) return [];
		return data.recentRequests.map((request) => ({
			id: request.id,
			endpoint: request.endpoint,
			provider: request.provider,
			model: request.model,
			promptTokens: request.promptTokens,
			completionTokens: request.completionTokens,
			cachedTokens: request.cachedTokens,
			statusCode: request.statusCode,
			cost: request.cost,
			latencyMs: request.latencyMs,
			finishReason: request.finishReason,
			timestamp:
				request.timestamp instanceof Date
					? request.timestamp
					: new Date(request.timestamp),
		}));
	}, [data]);

	const providerPerformance: ProviderPerformancePoint[] = useMemo(() => {
		if (!data?.providerPerformance) return [];
		return data.providerPerformance.map((entry) => ({
			provider: entry.provider,
			requests: entry.requests,
			cost: entry.cost,
			costShare: entry.costShare,
			successRate: entry.successRate,
			avgLatencyMs: entry.avgLatencyMs,
			topModel: entry.topModel,
		}));
	}, [data]);

	const providerFilterOptions = useMemo(() => {
		const providerMap = new Map<string, string>();
		recentRequests.forEach((row) => {
			const value = row.provider ?? "unknown";
			const label = getProviderDisplayName(row.provider);
			providerMap.set(value, label);
		});
		return Array.from(providerMap.entries())
			.map(([value, label]) => ({ value, label }))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [recentRequests]);

	const filteredRequests = useMemo(() => {
		const matchesStatus = (status: number) => {
			if (statusFilter === "all") return true;
			if (statusFilter === "success") return status < 400;
			if (statusFilter === "client-error") return status >= 400 && status < 500;
			if (statusFilter === "server-error") return status >= 500;
			return true;
		};

		return recentRequests.filter((row) => {
			const providerMatch =
				requestProviderFilter === "all" ||
				(row.provider ?? "unknown") === requestProviderFilter;
			return providerMatch && matchesStatus(row.statusCode);
		});
	}, [recentRequests, requestProviderFilter, statusFilter]);

	const handleExport = () => {
		if (!data) return;

		const exportData = {
			dateRange,
			provider: "all",
			metrics: {
				totalSpend: data.totalSpend,
				totalTokens: data.totalTokens,
				totalRequests: data.totalRequests,
			},
			dailyTrends: data.dailyTrends,
			requestTypeBreakdown: data.requestTypeBreakdown,
		};

		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `dashboard-export-${new Date().toISOString().split("T")[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	if (error) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-center">
					<h3 className="mb-2 font-medium text-foreground text-lg">
						Failed to load dashboard data
					</h3>
					<p className="mb-4 text-muted-foreground">{error}</p>
					<Button onClick={() => window.location.reload()}>Try Again</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full px-6 py-2">
			{/* Header Section */}
			<div className="mb-8" id="dashboard-header">
				<DashboardHeader
					dateRange={dateRange}
					onDateRangeChange={setDateRange}
					onExport={handleExport}
				/>
			</div>

			{/* Main Dashboard Grid */}
			<div className="space-y-8">
				{/* Key Metrics Section */}
				<section className="space-y-6" id="dashboard-metrics">
					<h2 className="font-semibold text-2xl text-foreground">
						Key Performance Metrics
					</h2>
					<p className="text-muted-foreground">
						Real-time insights into your API usage and costs
					</p>
					<MetricsOverview data={data ?? null} loading={loading} />
				</section>

				<section className="space-y-6" id="usage-visualizations">
					<h2 className="font-semibold text-2xl text-foreground">
						Usage Overview
					</h2>
					<div className="grid gap-6 xl:grid-cols-3">
						<div className="space-y-6 xl:col-span-2">
							<UsageTrendsCard data={formattedTrends} />
							<RequestBreakdownCard
								data={requestBreakdown}
								totalRequests={data?.totalRequests ?? 0}
							/>
						</div>
						<div className="flex flex-col gap-6">
							<ReliabilityCard
								data={reliabilitySeries}
								totalRequests={data?.totalRequests ?? 0}
								errorCount={data?.errorCount ?? 0}
								errorRate={data?.errorRate ?? 0}
							/>
							<ProviderPerformanceCard
								data={providerPerformance}
								totalSpend={data?.totalSpend ?? 0}
							/>
						</div>
					</div>
				</section>

				<section className="space-y-4" id="usage-requests">
					<h2 className="font-semibold text-2xl text-foreground">
						Request Activity
					</h2>
					<p className="text-muted-foreground">
						Inspect recent API calls and validate their performance
					</p>
					<div className="flex flex-wrap items-center gap-4">
						<div>
							<p className="text-muted-foreground text-xs">Provider</p>
							<Select
								value={requestProviderFilter}
								onValueChange={setRequestProviderFilter}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder="All providers" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All providers</SelectItem>
									{providerFilterOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Status</p>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder="All statuses" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All statuses</SelectItem>
									<SelectItem value="success">Success (2xx/3xx)</SelectItem>
									<SelectItem value="client-error">
										Client errors (4xx)
									</SelectItem>
									<SelectItem value="server-error">
										Server errors (5xx)
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<UsageRequestsTable rows={filteredRequests} loading={loading} />
				</section>
			</div>
		</div>
	);
}
