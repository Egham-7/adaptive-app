import { api } from "@/trpc/react";

export const useProjectProviders = (projectId: number, endpoint?: string) => {
	return api.providerConfigs.listProjectProviders.useQuery(
		{ projectId, endpoint },
		{
			staleTime: 30 * 1000, // 30 seconds
			refetchOnWindowFocus: false,
			enabled: !!projectId,
		},
	);
};
