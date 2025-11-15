"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TrendMetric = "spend" | "requests" | "tokens";

export interface UsageTrendPoint {
	dateLabel: string;
	spend: number;
	requests: number;
	tokens: number;
}

interface UsageTrendsCardProps {
	data: UsageTrendPoint[];
}

const chartConfig = {
	spend: {
		label: "Spend",
		color: "hsl(var(--chart-2))",
	},
	requests: {
		label: "Requests",
		color: "hsl(var(--chart-3))",
	},
	tokens: {
		label: "Tokens",
		color: "hsl(var(--chart-4))",
	},
} satisfies ChartConfig;

const metricFormatters: Record<
	TrendMetric,
	{
		format: (value: number) => string;
		tooltip: string;
	}
> = {
	spend: {
		format: (value) => `$${value.toFixed(2)}`,
		tooltip: "Daily spend",
	},
	requests: {
		format: (value) => value.toLocaleString(),
		tooltip: "Daily requests",
	},
	tokens: {
		format: (value) => value.toLocaleString(),
		tooltip: "Daily tokens",
	},
};

export function UsageTrendsCard({ data }: UsageTrendsCardProps) {
	const [metric, setMetric] = useState<TrendMetric>("spend");

	const summaries = useMemo(() => {
		if (!data.length) {
			return {
				spend: { total: 0, average: 0 },
				requests: { total: 0, average: 0 },
				tokens: { total: 0, average: 0 },
			};
		}

		const days = data.length;
		const totals = data.reduce(
			(acc, point) => {
				acc.spend += point.spend;
				acc.requests += point.requests;
				acc.tokens += point.tokens;
				return acc;
			},
			{ spend: 0, requests: 0, tokens: 0 },
		);

		return {
			spend: { total: totals.spend, average: totals.spend / days },
			requests: { total: totals.requests, average: totals.requests / days },
			tokens: { total: totals.tokens, average: totals.tokens / days },
		};
	}, [data]);

	const summary = summaries[metric];
	const formatter = metricFormatters[metric];

	return (
		<Card>
			<CardHeader className="space-y-4">
				<div className="space-y-1">
					<CardTitle className="text-lg">Usage Trends</CardTitle>
					<p className="text-muted-foreground text-sm">
						Track how spend, requests, and tokens shift over time
					</p>
				</div>
				<div className="flex flex-wrap gap-6">
					<div>
						<p className="text-muted-foreground text-xs">Total</p>
						<p className="font-semibold text-2xl text-foreground">
							{formatter.format(summary.total)}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Daily average</p>
						<p className="font-semibold text-2xl text-foreground">
							{formatter.format(summary.average || 0)}
						</p>
					</div>
				</div>
				<Tabs
					value={metric}
					onValueChange={(value) => setMetric(value as TrendMetric)}
				>
					<TabsList>
						<TabsTrigger value="spend">Spend</TabsTrigger>
						<TabsTrigger value="requests">Requests</TabsTrigger>
						<TabsTrigger value="tokens">Tokens</TabsTrigger>
					</TabsList>
				</Tabs>
			</CardHeader>
			<CardContent className="space-y-3">
				{!data.length ? (
					<div className="flex h-[320px] items-center justify-center text-muted-foreground text-sm">
						No usage data available
					</div>
				) : (
					<ChartContainer config={chartConfig} className="h-[320px] w-full">
						<AreaChart
							accessibilityLayer
							data={data}
							margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
						>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="dateLabel"
								tickLine={false}
								axisLine={false}
								tickMargin={12}
								fontSize={12}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								tickMargin={12}
								fontSize={12}
								tickFormatter={(value) =>
									metric === "spend"
										? `$${value.toFixed(0)}`
										: Number(value).toLocaleString()
								}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent
										formatter={(value) =>
											metric === "spend"
												? `$${Number(value).toFixed(4)}`
												: Number(value).toLocaleString()
										}
										labelFormatter={(label) => label}
									/>
								}
							/>
							<Area
								type="monotone"
								dataKey={metric}
								stroke={`var(--color-${metric})`}
								fill={`var(--color-${metric})`}
								fillOpacity={0.3}
								strokeWidth={2}
							/>
						</AreaChart>
					</ChartContainer>
				)}
				<p className="text-muted-foreground text-xs">{formatter.tooltip}</p>
			</CardContent>
		</Card>
	);
}
