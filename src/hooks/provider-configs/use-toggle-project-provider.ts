import { api } from "@/trpc/react";

export const useToggleProjectProvider = () => {
	const utils = api.useUtils();

	return api.providerConfigs.toggleProjectProvider.useMutation({
		onSuccess: (_data, variables) => {
			void utils.providerConfigs.listProjectProviders.invalidate({
				projectId: variables.projectId,
			});
		},
	});
};
