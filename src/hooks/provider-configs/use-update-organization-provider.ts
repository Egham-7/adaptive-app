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
		onSuccess: (data) => {
			toast.success("Provider configuration updated successfully!");
			utils.providerConfigs.listOrganizationProviders.invalidate();
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update provider configuration");
		},
	});
};
