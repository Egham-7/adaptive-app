import { api } from "@/trpc/react";
import type { UsageFilters } from "@/types/usage";

interface UseUsageByAPIKeyParams {
	apiKeyId: number;
	limit?: number;
	offset?: number;
	filters?: UsageFilters;
}

export const useUsageByAPIKey = ({
	apiKeyId,
	limit,
	offset,
	filters,
}: UseUsageByAPIKeyParams) => {
	const query = api.usage.getUsageByAPIKey.useQuery(
		{
			apiKeyId,
			limit,
			offset,
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
