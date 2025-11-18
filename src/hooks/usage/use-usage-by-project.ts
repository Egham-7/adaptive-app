import { api } from "@/trpc/react";
import type { UsageFilters } from "@/types/usage";

interface UseUsageByProjectParams {
	projectId: number;
	limit?: number;
	offset?: number;
	filters?: UsageFilters;
}

export const useUsageByProject = ({
	projectId,
	limit,
	offset,
	filters,
}: UseUsageByProjectParams) => {
	const query = api.usage.getUsageByProject.useQuery(
		{
			projectId,
			limit,
			offset,
			filters,
		},
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
			refetchOnWindowFocus: false,
			enabled: !!projectId,
		},
	);

	return query;
};
