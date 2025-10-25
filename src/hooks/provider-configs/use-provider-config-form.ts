import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
	useCreateProjectProvider,
	useUpdateProjectProvider,
} from "@/hooks/provider-configs";
import {
	createProviderConfigFormSchema,
	type ProviderConfigApiResponse,
	type UpdateProviderApiRequest,
} from "@/types/providers";

interface FormData {
	apiKey?: string;
	baseUrl?: string;
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
	isCustom,
	projectId,
	existingConfig,
	onSuccess,
}: UseProviderConfigFormProps) {
	const createMutation = useCreateProjectProvider();
	const updateMutation = useUpdateProjectProvider();

	const form = useForm<FormData>({
		resolver: zodResolver(createProviderConfigFormSchema(isCustom)),
		defaultValues: {
			apiKey: "",
			baseUrl: existingConfig?.base_url || "",
		},
		mode: "onChange",
	});

	useEffect(() => {
		form.reset({
			apiKey: "",
			baseUrl: existingConfig?.base_url || "",
		});
		createMutation.reset();
		updateMutation.reset();
	}, [
		existingConfig?.base_url,
		createMutation.reset,
		form.reset,
		updateMutation.reset,
	]);

	const onSubmit = async (data: FormData) => {
		const apiData: UpdateProviderApiRequest = {};

		if (data.apiKey?.trim()) {
			apiData.api_key = data.apiKey.trim();
		}
		if (data.baseUrl?.trim()) {
			apiData.base_url = data.baseUrl.trim();
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
					api_compatibility: "openai" as const,
					...apiData,
				};

				await createMutation.mutateAsync({
					projectId,
					provider: providerName,
					data: createData,
				});
			}

			form.reset();
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
