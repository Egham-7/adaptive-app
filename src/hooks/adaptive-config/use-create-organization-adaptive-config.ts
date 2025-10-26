import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { AdaptiveConfigApiResponse } from "@/types/adaptive-config";

type CreateOrganizationAdaptiveConfigOptions = {
	onSuccess?: (data: AdaptiveConfigApiResponse) => void;
};

export const useCreateOrganizationAdaptiveConfig = (
	options?: CreateOrganizationAdaptiveConfigOptions,
) => {
	const utils = api.useUtils();

	return api.adaptiveConfig.createOrganizationAdaptiveConfig.useMutation({
		onMutate: async (variables) => {
			await utils.adaptiveConfig.getOrganizationAdaptiveConfig.cancel();

			const previousData =
				utils.adaptiveConfig.getOrganizationAdaptiveConfig.getData({
					organizationId: variables.organizationId,
				});

			// Optimistically update with new config
			utils.adaptiveConfig.getOrganizationAdaptiveConfig.setData(
				{ organizationId: variables.organizationId },
				(old) => {
					if (!old) {
						return {
							id: Date.now(),
							organization_id: variables.organizationId,
							model_router_config: variables.data.model_router_config,
							fallback_config: variables.data.fallback_config,
							enabled: true,
							source: "organization",
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
		onSuccess: async (data) => {
			toast.success("Adaptive configuration created successfully!");
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
			toast.error(error.message || "Failed to create adaptive configuration");
		},
	});
};
