import { api } from "@/trpc/react";

export const useToggleOrganizationProvider = () => {
	const utils = api.useUtils();

	return api.providerConfigs.toggleOrganizationProvider.useMutation({
		onSuccess: (_data, variables) => {
			void utils.providerConfigs.listOrganizationProviders.invalidate({
				organizationId: variables.organizationId,
			});
		},
	});
};
