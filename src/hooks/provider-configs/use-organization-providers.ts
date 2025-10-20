import { api } from "@/trpc/react";

export const useOrganizationProviders = (
	organizationId: string,
	endpoint?: string,
) => {
	return api.providerConfigs.listOrganizationProviders.useQuery(
		{ organizationId, endpoint },
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
			refetchOnWindowFocus: false,
			enabled: !!organizationId,
		},
	);
};
