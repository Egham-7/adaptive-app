"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	useUpdateOrganizationProvider,
	useUpdateProjectProvider,
} from "@/hooks/provider-configs";
import {
	getCompatibilityFromEndpointTypes,
	getEndpointTypesFromCompatibility,
} from "@/lib/providers";
import {
	API_COMPATIBILITY_METADATA,
	type ApiCompatibilityType,
	type EndpointType,
	PROVIDER_METADATA,
	type ProviderName,
	type UpdateProviderApiRequest,
} from "@/types/providers";

const editProviderSchema = z.object({
	apiCompatibility: z.enum(["openai", "anthropic", "gemini"]).optional(),
	apiKey: z.string().optional(),
	baseUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

type EditProviderFormValues = z.infer<typeof editProviderSchema>;

interface EditProviderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	providerName: string;
	level: "project" | "organization";
	projectId?: number;
	organizationId?: string;
	existingConfig?: {
		endpoint_types?: EndpointType[];
		has_api_key?: boolean;
		base_url?: string;
	};
}

export function EditProviderDialog({
	open,
	onOpenChange,
	providerName,
	level,
	projectId,
	organizationId,
	existingConfig,
}: EditProviderDialogProps) {
	const metadata = PROVIDER_METADATA[providerName as ProviderName];
	const isCustomProvider = !metadata;
	const [showApiKey, setShowApiKey] = useState(false);
	const [showCompatibilityWarning, setShowCompatibilityWarning] =
		useState(false);

	// Derive API compatibility from existing endpoint_types
	const currentCompatibility = existingConfig?.endpoint_types
		? getCompatibilityFromEndpointTypes(existingConfig.endpoint_types)
		: null;

	const form = useForm<EditProviderFormValues>({
		resolver: zodResolver(editProviderSchema),
		defaultValues: {
			apiCompatibility: currentCompatibility ?? undefined,
			apiKey: "",
			baseUrl: existingConfig?.base_url || "",
		},
	});

	const updateProjectProvider = useUpdateProjectProvider();
	const updateOrgProvider = useUpdateOrganizationProvider();

	useEffect(() => {
		if (!open) {
			form.reset();
			setShowApiKey(false);
			setShowCompatibilityWarning(false);
		} else {
			form.reset({
				apiCompatibility: currentCompatibility ?? undefined,
				apiKey: "",
				baseUrl: existingConfig?.base_url || "",
			});
		}
	}, [open, form, existingConfig, currentCompatibility]);

	const onSubmit = (values: EditProviderFormValues) => {
		const data: UpdateProviderApiRequest = {
			...(values.apiKey?.trim() && { api_key: values.apiKey.trim() }),
			...(values.baseUrl?.trim() && { base_url: values.baseUrl.trim() }),
		};

		// Include endpoint_types if API compatibility changed
		if (
			values.apiCompatibility &&
			values.apiCompatibility !== currentCompatibility
		) {
			data.endpoint_types = getEndpointTypesFromCompatibility(
				values.apiCompatibility as ApiCompatibilityType,
			);
		}

		if (level === "project" && projectId) {
			updateProjectProvider.mutate(
				{
					projectId,
					provider: providerName,
					data,
				},
				{
					onSuccess: () => {
						onOpenChange(false);
					},
				},
			);
		} else if (level === "organization" && organizationId) {
			updateOrgProvider.mutate(
				{
					organizationId,
					provider: providerName,
					data,
				},
				{
					onSuccess: () => {
						onOpenChange(false);
					},
				},
			);
		}
	};

	const isLoading =
		updateProjectProvider.isPending || updateOrgProvider.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<div className="flex items-center gap-3">
						{metadata?.logo && (
							<Image
								src={metadata.logo}
								alt={`${metadata.displayName} logo`}
								width={32}
								height={32}
								className="rounded-lg"
							/>
						)}
						<div>
							<DialogTitle>
								Edit {metadata?.displayName ?? providerName}
							</DialogTitle>
							<DialogDescription>
								{level === "project"
									? "Update provider configuration for this project"
									: "Update provider configuration for this organization"}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="apiKey"
							render={({ field }) => (
								<FormItem>
									<FormLabel>API Key (Optional)</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showApiKey ? "text" : "password"}
												placeholder="Leave empty to keep existing key"
												className="pr-10"
												{...field}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowApiKey(!showApiKey)}
											>
												{showApiKey ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</Button>
										</div>
									</FormControl>
									<FormDescription>
										Leave empty to keep existing value
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{isCustomProvider && (
							<FormField
								control={form.control}
								name="apiCompatibility"
								render={({ field }) => (
									<FormItem>
										<FormLabel>API Compatibility</FormLabel>
										<FormControl>
											<select
												{...field}
												value={field.value || ""}
												onChange={(e) => {
													if (e.target.value !== currentCompatibility) {
														setShowCompatibilityWarning(true);
													}
													field.onChange(e);
												}}
												className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
											>
												{Object.entries(API_COMPATIBILITY_METADATA).map(
													([key, metadata]) => (
														<option key={key} value={key}>
															{metadata.label}
														</option>
													),
												)}
											</select>
										</FormControl>
										{showCompatibilityWarning &&
											field.value !== currentCompatibility && (
												<div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
													<strong>⚠️ Warning:</strong> Changing API compatibility
													may break existing integrations. Make sure the new
													format matches your provider's API.
												</div>
											)}
										<FormDescription>
											{field.value &&
												API_COMPATIBILITY_METADATA[
													field.value as ApiCompatibilityType
												]?.description}
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<FormField
							control={form.control}
							name="baseUrl"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Base URL (Optional)</FormLabel>
									<FormControl>
										<Input
											type="url"
											placeholder="https://api.example.com"
											{...field}
										/>
									</FormControl>
									<FormDescription>Leave empty to use default</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? "Updating..." : "Update"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
