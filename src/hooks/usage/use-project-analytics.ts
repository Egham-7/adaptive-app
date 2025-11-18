import { buildProjectUsageAnalytics } from "@/lib/analytics/project-usage";
import type { ProviderType } from "@/types/api-platform/dashboard";
import { EMPTY_PROJECT_USAGE_ANALYTICS } from "@/types/usage";
import { useUsageByProject } from "./use-usage-by-project";
import { useUsageStatsByProject } from "./use-usage-stats-by-project";

interface ProjectAnalyticsParams {
	projectId: number;
	startDate?: Date;
	endDate?: Date;
	provider?: ProviderType;
}

export const useProjectAnalytics = ({
	projectId,
	startDate,
	endDate,
	provider,
}: ProjectAnalyticsParams) => {
	const statsQuery = useUsageStatsByProject({
		projectId,
		startDate: startDate?.toISOString(),
		endDate: endDate?.toISOString(),
	});

	const usageQuery = useUsageByProject({
		projectId,
		limit: 1000, // Get recent usage records for analytics
		filters: provider ? { provider } : undefined,
	});

	// Combine the queries
	const isLoading = statsQuery.isLoading || usageQuery.isLoading;
	const error = statsQuery.error || usageQuery.error;
	const isError = statsQuery.isError || usageQuery.isError;

	// Build analytics data when both queries succeed
	const data =
		statsQuery.data && usageQuery.data
			? buildProjectUsageAnalytics(statsQuery.data, usageQuery.data)
			: EMPTY_PROJECT_USAGE_ANALYTICS;

	const refetch = () => {
		statsQuery.refetch();
		usageQuery.refetch();
	};

	return {
		data,
		isLoading,
		error,
		isError,
		refetch,
	};
};
