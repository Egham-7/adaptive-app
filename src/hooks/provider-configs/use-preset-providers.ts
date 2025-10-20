import { api } from "@/trpc/react";

export const usePresetProviders = (endpoint?: string) => {
	return api.providerConfigs.getPresetProviders.useQuery(
		{ endpoint },
		{
			staleTime: 10 * 60 * 1000,
			refetchOnWindowFocus: false,
		},
	);
};
