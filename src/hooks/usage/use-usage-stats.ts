import { api } from "@/trpc/react";
import type { UsageFilters } from "@/types/usage";

interface UseUsageStatsParams {
	apiKeyId: number;
	startDate?: string;
	endDate?: string;
	filters?: UsageFilters;
}

export const useUsageStats = ({
	apiKeyId,
	startDate,
	endDate,
	filters,
}: UseUsageStatsParams) => {
	const query = api.usage.getUsageStats.useQuery(
		{
			apiKeyId,
			startDate,
			endDate,
			filters,
		},
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
			refetchOnWindowFocus: false,
			enabled: !!apiKeyId,
		},
	);

	return query;
};
