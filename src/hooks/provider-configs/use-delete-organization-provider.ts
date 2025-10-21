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
		onSuccess: async () => {
			toast.success("Provider configuration deleted successfully!");
			await utils.providerConfigs.listOrganizationProviders.refetch();
			options?.onSuccess?.();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete provider configuration");
		},
	});
};
