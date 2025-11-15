"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
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
import { ProviderLogo } from "@/components/ui/provider-logo";
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
	useCreateOrganizationProvider,
	useCreateProjectProvider,
} from "@/hooks/provider-configs";
import { cleanEndpointOverrides } from "@/lib/providers/utils";
import {
	API_COMPATIBILITY_METADATA,
	type ApiCompatibilityType,
	type EndpointOverride,
	type EndpointType,
	PROVIDER_COMPATIBILITY_DEFAULTS,
	PROVIDER_METADATA,
	type ProviderName,
} from "@/types/providers";

const createProviderSchema = z
	.object({
		provider: z.string().min(1, "Provider is required"),
		apiCompatibility: z.enum(["openai", "anthropic", "google-ai-studio"]),
		apiKey: z.string().optional(),
		baseUrl: z.union([z.string().url(), z.literal("")]).optional(),
		useEndpointOverrides: z.boolean(),
		endpointOverrides: z
			.record(
				z.string(),
				z.object({
					base_url: z.union([z.string().url(), z.literal("")]).optional(),
				}),
			)
			.optional(),
	})
	.superRefine((data, ctx) => {
		const isCustomProvider = !PROVIDER_METADATA[data.provider as ProviderName];
		if (isCustomProvider) {
			if (!/^[a-z0-9-]+$/.test(data.provider)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Only lowercase letters, numbers, and hyphens allowed",
					path: ["provider"],
				});
			}
			// Custom providers require both API key and BaseURL (if not using overrides)
			if (!data.apiKey || data.apiKey.trim() === "") {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "API key is required for custom providers",
					path: ["apiKey"],
				});
			}
			if (!data.useEndpointOverrides) {
				if (!data.baseUrl || data.baseUrl.trim() === "") {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Base URL is required for custom providers",
						path: ["baseUrl"],
					});
				}
			}
		}

		// Validate endpoint overrides if enabled
		if (data.useEndpointOverrides) {
			const hasAtLeastOneOverride =
				data.endpointOverrides &&
				Object.values(data.endpointOverrides).some(
					(override) => override.base_url && override.base_url.trim() !== "",
				);
			const hasDefaultUrl = data.baseUrl && data.baseUrl.trim() !== "";

			if (!hasAtLeastOneOverride && !hasDefaultUrl) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Provide at least one endpoint URL or a default base URL",
					path: ["baseUrl"],
				});
			}
		}
	});

type AddProviderFormValues = z.infer<typeof createProviderSchema>;

interface AddProviderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	level: "project" | "organization";
	projectId?: number;
	organizationId?: string;
	configuredProviders?: string[];
	onSuccess?: () => void;
}

export function AddProviderDialog({
	open,
	onOpenChange,
	level,
	projectId,
	organizationId,
	configuredProviders = [],
	onSuccess,
}: AddProviderDialogProps) {
	const [showApiKey, setShowApiKey] = useState(false);

	const form = useForm<AddProviderFormValues>({
		resolver: zodResolver(createProviderSchema),
		defaultValues: {
			provider: "",
			apiCompatibility: "openai", // Default to OpenAI-compatible
			apiKey: "",
			baseUrl: "",
			useEndpointOverrides: false,
			endpointOverrides: {},
		},
	});

	const createProjectProvider = useCreateProjectProvider();
	const createOrgProvider = useCreateOrganizationProvider();

	const isLoading =
		createProjectProvider.isPending || createOrgProvider.isPending;

	const builtInProviders: ComboboxOption[] = useMemo(
		() =>
			Object.entries(PROVIDER_METADATA)
				.filter(([key]) => {
					const isConfigured = configuredProviders.includes(key);
					return !isConfigured;
				})
				.map(([key, metadata]) => ({
					value: key,
					label: metadata.displayName,
					icon: (
						<ProviderLogo
							provider={key}
							width={16}
							height={16}
							className="rounded"
						/>
					),
				})),
		[configuredProviders],
	);

	const selectedProvider = form.watch("provider");
	const useEndpointOverrides = form.watch("useEndpointOverrides");
	const apiCompatibility = form.watch("apiCompatibility");

	const metadata =
		selectedProvider && PROVIDER_METADATA[selectedProvider as ProviderName]
			? PROVIDER_METADATA[selectedProvider as ProviderName]
			: null;

	const isCustomProvider = selectedProvider && !metadata;

	// Get available endpoints based on API compatibility
	const availableEndpoints = useMemo(
		() => API_COMPATIBILITY_METADATA[apiCompatibility]?.endpoints || [],
		[apiCompatibility],
	);

	// Auto-select API compatibility for built-in providers
	useEffect(() => {
		if (selectedProvider && !isCustomProvider) {
			const defaultCompatibility =
				PROVIDER_COMPATIBILITY_DEFAULTS[selectedProvider as ProviderName];
			if (defaultCompatibility) {
				form.setValue("apiCompatibility", defaultCompatibility);
			}
		}
	}, [selectedProvider, isCustomProvider, form]);

	useEffect(() => {
		if (!open) {
			form.reset();
			setShowApiKey(false);
		}
	}, [open, form.reset]); // Removed form from dependencies to prevent unnecessary re-renders

	const onSubmit = (values: AddProviderFormValues) => {
		// Clean endpoint overrides (remove empty entries)
		const cleanedOverrides = values.useEndpointOverrides
			? cleanEndpointOverrides(
					values.endpointOverrides as Record<string, EndpointOverride>,
				)
			: undefined;

		// Prepare form data for tRPC
		const formData = {
			provider_name: values.provider,
			api_compatibility: values.apiCompatibility,
			api_key: values.apiKey || undefined,
			base_url: values.baseUrl,
			endpoint_overrides: cleanedOverrides,
		};

		if (level === "project" && projectId) {
			createProjectProvider.mutate(
				{ projectId, provider: values.provider, data: formData },
				{
					onSuccess: () => {
						onOpenChange(false);
						onSuccess?.();
					},
				},
			);
		} else if (level === "organization" && organizationId) {
			createOrgProvider.mutate(
				{ organizationId, provider: values.provider, data: formData },
				{
					onSuccess: () => {
						onOpenChange(false);
						onSuccess?.();
					},
				},
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<ProviderLogo
							provider={selectedProvider}
							width={32}
							height={32}
							className="rounded-lg"
							alt={`${metadata?.displayName || selectedProvider} logo`}
						/>
						<div>
							<DialogTitle>Add Provider</DialogTitle>
							<DialogDescription>
								{level === "project"
									? "Add a provider to this project"
									: "Add a provider to this organization"}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="provider"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Provider</FormLabel>
									<FormControl>
										<Combobox
											options={builtInProviders}
											value={field.value}
											onValueChange={field.onChange}
											placeholder="Select or type provider name..."
											searchPlaceholder="Search providers..."
											emptyText="No provider found."
											allowCustomValue={true}
											customValuePattern={/^[a-z0-9-]+$/}
											customValueError="Only lowercase letters, numbers, and hyphens allowed"
										/>
									</FormControl>
									<FormDescription>
										{isCustomProvider
											? "Custom provider name (lowercase letters, numbers, hyphens)"
											: "Select a built-in provider or type a custom name"}
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
										<FormLabel>
											API Compatibility <span className="text-red-500">*</span>
										</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
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
										<FormDescription>
											{field.value &&
												API_COMPATIBILITY_METADATA[
													field.value as ApiCompatibilityType
												]?.description}
											<br />
											<span className="text-muted-foreground text-xs">
												Examples:{" "}
												{field.value &&
													API_COMPATIBILITY_METADATA[
														field.value as ApiCompatibilityType
													]?.examples.join(", ")}
											</span>
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<FormField
							control={form.control}
							name="apiKey"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										API Key
										{isCustomProvider && (
											<span className="text-red-500"> *</span>
										)}
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showApiKey ? "text" : "password"}
												placeholder={
													isCustomProvider
														? "Enter API key (required)"
														: "Enter API key (optional)"
												}
												disabled={!selectedProvider}
												className="pr-10"
												{...field}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowApiKey(!showApiKey)}
												disabled={!selectedProvider}
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
										{isCustomProvider
											? "API key is required for custom providers"
											: "Leave empty to use YAML config default"}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="baseUrl"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{useEndpointOverrides
											? "Default Base URL (Optional)"
											: "Base URL"}
										{isCustomProvider && !useEndpointOverrides && (
											<span className="text-red-500"> *</span>
										)}
									</FormLabel>
									<FormControl>
										<Input
											type="url"
											placeholder="https://api.example.com"
											disabled={!selectedProvider}
											{...field}
										/>
									</FormControl>
									<FormDescription>
										{useEndpointOverrides
											? "Fallback for endpoints without custom URL"
											: isCustomProvider
												? "Base URL is required for custom providers"
												: "Leave empty to use YAML config default"}
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
													disabled={!selectedProvider}
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
						{useEndpointOverrides && selectedProvider && (
							<div className="space-y-4">
								<Separator />
								<div className="space-y-1">
									<Label className="font-medium text-sm">Endpoint URLs</Label>
									<p className="text-muted-foreground text-xs">
										Configure base URLs for each endpoint type. Leave empty to
										use default above.
									</p>
								</div>

								{availableEndpoints.map((endpoint: EndpointType) => (
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
							<Button type="submit" disabled={isLoading || !selectedProvider}>
								{isLoading ? "Adding..." : "Add Provider"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
