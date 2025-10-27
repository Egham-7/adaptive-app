import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
	useCreateProjectAdaptiveConfig,
	useUpdateProjectAdaptiveConfig,
} from "@/hooks/adaptive-config";
import {
	type AdaptiveConfigApiResponse,
	type AdaptiveConfigFormData,
	adaptiveConfigFormSchema,
} from "@/types/adaptive-config";

interface UseAdaptiveConfigFormProps {
	projectId: number;
	existingConfig?: AdaptiveConfigApiResponse;
	onSuccess?: () => void;
}

export function useAdaptiveConfigForm({
	projectId,
	existingConfig,
	onSuccess,
}: UseAdaptiveConfigFormProps) {
	const createMutation = useCreateProjectAdaptiveConfig();
	const updateMutation = useUpdateProjectAdaptiveConfig();

	// Form data now matches API response structure exactly
	const defaultValues: AdaptiveConfigFormData = useMemo(
		() =>
			existingConfig
				? {
						enabled: existingConfig.enabled,
						model_router_config: existingConfig.model_router_config,
						fallback_config: existingConfig.fallback_config,
					}
				: {
						// Model Router defaults
						model_router_config: {
							cost_bias: 0.5,
							cache: {
								enabled: false,
								semantic_threshold: 0.95,
							},
						},
						// Fallback defaults
						fallback_config: {
							mode: "sequential",
							timeout_ms: 30000,
							max_retries: 2,
						},
						// General
						enabled: true,
					},
		[existingConfig],
	);

	const form = useForm<AdaptiveConfigFormData>({
		resolver: zodResolver(adaptiveConfigFormSchema),
		defaultValues,
		mode: "onChange",
	});

	useEffect(() => {
		form.reset(defaultValues);
		createMutation.reset();
		updateMutation.reset();
	}, [createMutation.reset, form.reset, updateMutation.reset, defaultValues]);

	const onSubmit = async (data: AdaptiveConfigFormData) => {
		try {
			// If source is "organization", there's no project-level config yet
			// So we should CREATE, not UPDATE
			const shouldCreate =
				!existingConfig || existingConfig.source === "organization";

			if (shouldCreate) {
				await createMutation.mutateAsync({
					projectId,
					data, // No transformation needed - form data matches API structure
				});
			} else {
				await updateMutation.mutateAsync({
					projectId,
					data, // No transformation needed - form data matches API structure
				});
			}

			onSuccess?.();
		} catch (error) {
			console.error("Failed to save adaptive config:", error);
			throw error;
		}
	};

	const isLoading = createMutation.isPending || updateMutation.isPending;
	const isSuccess = createMutation.isSuccess || updateMutation.isSuccess;

	return {
		form,
		onSubmit,
		isLoading,
		isSuccess,
	};
}
