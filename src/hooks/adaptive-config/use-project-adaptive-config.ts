import { api } from "@/trpc/react";

/**
 * Fetch the resolved adaptive configuration for a project
 */
export const useProjectAdaptiveConfig = (projectId: number) => {
	return api.adaptiveConfig.getProjectAdaptiveConfig.useQuery(
		{ projectId },
		{
			staleTime: 30 * 1000, // 30 seconds
			refetchOnWindowFocus: false,
			enabled: !!projectId,
		},
	);
};
