import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { ProviderConfigResponse } from "@/types/providers";

type CreateProjectProviderOptions = {
	onSuccess?: (data: ProviderConfigResponse) => void;
};

export const useCreateProjectProvider = (
	options?: CreateProjectProviderOptions,
) => {
	const utils = api.useUtils();

	return api.providerConfigs.createProjectProvider.useMutation({
		onSuccess: (data) => {
			toast.success("Provider configuration created successfully!");
			utils.providerConfigs.listProjectProviders.invalidate();
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create provider configuration");
		},
	});
};
