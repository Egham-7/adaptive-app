"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getProviderMetadataById } from "@/lib/providers/utils";

export interface UsageRequestRow {
	id: number;
	endpoint: string;
	provider?: string | null;
	model?: string | null;
	statusCode: number;
	cost: number;
	promptTokens?: number | null;
	completionTokens?: number | null;
	cachedTokens?: number | null;
	latencyMs?: number | null;
	finishReason?: string | null;
	timestamp: Date;
}

interface UsageRequestsTableProps {
	rows: UsageRequestRow[];
	loading: boolean;
}

const currency = new Intl.NumberFormat(undefined, {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 4,
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
	timeStyle: "short",
});

const arrow = "->";

const statusVariant = (status: number) => {
	if (status >= 500) return "destructive";
	if (status >= 400) return "warning";
	return "success";
};

const formatLatency = (value?: number | null) => {
	if (value === null || value === undefined) return "—";
	if (value >= 1000) {
		return `${(value / 1000).toFixed(2)} s`;
	}
	return `${Math.round(value)} ms`;
};

export function UsageRequestsTable({ rows, loading }: UsageRequestsTableProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between gap-4">
					<div>
						<CardTitle className="text-lg">Recent API Requests</CardTitle>
						<p className="text-muted-foreground text-sm">
							Latest calls flowing through this project
						</p>
					</div>
					<p className="text-muted-foreground text-sm">
						{rows.length.toLocaleString()} records
					</p>
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
						Loading usage data…
					</div>
				) : !rows.length ? (
					<div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
						No recent request data available
					</div>
				) : (
					<div className="max-h-[480px] overflow-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Timestamp</TableHead>
									<TableHead>Endpoint</TableHead>
									<TableHead>Provider / Model</TableHead>
									<TableHead>Tokens</TableHead>
									<TableHead className="text-right">Cost</TableHead>
									<TableHead>Latency</TableHead>
									<TableHead>Finish Reason</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map((row) => (
									<TableRow key={`${row.id}-${row.timestamp.getTime()}`}>
										<TableCell className="whitespace-nowrap">
											<div className="flex flex-col">
												<span className="font-medium">
													{dateFormatter.format(row.timestamp)}
												</span>
											</div>
										</TableCell>
										<TableCell className="font-medium">
											{row.endpoint}
										</TableCell>
										<TableCell>
											<ProviderBadge
												provider={row.provider}
												model={row.model}
											/>
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<span className="font-mono text-sm">
													{(row.promptTokens ?? 0).toLocaleString()} {arrow}{" "}
													{(row.completionTokens ?? 0).toLocaleString()}
												</span>
												<span className="text-muted-foreground text-xs">
													{(
														(row.promptTokens ?? 0) +
														(row.completionTokens ?? 0)
													).toLocaleString()}{" "}
													total
													{row.cachedTokens ? (
														<> · {row.cachedTokens.toLocaleString()} cached</>
													) : null}
												</span>
											</div>
										</TableCell>
										<TableCell className="text-right font-mono text-sm">
											{currency.format(row.cost)}
										</TableCell>
										<TableCell>{formatLatency(row.latencyMs)}</TableCell>
										<TableCell>{row.finishReason ?? "—"}</TableCell>
										<TableCell>
											<Badge variant={statusVariant(row.statusCode)}>
												{row.statusCode}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

interface ProviderBadgeProps {
	provider?: string | null;
	model?: string | null;
}

function ProviderBadge({ provider, model }: ProviderBadgeProps) {
	const meta = getProviderMetadataById(provider);
	const displayName = meta?.displayName ?? provider ?? "Unknown";
	const logo = meta?.logo;
	const fallbackInitials = displayName.slice(0, 2).toUpperCase();
	const formattedLabel = model ? `${displayName} / ${model}` : displayName;

	return (
		<div className="flex items-center gap-2">
			{logo ? (
				<Image
					src={logo}
					alt={displayName}
					width={24}
					height={24}
					className="h-6 w-6 rounded border bg-muted object-contain"
				/>
			) : (
				<div className="inline-flex h-6 w-6 items-center justify-center rounded border bg-muted font-semibold text-foreground text-xs">
					{fallbackInitials}
				</div>
			)}
			<span className="font-medium text-sm">{formattedLabel}</span>
		</div>
	);
}
