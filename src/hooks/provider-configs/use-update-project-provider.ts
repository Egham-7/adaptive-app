import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { ProviderConfigResponse } from "@/types/providers";

type UpdateProjectProviderOptions = {
	onSuccess?: (data: ProviderConfigResponse) => void;
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
											has_api_key: true,
										}),
										...(variables.data.authorization_header !== undefined && {
											has_authorization_header: true,
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
		onSuccess: async (data) => {
			toast.success("Provider configuration updated successfully!");
			await utils.providerConfigs.listProjectProviders.invalidate();
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
