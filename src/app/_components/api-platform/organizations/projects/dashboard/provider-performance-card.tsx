"use client";

import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export interface ProviderPerformancePoint {
	provider: string;
	requests: number;
	cost: number;
	costShare: number;
	successRate: number;
	avgLatencyMs: number | null;
	topModel?: string;
}

interface ProviderPerformanceCardProps {
	data: ProviderPerformancePoint[];
	totalSpend: number;
}

export function ProviderPerformanceCard({
	data,
	totalSpend,
}: ProviderPerformanceCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between">
				<div>
					<CardTitle className="text-lg">Provider Performance</CardTitle>
					<p className="text-muted-foreground text-sm">
						Cost, success rate, and latency by provider
					</p>
				</div>
				<div className="text-right">
					<p className="text-muted-foreground text-xs">Total spend</p>
					<p className="font-semibold text-foreground text-xl">
						${totalSpend.toFixed(2)}
					</p>
				</div>
			</CardHeader>
			<CardContent>
				{!data.length ? (
					<div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
						No provider data available
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Provider</TableHead>
								<TableHead>Top Model</TableHead>
								<TableHead>Cost Share</TableHead>
								<TableHead className="text-right">Success Rate</TableHead>
								<TableHead className="text-right">Avg Latency</TableHead>
								<TableHead className="text-right">Requests</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.map((item) => (
								<TableRow key={item.provider}>
									<TableCell className="font-medium">{item.provider}</TableCell>
									<TableCell>
										<div className="flex items-center gap-1 text-sm">
											{item.topModel ?? "—"}
											{item.topModel ? (
												<ArrowUpRight className="h-3 w-3 text-muted-foreground" />
											) : null}
										</div>
									</TableCell>
									<TableCell className="w-48">
										<div className="mb-1 flex items-center justify-between text-xs">
											<span>{item.costShare.toFixed(1)}%</span>
											<span>${item.cost.toFixed(2)}</span>
										</div>
										<Progress value={item.costShare} className="h-2" />
									</TableCell>
									<TableCell className="text-right font-mono text-sm">
										{item.successRate.toFixed(1)}%
									</TableCell>
									<TableCell className="text-right text-sm">
										{item.avgLatencyMs
											? `${item.avgLatencyMs.toFixed(0)} ms`
											: "—"}
									</TableCell>
									<TableCell className="text-right">
										{item.requests.toLocaleString()}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
