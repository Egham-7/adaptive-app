"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

export interface ReliabilityPoint {
	dateLabel: string;
	errorRate: number;
	errorCount: number;
}

interface ReliabilityCardProps {
	data: ReliabilityPoint[];
	totalRequests: number;
	errorCount: number;
	errorRate: number;
}

const chartConfig = {
	errorRate: {
		label: "Error Rate",
		color: "hsl(var(--destructive))",
	},
} satisfies ChartConfig;

export function ReliabilityCard({
	data,
	totalRequests,
	errorCount,
	errorRate,
}: ReliabilityCardProps) {
	return (
		<Card>
			<CardHeader>
				<div className="space-y-1">
					<CardTitle className="text-lg">Reliability</CardTitle>
					<p className="text-muted-foreground text-sm">
						Error rates across the selected time window
					</p>
				</div>
				<div className="flex flex-wrap gap-6 pt-4">
					<div>
						<p className="text-muted-foreground text-xs">Error rate</p>
						<p className="font-semibold text-2xl text-foreground">
							{errorRate.toFixed(2)}%
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Error count</p>
						<p className="font-semibold text-2xl text-foreground">
							{errorCount.toLocaleString()}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Total requests</p>
						<p className="font-semibold text-2xl text-foreground">
							{totalRequests.toLocaleString()}
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{!data.length ? (
					<div className="flex h-[220px] items-center justify-center text-muted-foreground text-sm">
						No reliability data available
					</div>
				) : (
					<ChartContainer config={chartConfig} className="h-[220px] w-full">
						<AreaChart
							accessibilityLayer
							data={data}
							margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
						>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="dateLabel"
								tickLine={false}
								axisLine={false}
								tickMargin={10}
								fontSize={12}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								tickMargin={10}
								fontSize={12}
								tickFormatter={(value) => `${value.toFixed(1)}%`}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent
										formatter={(value) => `${Number(value).toFixed(2)}%`}
										labelFormatter={(label) => label}
									/>
								}
							/>
							<Area
								type="monotone"
								dataKey="errorRate"
								stroke="var(--color-errorRate)"
								fill="var(--color-errorRate)"
								fillOpacity={0.3}
								strokeWidth={2}
							/>
						</AreaChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
