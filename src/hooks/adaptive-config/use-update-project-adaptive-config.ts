import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { AdaptiveConfigApiResponse } from "@/types/adaptive-config";

type UpdateProjectAdaptiveConfigOptions = {
	onSuccess?: (data: AdaptiveConfigApiResponse) => void;
};

export const useUpdateProjectAdaptiveConfig = (
	options?: UpdateProjectAdaptiveConfigOptions,
) => {
	const utils = api.useUtils();

	return api.adaptiveConfig.updateProjectAdaptiveConfig.useMutation({
		onMutate: async (variables) => {
			await utils.adaptiveConfig.getProjectAdaptiveConfig.cancel();

			const previousData =
				utils.adaptiveConfig.getProjectAdaptiveConfig.getData({
					projectId: variables.projectId,
				});

			// Optimistically update the config
			utils.adaptiveConfig.getProjectAdaptiveConfig.setData(
				{ projectId: variables.projectId },
				(old) => {
					if (!old) return old;

					return {
						...old,
						model_router_config:
							variables.data.model_router_config ?? old.model_router_config,
						fallback_config:
							variables.data.fallback_config ?? old.fallback_config,
						enabled: variables.data.enabled ?? old.enabled,
						updated_at: new Date().toISOString(),
					};
				},
			);

			return { previousData };
		},
		onSuccess: async (data, variables) => {
			toast.success("Adaptive configuration updated successfully!");
			await Promise.all([
				utils.adaptiveConfig.getProjectAdaptiveConfig.invalidate(),
				utils.projects.getById.invalidate({ id: variables.projectId }),
			]);
			options?.onSuccess?.(data);
		},
		onError: (error, variables, context) => {
			if (context?.previousData) {
				utils.adaptiveConfig.getProjectAdaptiveConfig.setData(
					{ projectId: variables.projectId },
					context.previousData,
				);
			}
			toast.error(error.message || "Failed to update adaptive configuration");
		},
	});
};
