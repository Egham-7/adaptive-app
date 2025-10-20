import { api } from "@/trpc/react";

export const useProjectProviders = (projectId: number, endpoint?: string) => {
	return api.providerConfigs.listProjectProviders.useQuery(
		{ projectId, endpoint },
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
			refetchOnWindowFocus: false,
			enabled: !!projectId,
		},
	);
};
