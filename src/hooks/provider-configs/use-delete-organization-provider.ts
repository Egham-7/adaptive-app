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
						providers: old.providers.filter(
							(provider) => provider.provider_name !== variables.provider,
						),
					};
				},
			);

			return { previousData };
		},
		onSuccess: async () => {
			toast.success("Provider configuration deleted successfully!");
			await utils.providerConfigs.listOrganizationProviders.invalidate();
			options?.onSuccess?.();
		},
		onError: (error, variables, context) => {
			if (context?.previousData) {
				utils.providerConfigs.listOrganizationProviders.setData(
					{ organizationId: variables.organizationId },
					context.previousData,
				);
			}
			toast.error(error.message || "Failed to delete provider configuration");
		},
	});
};
