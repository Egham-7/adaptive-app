"use client";

import { BarChart3, Table } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import type { ProjectAnalytics } from "@/types/api-platform/dashboard";
import { UsageChart } from "./charts/usage-chart";
import { ChartSkeleton } from "./loading-skeleton";
import { ModelSelector } from "./model-selector";
import { ProviderComparisonTable } from "./provider-comparison-table";

interface CostComparisonProps {
	data: ProjectAnalytics | null;
	loading: boolean;
	selectedModels: string[];
	onModelsChange: (models: string[]) => void;
}

type ViewMode = "chart" | "table";

// Calculate direct cost for a specific model using actual token usage
const calculateDirectModelCost = (
	usageData: { inputTokens: number; outputTokens: number }[],
	modelId: string,
	pricingData:
		| Record<string, { inputCost: number; outputCost: number }>
		| undefined,
): number | null => {
	if (!pricingData || !pricingData[modelId]) {
		return null; // Return null instead of 0 when pricing is unavailable
	}

	const modelPricing = pricingData[modelId];

	return usageData.reduce((totalCost, usage) => {
		const inputCost = (usage.inputTokens / 1_000_000) * modelPricing.inputCost;
		const outputCost =
			(usage.outputTokens / 1_000_000) * modelPricing.outputCost;
		return totalCost + inputCost + outputCost;
	}, 0);
};

export function CostComparison({
	data,
	loading,
	selectedModels,
	onModelsChange,
}: CostComparisonProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("chart");

	// Fetch dynamic pricing data
	const { data: modelPricing, isLoading: pricingLoading } =
		api.modelPricing.getAllModelPricing.useQuery();

	if (loading || pricingLoading) {
		return <ChartSkeleton />;
	}

	if (!data || !data.dailyTrends || data.dailyTrends.length === 0) {
		return (
			<div>
				<div className="flex items-center justify-between">
					<div className="font-semibold text-xl">Cost Comparison</div>
					<div className="flex items-center gap-2">
						<Button
							variant={viewMode === "chart" ? "default" : "outline"}
							size="sm"
							onClick={() => setViewMode("chart")}
							className="gap-2"
						>
							<BarChart3 className="h-4 w-4" />
							Chart
						</Button>
						<Button
							variant={viewMode === "table" ? "default" : "outline"}
							size="sm"
							onClick={() => setViewMode("table")}
							className="gap-2"
						>
							<Table className="h-4 w-4" />
							Table
						</Button>
					</div>
				</div>
				<div className="mt-4 flex h-64 items-center justify-center text-muted-foreground">
					No data available
				</div>
			</div>
		);
	}

	// Use first selected model for comparison (multi-model comparison could be added later)
	const primarySelectedModel = selectedModels[0];

	// Calculate actual direct model cost using real token usage data
	const directModelCost = primarySelectedModel
		? calculateDirectModelCost(
				data.dailyTrends,
				primarySelectedModel,
				modelPricing,
			)
		: null;

	// Don't show comparison if we don't have pricing for the selected model
	if (directModelCost === null) {
		return (
			<div>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="font-semibold text-xl">Cost Comparison</div>
						<Badge variant="secondary">No Pricing Data</Badge>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant={viewMode === "chart" ? "default" : "outline"}
							size="sm"
							onClick={() => setViewMode("chart")}
							className="gap-2"
						>
							<BarChart3 className="h-4 w-4" />
							Chart
						</Button>
						<Button
							variant={viewMode === "table" ? "default" : "outline"}
							size="sm"
							onClick={() => setViewMode("table")}
							className="gap-2"
						>
							<Table className="h-4 w-4" />
							Table
						</Button>
					</div>
				</div>
				<div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-muted-foreground text-sm">
							Pricing data not available for selected model
						</p>
					</div>
					<ModelSelector
						selectedModels={selectedModels}
						onModelsChange={onModelsChange}
					/>
				</div>
				<div className="mt-4 flex h-64 items-center justify-center text-muted-foreground">
					Select a model with available pricing data to see comparison
				</div>
			</div>
		);
	}

	// Recalculate chart data with all selected models
	const chartData = data.dailyTrends.map((dataPoint) => {
		const result = {
			...dataPoint,
			adaptive: dataPoint.spend,
		};

		// Add cost calculations for each selected model
		selectedModels.forEach((modelId) => {
			const modelPricingData = modelPricing?.[modelId];
			if (modelPricingData) {
				const directCost =
					(dataPoint.inputTokens / 1_000_000) * modelPricingData.inputCost +
					(dataPoint.outputTokens / 1_000_000) * modelPricingData.outputCost;
				(result as Record<string, unknown>)[modelId] = directCost;
			} else {
				(result as Record<string, unknown>)[modelId] = 0;
			}
		});

		return result;
	});

	return (
		<div>
			<div className="flex items-center justify-between">
				<div className="font-semibold text-xl">Cost Comparison</div>
				<div className="flex items-center gap-2">
					<Button
						variant={viewMode === "chart" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("chart")}
						className="gap-2"
					>
						<BarChart3 className="h-4 w-4" />
						Chart
					</Button>
					<Button
						variant={viewMode === "table" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("table")}
						className="gap-2"
					>
						<Table className="h-4 w-4" />
						Table
					</Button>
				</div>
			</div>

			<div className="mt-6">
				{viewMode === "chart" && (
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<ModelSelector
							selectedModels={selectedModels}
							onModelsChange={onModelsChange}
						/>
					</div>
				)}

				{viewMode === "table" && (
					<p className="text-muted-foreground text-sm">
						Compare your Adaptive costs against what you would pay using each
						provider exclusively
					</p>
				)}
			</div>

			<div className="mt-6">
				{viewMode === "chart" ? (
					<UsageChart data={chartData} selectedModels={selectedModels} />
				) : (
					<ProviderComparisonTable data={data} loading={loading} />
				)}
			</div>
		</div>
	);
}
