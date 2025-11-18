import { api } from "@/trpc/react";
import type { UsageFilters } from "@/types/usage";

interface UseUsageByOrganizationParams {
	organizationId: string;
	limit?: number;
	offset?: number;
	filters?: UsageFilters;
}

export const useUsageByOrganization = ({
	organizationId,
	limit,
	offset,
	filters,
}: UseUsageByOrganizationParams) => {
	const query = api.usage.getUsageByOrganization.useQuery(
		{
			organizationId,
			limit,
			offset,
			filters,
		},
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
			refetchOnWindowFocus: false,
			enabled: !!organizationId,
		},
	);

	return query;
};
