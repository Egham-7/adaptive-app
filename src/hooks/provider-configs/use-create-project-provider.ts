import { toast } from "sonner";
import { api } from "@/trpc/react";
import type {
	ListProvidersApiResponse,
	ProviderConfigApiResponse,
} from "@/types/providers";
import { getEndpointTypesFromCompatibility } from "@/types/providers";

type CreateProjectProviderOptions = {
	onSuccess?: (data: ProviderConfigApiResponse) => void;
};

export const useCreateProjectProvider = (
	options?: CreateProjectProviderOptions,
) => {
	const utils = api.useUtils();

	return api.providerConfigs.createProjectProvider.useMutation({
		onMutate: async (variables) => {
			await utils.providerConfigs.listProjectProviders.cancel();

			const previousData = utils.providerConfigs.listProjectProviders.getData({
				projectId: variables.projectId,
			});

			utils.providerConfigs.listProjectProviders.setData(
				{ projectId: variables.projectId },
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
						has_authorization_header: !!variables.data.authorization_header,
						enabled: true,
						source: "project",
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
		onSuccess: async (data, variables) => {
			toast.success("Provider configuration created successfully!");
			await Promise.all([
				utils.providerConfigs.listProjectProviders.invalidate(),
				utils.projects.getById.invalidate({ id: variables.projectId }),
				utils.projects.getByOrganization.invalidate(),
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
			toast.error(error.message || "Failed to create provider configuration");
		},
	});
};
