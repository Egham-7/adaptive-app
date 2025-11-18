import { api } from "@/trpc/react";

interface UseUsageStatsByProjectParams {
	projectId: number;
	startDate?: string;
	endDate?: string;
}

export const useUsageStatsByProject = ({
	projectId,
	startDate,
	endDate,
}: UseUsageStatsByProjectParams) => {
	const query = api.usage.getUsageStatsByProject.useQuery(
		{
			projectId,
			startDate,
			endDate,
		},
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
			refetchOnWindowFocus: false,
			enabled: !!projectId,
		},
	);

	return query;
};
