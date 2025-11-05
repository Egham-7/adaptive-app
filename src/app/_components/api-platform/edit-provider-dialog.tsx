"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	useUpdateOrganizationProvider,
	useUpdateProjectProvider,
} from "@/hooks/provider-configs";
import {
	getCompatibilityFromEndpointTypes,
	getEndpointTypesFromCompatibility,
} from "@/lib/providers";
import { cleanEndpointOverrides } from "@/lib/providers/utils";
import {
	API_COMPATIBILITY_METADATA,
	type ApiCompatibilityType,
	type EndpointOverride,
	type EndpointType,
	PROVIDER_METADATA,
	type ProviderName,
	type UpdateProviderApiRequest,
} from "@/types/providers";

const editProviderSchema = z.object({
	apiCompatibility: z.enum(["openai", "anthropic", "gemini"]).optional(),
	apiKey: z.string().optional(),
	baseUrl: z.union([z.url(), z.literal("")]).optional(),
	useEndpointOverrides: z.boolean(),
	endpointOverrides: z
		.record(
			z.string(),
			z.object({
				base_url: z.union([z.url(), z.literal("")]).optional(),
			}),
		)
		.optional(),
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
		endpoint_overrides?: Record<EndpointType, EndpointOverride>;
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

	// Auto-detect if existing config has endpoint overrides
	const hasExistingOverrides =
		existingConfig?.endpoint_overrides &&
		Object.keys(existingConfig.endpoint_overrides).length > 0;

	const form = useForm<EditProviderFormValues>({
		resolver: zodResolver(editProviderSchema),
		defaultValues: {
			apiCompatibility: currentCompatibility ?? undefined,
			apiKey: "",
			baseUrl: existingConfig?.base_url || "",
			useEndpointOverrides: hasExistingOverrides || false,
			endpointOverrides: existingConfig?.endpoint_overrides || {},
		},
	});

	const updateProjectProvider = useUpdateProjectProvider();
	const updateOrgProvider = useUpdateOrganizationProvider();

	const useEndpointOverrides = form.watch("useEndpointOverrides");
	const selectedApiCompatibility = form.watch("apiCompatibility");

	// Get available endpoints based on API compatibility
	const availableEndpoints = useMemo(
		() =>
			selectedApiCompatibility
				? API_COMPATIBILITY_METADATA[selectedApiCompatibility]?.endpoints || []
				: existingConfig?.endpoint_types || [],
		[selectedApiCompatibility, existingConfig?.endpoint_types],
	);

	useEffect(() => {
		if (!open) {
			form.reset();
			setShowApiKey(false);
			setShowCompatibilityWarning(false);
		} else {
			const hasExistingOverrides =
				existingConfig?.endpoint_overrides &&
				Object.keys(existingConfig.endpoint_overrides).length > 0;

			const currentCompatibility = existingConfig?.endpoint_types
				? getCompatibilityFromEndpointTypes(existingConfig.endpoint_types)
				: null;

			form.reset({
				apiCompatibility: currentCompatibility ?? undefined,
				apiKey: "",
				baseUrl: existingConfig?.base_url || "",
				useEndpointOverrides: hasExistingOverrides || false,
				endpointOverrides: existingConfig?.endpoint_overrides || {},
			});
		}
	}, [open, existingConfig, form.reset]); // Simplified dependencies

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

		// Include endpoint overrides if enabled
		if (values.useEndpointOverrides) {
			const cleanedOverrides = cleanEndpointOverrides(
				values.endpointOverrides as Record<string, EndpointOverride>,
			);
			data.endpoint_overrides = cleanedOverrides;
		} else {
			// If overrides are disabled, explicitly clear them
			data.endpoint_overrides = undefined;
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
										<Select
											onValueChange={(value) => {
												if (value !== currentCompatibility) {
													setShowCompatibilityWarning(true);
												}
												field.onChange(value);
											}}
											value={field.value || ""}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select API compatibility" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.entries(API_COMPATIBILITY_METADATA).map(
													([key, metadata]) => (
														<SelectItem key={key} value={key}>
															{metadata.label}
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
										{showCompatibilityWarning &&
											field.value !== currentCompatibility && (
												<div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
													<strong>! Warning:</strong> Changing API compatibility
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
									<FormLabel>
										{useEndpointOverrides
											? "Default Base URL (Optional)"
											: "Base URL (Optional)"}
									</FormLabel>
									<FormControl>
										<Input
											type="url"
											placeholder="https://api.example.com"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										{useEndpointOverrides
											? "Fallback for endpoints without custom URL"
											: "Leave empty to use default"}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Endpoint Override Toggle */}
						<div className="rounded-lg border p-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label className="text-base">
										Configure per-endpoint URLs
									</Label>
									<p className="text-muted-foreground text-sm">
										Use different base URLs for each endpoint type
									</p>
								</div>
								<FormField
									control={form.control}
									name="useEndpointOverrides"
									render={({ field }) => (
										<FormControl>
											<div className="flex items-center gap-2">
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<HelpCircle className="h-4 w-4 cursor-help text-muted-foreground" />
														</TooltipTrigger>
														<TooltipContent>
															<p>
																Useful when your provider supports multiple
																compatibility formats like OpenAI, Anthropic, or
																Gemini
															</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</div>
										</FormControl>
									)}
								/>
							</div>
						</div>

						{/* Endpoint Override Fields */}
						{useEndpointOverrides && availableEndpoints.length > 0 && (
							<div className="space-y-4">
								<Separator />
								<div className="space-y-1">
									<Label className="font-medium text-sm">Endpoint URLs</Label>
									<p className="text-muted-foreground text-xs">
										Configure base URLs for each endpoint type. Leave empty to
										use default above.
									</p>
								</div>

								{availableEndpoints.map((endpoint) => (
									<FormField
										key={endpoint}
										control={form.control}
										name={`endpointOverrides.${endpoint}.base_url`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm">
													{endpoint.replace(/_/g, " ")}
												</FormLabel>
												<FormControl>
													<Input
														type="url"
														placeholder="https://api.example.com"
														{...field}
														value={field.value || ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								))}
							</div>
						)}

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
