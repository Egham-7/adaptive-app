import { api } from "@/trpc/react";

export const useProviderHistory = (configId: number) => {
	return api.providerConfigs.getProviderHistory.useQuery(
		{ configId },
		{
			staleTime: 2 * 60 * 1000, // 2 minutes
			refetchOnWindowFocus: false,
			enabled: !!configId,
		},
	);
};
