import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	useCreateProjectProvider,
	useUpdateProjectProvider,
} from "@/hooks/provider-configs";
import { cleanEndpointOverrides } from "@/lib/providers/utils";
import type {
	EndpointOverride,
	EndpointType,
	ProviderConfigApiResponse,
	UpdateProviderApiRequest,
} from "@/types/providers";

const providerConfigFormSchema = z.object({
	apiKey: z.string().optional(),
	baseUrl: z.union([z.url(), z.literal("")]).optional(),
	useEndpointOverrides: z.boolean(),
	endpointOverrides: z
		.object({
			chat_completions: z
				.object({
					base_url: z.union([z.url(), z.literal("")]).optional(),
				})
				.optional(),
			messages: z
				.object({
					base_url: z.union([z.url(), z.literal("")]).optional(),
				})
				.optional(),
			generate: z
				.object({
					base_url: z.union([z.url(), z.literal("")]).optional(),
				})
				.optional(),
			count_tokens: z
				.object({
					base_url: z.union([z.url(), z.literal("")]).optional(),
				})
				.optional(),
			select_model: z
				.object({
					base_url: z.union([z.url(), z.literal("")]).optional(),
				})
				.optional(),
		})
		.optional(),
});

interface FormData {
	apiKey?: string;
	baseUrl?: string;
	useEndpointOverrides: boolean;
	endpointOverrides?: Partial<Record<EndpointType, EndpointOverride>>;
}

interface UseProviderConfigFormProps {
	providerName: string;
	isCustom: boolean;
	projectId: number;
	existingConfig?: ProviderConfigApiResponse;
	onSuccess?: () => void;
}

export function useProviderConfigForm({
	providerName,
	projectId,
	existingConfig,
	onSuccess,
}: UseProviderConfigFormProps) {
	const createMutation = useCreateProjectProvider();
	const updateMutation = useUpdateProjectProvider();

	// Auto-detect if existing config has endpoint overrides
	const hasExistingOverrides =
		existingConfig?.endpoint_overrides &&
		Object.keys(existingConfig.endpoint_overrides).length > 0;

	console.log("existingConfig:", existingConfig);

	const form = useForm<FormData>({
		resolver: zodResolver(providerConfigFormSchema),
		defaultValues: {
			apiKey: existingConfig?.api_key || "",
			baseUrl: existingConfig?.base_url || "",
			useEndpointOverrides: hasExistingOverrides || false,
			endpointOverrides: existingConfig?.endpoint_overrides || {},
		},
		mode: "onChange",
	});

	useEffect(() => {
		const hasOverrides =
			existingConfig?.endpoint_overrides &&
			Object.keys(existingConfig.endpoint_overrides).length > 0;

		form.reset({
			apiKey: existingConfig?.api_key || "",
			baseUrl: existingConfig?.base_url || "",
			useEndpointOverrides: hasOverrides || false,
			endpointOverrides: existingConfig?.endpoint_overrides || {},
		});
		createMutation.reset();
		updateMutation.reset();
	}, [
		existingConfig?.api_key,
		existingConfig?.base_url,
		existingConfig?.endpoint_overrides,
		createMutation.reset,
		form.reset,
		updateMutation.reset,
	]);

	const onSubmit = async (data: FormData) => {
		const apiData: UpdateProviderApiRequest = {};

		// Only send API key if it has changed from the existing value
		const trimmedApiKey = data.apiKey?.trim();
		if (trimmedApiKey && trimmedApiKey !== existingConfig?.api_key) {
			apiData.api_key = trimmedApiKey;
		}

		// Always send base_url if it's defined (including empty string to clear it)
		if (data.baseUrl !== undefined) {
			apiData.base_url = data.baseUrl.trim();
		}

		// Include endpoint overrides if enabled
		if (data.useEndpointOverrides) {
			apiData.endpoint_overrides = cleanEndpointOverrides(
				data.endpointOverrides,
			);
		} else {
			// If overrides are disabled, explicitly clear them
			apiData.endpoint_overrides = undefined;
		}

		try {
			if (existingConfig) {
				await updateMutation.mutateAsync({
					projectId,
					provider: providerName,
					data: apiData,
				});
			} else {
				const createData = {
					provider_name: providerName,
					...apiData,
				};

				await createMutation.mutateAsync({
					projectId,
					provider: providerName,
					data: createData,
				});
			}

			form.reset({
				apiKey: existingConfig?.api_key || "",
				baseUrl: existingConfig?.base_url || "",
				useEndpointOverrides: false,
				endpointOverrides: {},
			});
			onSuccess?.();
		} catch (error) {
			console.error("Failed to save provider config:", error);
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
