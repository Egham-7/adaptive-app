import { toast } from "sonner";
import { api } from "@/trpc/react";

type DeleteProjectProviderOptions = {
	onSuccess?: () => void;
};

export const useDeleteProjectProvider = (
	options?: DeleteProjectProviderOptions,
) => {
	const utils = api.useUtils();

	return api.providerConfigs.deleteProjectProvider.useMutation({
		onMutate: async (variables) => {
			await utils.providerConfigs.listProjectProviders.cancel();

			const previousData = utils.providerConfigs.listProjectProviders.getData({
				projectId: variables.projectId,
			});

			utils.providerConfigs.listProjectProviders.setData(
				{ projectId: variables.projectId },
				(old) => {
					if (!old) return old;

					return {
						...old,
						providers: old.providers.filter(
							(provider) => provider.provider_name !== variables.provider,
						),
					};
				},
			);

			return { previousData };
		},
		onSuccess: async (_data, variables) => {
			toast.success("Provider configuration deleted successfully!");
			await Promise.all([
				utils.providerConfigs.listProjectProviders.invalidate(),
				utils.projects.getById.invalidate({ id: variables.projectId }),
				utils.projects.getByOrganization.invalidate(),
			]);
			options?.onSuccess?.();
		},
		onError: (error, variables, context) => {
			if (context?.previousData) {
				utils.providerConfigs.listProjectProviders.setData(
					{ projectId: variables.projectId },
					context.previousData,
				);
			}
			toast.error(error.message || "Failed to delete provider configuration");
		},
	});
};
