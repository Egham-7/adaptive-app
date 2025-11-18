import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { ProviderConfigApiResponse } from "@/types/providers";

type UpdateProjectProviderOptions = {
	onSuccess?: (data: ProviderConfigApiResponse) => void;
};

export const useUpdateProjectProvider = (
	options?: UpdateProjectProviderOptions,
) => {
	const utils = api.useUtils();

	return api.providerConfigs.updateProjectProvider.useMutation({
		onMutate: async (variables) => {
			await utils.providerConfigs.listProjectProviders.cancel();

			const previousData = utils.providerConfigs.listProjectProviders.getData({
				projectId: variables.projectId,
			});

			utils.providerConfigs.listProjectProviders.setData(
				{ projectId: variables.projectId },
				(old) => {
					if (!old || !old.providers) return old;

					return {
						...old,
						providers: old.providers.map((provider) =>
							provider.provider_name === variables.provider
								? {
										...provider,
										...(variables.data.base_url !== undefined && {
											base_url: variables.data.base_url,
										}),
										...(variables.data.api_key !== undefined && {
											api_key: variables.data.api_key,
										}),
										...(variables.data.enabled !== undefined && {
											enabled: variables.data.enabled,
										}),
										updated_at: new Date().toISOString(),
									}
								: provider,
						),
					};
				},
			);

			return { previousData };
		},
		onSuccess: async (data, variables) => {
			toast.success("Provider configuration updated successfully!");
			await Promise.all([
				utils.providerConfigs.listProjectProviders.invalidate(),
				utils.projects.getById.invalidate({ id: variables.projectId }),
				utils.projects.getByOrganization.invalidate(),
				utils.providerConfigs.getProviderHistory.invalidate({
					configId: data.id,
				}),
				utils.providerConfigs.getProjectHistory.invalidate({
					projectId: variables.projectId,
				}),
			]);
			options?.onSuccess?.(data);
		},
		onError: (error, variables, context) => {
			if (context?.previousData) {
				utils.providerConfigs.listProjectProviders.setData(
					{ projectId: variables.projectId },
					context.previousData,
				);
			}
			toast.error(error.message || "Failed to update provider configuration");
		},
	});
};
