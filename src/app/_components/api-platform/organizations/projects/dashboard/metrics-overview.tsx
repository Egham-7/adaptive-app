"use client";

import { useParams } from "next/navigation";
import { FaChartLine, FaCoins, FaServer } from "react-icons/fa";
import type { ProjectAnalytics } from "@/types/api-platform/dashboard";
import { MetricCardSkeleton } from "./loading-skeleton";
import { VersatileMetricChart } from "./versatile-metric-chart";

interface MetricsOverviewProps {
	data: ProjectAnalytics | null;
	loading: boolean;
}

export function MetricsOverview({ data, loading }: MetricsOverviewProps) {
	if (loading) {
		return (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<MetricCardSkeleton key={`skeleton-${i}`} />
				))}
			</div>
		);
	}

	if (!data) return null;

	const spendData = data.dailyTrends.map((d) => ({
		date: d.date.toISOString().slice(0, 10),
		value: d.spend, // This is the actual customer spending
	}));

	const allMetrics = [
		{
			title: "Spending Over Time",
			chartType: "line" as const,
			icon: <FaChartLine className="h-5 w-5 text-chart-2" />,
			data: spendData,
			color: "hsl(var(--chart-2))",
			totalValue: `$${(() => {
				const str = data.totalSpend.toString();
				const parts = str.split(".");
				const decimalPart = parts[1] || "";
				const significantDecimals = decimalPart.replace(/0+$/, "").length;
				const decimals = Math.min(Math.max(significantDecimals, 2), 8);
				return data.totalSpend.toFixed(decimals);
			})()}`,
		},
		{
			title: "Token Usage",
			chartType: "bar" as const,
			icon: <FaCoins className="h-5 w-5 text-chart-3" />,
			data: data.dailyTrends.map((d) => ({
				date: d.date.toISOString().slice(0, 10),
				value: d.tokens,
			})),
			color: "hsl(var(--chart-3))",
			totalValue: data.totalTokens.toLocaleString(),
		},
		{
			title: "Request Volume",
			chartType: "area" as const,
			icon: <FaServer className="h-5 w-5 text-chart-4" />,
			data: data.dailyTrends.map((d) => ({
				date: d.date.toISOString().slice(0, 10),
				value: d.requests,
			})),
			color: "hsl(var(--chart-4))",
			totalValue: data.totalRequests.toLocaleString(),
		},
	];

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{allMetrics.map((metric) => (
				<VersatileMetricChart
					key={metric.title}
					title={metric.title}
					chartType={metric.chartType}
					data={metric.data}
					icon={metric.icon}
					color={metric.color}
					totalValue={metric.totalValue}
				/>
			))}
		</div>
	);
}
