import { toast } from "sonner";
import { getEndpointTypesFromCompatibility } from "@/lib/providers";
import { api } from "@/trpc/react";
import type {
	ListProvidersApiResponse,
	ProviderConfigApiResponse,
} from "@/types/providers";

type CreateOrganizationProviderOptions = {
	onSuccess?: (data: ProviderConfigApiResponse) => void;
};

export const useCreateOrganizationProvider = (
	options?: CreateOrganizationProviderOptions,
) => {
	const utils = api.useUtils();

	return api.providerConfigs.createOrganizationProvider.useMutation({
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

					const newProvider: ListProvidersApiResponse["providers"][0] = {
						id: Date.now(),
						provider_name: variables.data.provider_name,
						endpoint_types: getEndpointTypesFromCompatibility(
							variables.data.api_compatibility,
						),
						base_url: variables.data.base_url || "",
						has_api_key: !!variables.data.api_key,
						enabled: true,
						source: "organization",
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
						created_by: "",
						updated_by: "",
					};

					return {
						...old,
						providers: [...old.providers, newProvider],
					};
				},
			);

			return { previousData };
		},
		onSuccess: async (data) => {
			toast.success("Provider configuration created successfully!");
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
			toast.error(error.message || "Failed to create provider configuration");
		},
	});
};
