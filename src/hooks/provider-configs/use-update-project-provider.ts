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
		onSuccess: async (data) => {
			toast.success("Provider configuration updated successfully!");
			await utils.providerConfigs.listProjectProviders.refetch();
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update provider configuration");
		},
	});
};
