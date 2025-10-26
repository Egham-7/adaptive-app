import { api } from "@/trpc/react";

/**
 * Fetch the resolved adaptive configuration for an organization
 */
export const useOrganizationAdaptiveConfig = (organizationId: string) => {
	return api.adaptiveConfig.getOrganizationAdaptiveConfig.useQuery(
		{ organizationId },
		{
			staleTime: 30 * 1000, // 30 seconds
			refetchOnWindowFocus: false,
			enabled: !!organizationId,
		},
	);
};
