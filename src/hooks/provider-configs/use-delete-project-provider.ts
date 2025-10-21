import { toast } from "sonner";
import { api } from "@/trpc/react";

type DeleteProjectProviderOptions = {
	onSuccess?: () => void;
};

export const useDeleteProjectProvider = (
	options?: DeleteProjectProviderOptions,
) => {
	const utils = api.useUtils();

	return api.providerConfigs.deleteProjectProvider.useMutation({
		onSuccess: async () => {
			toast.success("Provider configuration deleted successfully!");
			await utils.providerConfigs.listProjectProviders.refetch();
			options?.onSuccess?.();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete provider configuration");
		},
	});
};
