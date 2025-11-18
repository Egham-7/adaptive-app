import { api } from "@/trpc/react";

interface UseUsageStatsByOrganizationParams {
	organizationId: string;
	startDate?: string;
	endDate?: string;
}

export const useUsageStatsByOrganization = ({
	organizationId,
	startDate,
	endDate,
}: UseUsageStatsByOrganizationParams) => {
	const query = api.usage.getUsageStatsByOrganization.useQuery(
		{
			organizationId,
			startDate,
			endDate,
		},
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
			refetchOnWindowFocus: false,
			enabled: !!organizationId,
		},
	);

	return query;
};
