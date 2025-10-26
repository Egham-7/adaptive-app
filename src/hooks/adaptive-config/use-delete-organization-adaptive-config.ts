import { toast } from "sonner";
import { api } from "@/trpc/react";

type DeleteOrganizationAdaptiveConfigOptions = {
	onSuccess?: () => void;
};

export const useDeleteOrganizationAdaptiveConfig = (
	options?: DeleteOrganizationAdaptiveConfigOptions,
) => {
	const utils = api.useUtils();

	return api.adaptiveConfig.deleteOrganizationAdaptiveConfig.useMutation({
		onMutate: async (variables) => {
			await utils.adaptiveConfig.getOrganizationAdaptiveConfig.cancel();

			const previousData =
				utils.adaptiveConfig.getOrganizationAdaptiveConfig.getData({
					organizationId: variables.organizationId,
				});

			// Optimistically remove the config
			utils.adaptiveConfig.getOrganizationAdaptiveConfig.setData(
				{ organizationId: variables.organizationId },
				undefined,
			);

			return { previousData };
		},
		onSuccess: async () => {
			toast.success("Adaptive configuration deleted successfully!");
			await Promise.all([
				utils.adaptiveConfig.getOrganizationAdaptiveConfig.invalidate(),
				// Invalidate all project adaptive configs since they inherit from org configs
				utils.adaptiveConfig.getProjectAdaptiveConfig.invalidate(),
			]);
			options?.onSuccess?.();
		},
		onError: (error, variables, context) => {
			if (context?.previousData) {
				utils.adaptiveConfig.getOrganizationAdaptiveConfig.setData(
					{ organizationId: variables.organizationId },
					context.previousData,
				);
			}
			toast.error(error.message || "Failed to delete adaptive configuration");
		},
	});
};
