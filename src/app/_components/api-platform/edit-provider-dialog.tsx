"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
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
	useUpdateOrganizationProvider,
	useUpdateProjectProvider,
} from "@/hooks/provider-configs";
import { cleanEndpointOverrides } from "@/lib/providers/utils";
import {
	type EndpointOverride,
	type EndpointType,
	PROVIDER_ENDPOINT_CONFIG,
	PROVIDER_METADATA,
	type ProviderName,
	type UpdateProviderApiRequest,
} from "@/types/providers";

const editProviderSchema = z.object({
	apiKey: z.string().optional(),
	baseUrl: z.union([z.url(), z.literal("")]).optional(),
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
		endpoint_overrides?: Partial<Record<EndpointType, EndpointOverride>>;
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
	const [showApiKey, setShowApiKey] = useState(false);

	// Auto-detect if existing config has endpoint overrides
	const hasExistingOverrides =
		existingConfig?.endpoint_overrides &&
		Object.keys(existingConfig.endpoint_overrides).length > 0;

	const form = useForm<EditProviderFormValues>({
		resolver: zodResolver(editProviderSchema),
		defaultValues: {
			apiKey: "",
			baseUrl: existingConfig?.base_url || "",
			useEndpointOverrides: hasExistingOverrides || false,
			endpointOverrides: existingConfig?.endpoint_overrides || {},
		},
	});

	const updateProjectProvider = useUpdateProjectProvider();
	const updateOrgProvider = useUpdateOrganizationProvider();

	const useEndpointOverrides = form.watch("useEndpointOverrides");

	// Get available endpoints based on provider configuration
	const availableEndpoints = useMemo(() => {
		if (metadata) {
			return (
				PROVIDER_ENDPOINT_CONFIG[providerName as ProviderName]
					?.supported_endpoints ?? []
			);
		}
		return existingConfig?.endpoint_types || [];
	}, [metadata, providerName, existingConfig?.endpoint_types]);

	useEffect(() => {
		if (!open) {
			form.reset();
			setShowApiKey(false);
		} else {
			form.reset({
				apiKey: "",
				baseUrl: existingConfig?.base_url || "",
				useEndpointOverrides: hasExistingOverrides || false,
				endpointOverrides: existingConfig?.endpoint_overrides || {},
			});
		}
	}, [open, existingConfig, form.reset, hasExistingOverrides]); // Simplified dependencies

	const onSubmit = (values: EditProviderFormValues) => {
		const data: UpdateProviderApiRequest = {
			...(values.apiKey?.trim() && { api_key: values.apiKey.trim() }),
			...(values.baseUrl?.trim() && { base_url: values.baseUrl.trim() }),
		};

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
						<ProviderLogo
							provider={providerName}
							width={32}
							height={32}
							className="rounded-lg"
							alt={`${metadata?.displayName || providerName} logo`}
						/>
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
