import { toast } from "sonner";
import { api } from "@/trpc/react";

type DeleteOrganizationProviderOptions = {
	onSuccess?: () => void;
};

export const useDeleteOrganizationProvider = (
	options?: DeleteOrganizationProviderOptions,
) => {
	const utils = api.useUtils();

	return api.providerConfigs.deleteOrganizationProvider.useMutation({
		onSuccess: () => {
			toast.success("Provider configuration deleted successfully!");
			utils.providerConfigs.listOrganizationProviders.invalidate();
			options?.onSuccess?.();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete provider configuration");
		},
	});
};
