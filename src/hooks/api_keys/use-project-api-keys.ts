import { api } from "@/trpc/react";

export const useProjectApiKeys = (projectId: string) => {
	return api.api_keys.getByProject.useQuery(
		{ projectId: Number(projectId) },
		{
			staleTime: 5 * 60 * 1000,
			refetchOnWindowFocus: false,
			enabled: !!projectId && !Number.isNaN(Number(projectId)),
		},
	);
};
