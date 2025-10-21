import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { ProviderConfigResponse } from "@/types/providers";

type CreateOrganizationProviderOptions = {
	onSuccess?: (data: ProviderConfigResponse) => void;
};

export const useCreateOrganizationProvider = (
	options?: CreateOrganizationProviderOptions,
) => {
	const utils = api.useUtils();

	return api.providerConfigs.createOrganizationProvider.useMutation({
		onSuccess: async (data) => {
			toast.success("Provider configuration created successfully!");
			await utils.providerConfigs.listOrganizationProviders.refetch();
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create provider configuration");
		},
	});
};
