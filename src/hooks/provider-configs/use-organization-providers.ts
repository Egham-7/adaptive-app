import { api } from "@/trpc/react";

export const useOrganizationProviders = (
	organizationId: string,
	endpoint?: string,
) => {
	return api.providerConfigs.listOrganizationProviders.useQuery(
		{ organizationId, endpoint },
		{
			staleTime: 30 * 1000, // 30 seconds
			refetchOnWindowFocus: false,
			enabled: !!organizationId,
		},
	);
};
