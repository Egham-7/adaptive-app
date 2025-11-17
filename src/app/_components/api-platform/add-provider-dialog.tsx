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
	type EndpointOverride,
	type EndpointType,
	PROVIDER_ENDPOINT_CONFIG,
	PROVIDER_METADATA,
	type ProviderName,
} from "@/types/providers";

const createProviderSchema = z
	.object({
		provider: z.string().min(1, "Provider is required"),
		apiKey: z.string().optional(),
		baseUrl: z.union([z.string().url(), z.literal("")]).optional(),
		useEndpointOverrides: z.boolean(),
		endpointOverrides: z
			.object({
				chat_completions: z
					.object({
						base_url: z.union([z.string().url(), z.literal("")]).optional(),
					})
					.optional(),
				messages: z
					.object({
						base_url: z.union([z.string().url(), z.literal("")]).optional(),
					})
					.optional(),
				generate: z
					.object({
						base_url: z.union([z.string().url(), z.literal("")]).optional(),
					})
					.optional(),
				count_tokens: z
					.object({
						base_url: z.union([z.string().url(), z.literal("")]).optional(),
					})
					.optional(),
				select_model: z
					.object({
						base_url: z.union([z.string().url(), z.literal("")]).optional(),
					})
					.optional(),
			})
			.optional(),
	})
	.superRefine((data, ctx) => {
		// Validate that provider is a known built-in provider
		if (!PROVIDER_METADATA[data.provider as ProviderName]) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Please select a valid provider",
				path: ["provider"],
			});
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

	const metadata =
		selectedProvider && PROVIDER_METADATA[selectedProvider as ProviderName]
			? PROVIDER_METADATA[selectedProvider as ProviderName]
			: null;

	// Get available endpoints based on provider configuration
	const availableEndpoints = useMemo(() => {
		if (selectedProvider && metadata) {
			return (
				PROVIDER_ENDPOINT_CONFIG[selectedProvider as ProviderName]
					?.supported_endpoints ?? []
			);
		}
		return [];
	}, [selectedProvider, metadata]);

	// Auto-populate endpoint types for built-in providers
	useEffect(() => {
		if (selectedProvider && metadata) {
			// Note: We don't auto-set endpoint_types in form since it's optional and can be inferred
		}
	}, [selectedProvider, metadata]);

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

		// Get supported endpoints for the provider
		const endpointTypes =
			selectedProvider && metadata
				? PROVIDER_ENDPOINT_CONFIG[selectedProvider as ProviderName]
						?.supported_endpoints
				: undefined;

		// Prepare form data for tRPC
		const formData = {
			provider_name: values.provider,
			endpoint_types: endpointTypes,
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
					<form
						id="add-provider-form"
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="provider"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Provider</FormLabel>
									<FormControl>
										<div id="provider-select">
											<Combobox
												options={builtInProviders}
												value={field.value}
												onValueChange={field.onChange}
												placeholder="Select provider..."
												searchPlaceholder="Search providers..."
												emptyText="No provider found."
											/>
										</div>
									</FormControl>
									<FormDescription>
										Select a provider from the list
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="apiKey"
							render={({ field }) => (
								<FormItem>
									<FormLabel>API Key</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												id="api-key-input"
												type={showApiKey ? "text" : "password"}
												placeholder="Enter API key (optional)"
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
										Leave empty to use default configuration
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
									</FormLabel>
									<FormControl>
										<Input
											id="base-url-input"
											type="url"
											placeholder="https://api.example.com"
											disabled={!selectedProvider}
											{...field}
										/>
									</FormControl>
									<FormDescription>
										{useEndpointOverrides
											? "Fallback for endpoints without custom URL"
											: "Leave empty to use default configuration"}
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
							<Button
								id="submit-provider-button"
								type="submit"
								disabled={isLoading || !selectedProvider}
							>
								{isLoading ? "Adding..." : "Add Provider"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
