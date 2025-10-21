import { toast } from "sonner";
import { api } from "@/trpc/react";
import type {
	ProviderConfigListResponse,
	ProviderConfigResponse,
} from "@/types/providers";

type CreateProjectProviderOptions = {
	onSuccess?: (data: ProviderConfigResponse) => void;
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

					const newProvider: ProviderConfigListResponse["providers"][0] = {
						id: Date.now(),
						provider_name: variables.data.provider_name,
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
		onSuccess: async (data) => {
			toast.success("Provider configuration created successfully!");
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
			toast.error(error.message || "Failed to create provider configuration");
		},
	});
};
