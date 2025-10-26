import { toast } from "sonner";
import { api } from "@/trpc/react";

type DeleteProjectAdaptiveConfigOptions = {
	onSuccess?: () => void;
};

export const useDeleteProjectAdaptiveConfig = (
	options?: DeleteProjectAdaptiveConfigOptions,
) => {
	const utils = api.useUtils();

	return api.adaptiveConfig.deleteProjectAdaptiveConfig.useMutation({
		onMutate: async (variables) => {
			await utils.adaptiveConfig.getProjectAdaptiveConfig.cancel();

			const previousData =
				utils.adaptiveConfig.getProjectAdaptiveConfig.getData({
					projectId: variables.projectId,
				});

			// Optimistically remove the config
			utils.adaptiveConfig.getProjectAdaptiveConfig.setData(
				{ projectId: variables.projectId },
				undefined,
			);

			return { previousData };
		},
		onSuccess: async (_data, variables) => {
			toast.success("Adaptive configuration deleted successfully!");
			await Promise.all([
				utils.adaptiveConfig.getProjectAdaptiveConfig.invalidate(),
				utils.projects.getById.invalidate({ id: variables.projectId }),
			]);
			options?.onSuccess?.();
		},
		onError: (error, variables, context) => {
			if (context?.previousData) {
				utils.adaptiveConfig.getProjectAdaptiveConfig.setData(
					{ projectId: variables.projectId },
					context.previousData,
				);
			}
			toast.error(error.message || "Failed to delete adaptive configuration");
		},
	});
};
