import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { AdaptiveConfigApiResponse } from "@/types/adaptive-config";

type UpdateOrganizationAdaptiveConfigOptions = {
	onSuccess?: (data: AdaptiveConfigApiResponse) => void;
};

export const useUpdateOrganizationAdaptiveConfig = (
	options?: UpdateOrganizationAdaptiveConfigOptions,
) => {
	const utils = api.useUtils();

	return api.adaptiveConfig.updateOrganizationAdaptiveConfig.useMutation({
		onMutate: async (variables) => {
			await utils.adaptiveConfig.getOrganizationAdaptiveConfig.cancel();

			const previousData =
				utils.adaptiveConfig.getOrganizationAdaptiveConfig.getData({
					organizationId: variables.organizationId,
				});

			// Optimistically update the config
			utils.adaptiveConfig.getOrganizationAdaptiveConfig.setData(
				{ organizationId: variables.organizationId },
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
		onSuccess: async (data) => {
			toast.success("Adaptive configuration updated successfully!");
			await Promise.all([
				utils.adaptiveConfig.getOrganizationAdaptiveConfig.invalidate(),
				// Invalidate all project adaptive configs since they inherit from org configs
				utils.adaptiveConfig.getProjectAdaptiveConfig.invalidate(),
			]);
			options?.onSuccess?.(data);
		},
		onError: (error, variables, context) => {
			if (context?.previousData) {
				utils.adaptiveConfig.getOrganizationAdaptiveConfig.setData(
					{ organizationId: variables.organizationId },
					context.previousData,
				);
			}
			toast.error(error.message || "Failed to update adaptive configuration");
		},
	});
};
