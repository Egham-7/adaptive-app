import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { AdaptiveConfigApiResponse } from "@/types/adaptive-config";

type CreateProjectAdaptiveConfigOptions = {
	onSuccess?: (data: AdaptiveConfigApiResponse) => void;
};

export const useCreateProjectAdaptiveConfig = (
	options?: CreateProjectAdaptiveConfigOptions,
) => {
	const utils = api.useUtils();

	return api.adaptiveConfig.createProjectAdaptiveConfig.useMutation({
		onMutate: async (variables) => {
			await utils.adaptiveConfig.getProjectAdaptiveConfig.cancel();

			const previousData =
				utils.adaptiveConfig.getProjectAdaptiveConfig.getData({
					projectId: variables.projectId,
				});

			// Optimistically update with new config
			utils.adaptiveConfig.getProjectAdaptiveConfig.setData(
				{ projectId: variables.projectId },
				(old) => {
					if (!old) {
						return {
							id: Date.now(),
							project_id: variables.projectId,
							organization_id: "",
							model_router_config: variables.data.model_router_config,
							fallback_config: variables.data.fallback_config,
							enabled: true,
							source: "project",
							created_at: new Date().toISOString(),
							updated_at: new Date().toISOString(),
							created_by: "",
							updated_by: "",
						} as AdaptiveConfigApiResponse;
					}
					return old;
				},
			);

			return { previousData };
		},
		onSuccess: async (data, variables) => {
			toast.success("Adaptive configuration created successfully!");
			await Promise.all([
				utils.adaptiveConfig.getProjectAdaptiveConfig.invalidate(),
				utils.projects.getById.invalidate({ id: variables.projectId }),
				utils.projects.getByOrganization.invalidate(),
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
			toast.error(error.message || "Failed to create adaptive configuration");
		},
	});
};
