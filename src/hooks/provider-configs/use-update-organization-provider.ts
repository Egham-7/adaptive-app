import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { ProviderConfigResponse } from "@/types/providers";

type UpdateOrganizationProviderOptions = {
	onSuccess?: (data: ProviderConfigResponse) => void;
};

export const useUpdateOrganizationProvider = (
	options?: UpdateOrganizationProviderOptions,
) => {
	const utils = api.useUtils();

	return api.providerConfigs.updateOrganizationProvider.useMutation({
		onMutate: async (variables) => {
			await utils.providerConfigs.listOrganizationProviders.cancel();

			const previousData =
				utils.providerConfigs.listOrganizationProviders.getData({
					organizationId: variables.organizationId,
				});

			utils.providerConfigs.listOrganizationProviders.setData(
				{ organizationId: variables.organizationId },
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
			await Promise.all([
				utils.providerConfigs.listOrganizationProviders.invalidate(),
				// Invalidate all project provider lists since they inherit from org configs
				utils.providerConfigs.listProjectProviders.invalidate(),
			]);
			options?.onSuccess?.(data);
		},
		onError: (error, variables, context) => {
			if (context?.previousData) {
				utils.providerConfigs.listOrganizationProviders.setData(
					{ organizationId: variables.organizationId },
					context.previousData,
				);
			}
			toast.error(error.message || "Failed to update provider configuration");
		},
	});
};
