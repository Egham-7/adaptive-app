import { api } from "@/trpc/react";
import type { UsageFilters } from "@/types/usage";

interface UseUsageByPeriodParams {
	apiKeyId: number;
	startDate?: string;
	endDate?: string;
	groupBy?: "day" | "week" | "month";
	filters?: UsageFilters;
}

export const useUsageByPeriod = ({
	apiKeyId,
	startDate,
	endDate,
	groupBy,
	filters,
}: UseUsageByPeriodParams) => {
	const query = api.usage.getUsageByPeriod.useQuery(
		{
			apiKeyId,
			startDate,
			endDate,
			groupBy,
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
