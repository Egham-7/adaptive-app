"use client";

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

export interface RequestBreakdownPoint {
	endpoint: string;
	count: number;
	cost: number;
	percentage: number;
}

interface RequestBreakdownCardProps {
	data: RequestBreakdownPoint[];
	totalRequests: number;
}

const formatter = new Intl.NumberFormat(undefined, {
	maximumFractionDigits: 2,
	style: "currency",
	currency: "USD",
});

export function RequestBreakdownCard({
	data,
	totalRequests,
}: RequestBreakdownCardProps) {
	const topEndpoints = data.slice(0, 8);
	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between gap-4">
					<div>
						<CardTitle className="text-lg">Endpoint Breakdown</CardTitle>
						<p className="text-muted-foreground text-sm">
							Which endpoints drive the most requests and spend
						</p>
					</div>
					<div className="text-right">
						<p className="text-muted-foreground text-xs">Total requests</p>
						<p className="font-semibold text-foreground text-xl">
							{totalRequests.toLocaleString()}
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{!data.length ? (
					<div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
						No endpoint data available
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Endpoint</TableHead>
								<TableHead className="text-right">Requests</TableHead>
								<TableHead className="text-right">Cost</TableHead>
								<TableHead className="text-right">Traffic Share</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{topEndpoints.map((item) => (
								<TableRow key={item.endpoint}>
									<TableCell className="font-medium">{item.endpoint}</TableCell>
									<TableCell className="text-right">
										{item.count.toLocaleString()}
									</TableCell>
									<TableCell className="text-right">
										{formatter.format(item.cost)}
									</TableCell>
									<TableCell className="text-right">
										<div className="space-y-1">
											<p>{item.percentage.toFixed(1)}%</p>
											<Progress value={item.percentage} className="h-2" />
										</div>
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
