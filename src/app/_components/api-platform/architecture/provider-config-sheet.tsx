"use client";

import { Eye, EyeOff, HelpCircle, History, Info, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeleteProjectProvider } from "@/hooks/provider-configs";
import { useProviderConfigForm } from "@/hooks/provider-configs/use-provider-config-form";
import {
	PROVIDER_ENDPOINT_CONFIG,
	PROVIDER_METADATA,
	type ProviderConfigApiResponse,
	type ProviderName,
} from "@/types/providers";

interface ProviderConfigSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	providerName: string;
	isCustom: boolean;
	projectId: number;
	existingConfig?: ProviderConfigApiResponse;
	onHistoryClick?: () => void;
}

export function ProviderConfigSheet({
	open,
	onOpenChange,
	providerName,
	isCustom,
	projectId,
	existingConfig,
	onHistoryClick,
}: ProviderConfigSheetProps) {
	const [uiState, setUiState] = useState({
		showConfigForm: !!existingConfig,
		showApiKey: false,
		showDeleteConfirm: false,
	});

	useEffect(() => {
		if (open) {
			setUiState((prev) => ({
				...prev,
				showConfigForm: !!existingConfig,
				showApiKey: false,
				showDeleteConfirm: false,
			}));
		}
	}, [open, existingConfig]);

	const metadata = !isCustom
		? PROVIDER_METADATA[providerName as ProviderName]
		: null;

	const deleteProjectProvider = useDeleteProjectProvider();

	const { form, onSubmit, isLoading, isSuccess } = useProviderConfigForm({
		providerName,
		isCustom,
		projectId,
		existingConfig,
		onSuccess: () => {
			onOpenChange(false);
		},
	});

	const { isDirty, isValid } = form.formState;
	const displayName = metadata?.displayName ?? providerName;

	// Watch form state for endpoint overrides
	const useEndpointOverrides = form.watch("useEndpointOverrides");

	// Get available endpoints based on provider configuration
	const availableEndpoints = useMemo(() => {
		if (!isCustom && metadata) {
			// For built-in providers, use the configured supported endpoints
			return (
				PROVIDER_ENDPOINT_CONFIG[providerName as ProviderName]
					?.supported_endpoints ?? []
			);
		}
		// For custom providers, use existing config or empty array
		return existingConfig?.endpoint_types ?? [];
	}, [isCustom, metadata, providerName, existingConfig?.endpoint_types]);

	const handleDelete = useCallback(async () => {
		if (!existingConfig) return;

		try {
			await deleteProjectProvider.mutateAsync({
				projectId,
				provider: providerName,
			});
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete provider config:", error);
		}
	}, [
		existingConfig,
		deleteProjectProvider,
		projectId,
		providerName,
		onOpenChange,
	]);

	const _handleConfigure = useCallback(() => {
		setUiState((prev) => ({ ...prev, showConfigForm: true }));
	}, []);

	const saveState = isLoading ? "loading" : isSuccess ? "success" : "initial";

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="overflow-y-auto sm:max-w-[500px]">
				<SheetHeader className="px-6 pt-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<ProviderLogo
								provider={providerName}
								width={32}
								height={32}
								className="rounded"
								alt={metadata?.displayName || providerName}
							/>
							<div>
								<SheetTitle>{displayName}</SheetTitle>
								<SheetDescription>
									{isCustom ? "Custom Provider" : metadata?.description}
								</SheetDescription>
							</div>
						</div>
						{onHistoryClick && (
							<Button
								variant="ghost"
								size="icon"
								onClick={onHistoryClick}
								className="h-9 w-9"
							>
								<History className="h-4 w-4" />
							</Button>
						)}
					</div>
				</SheetHeader>
				{existingConfig && (
					<div className="px-6 pt-4">
						{!uiState.showDeleteConfirm ? (
							<Button
								onClick={() =>
									setUiState((prev) => ({ ...prev, showDeleteConfirm: true }))
								}
								variant="outline"
								size="sm"
								className="w-full text-destructive hover:bg-destructive/10"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Configuration
							</Button>
						) : (
							<div className="space-y-2">
								<p className="text-center text-muted-foreground text-sm">
									Are you sure you want to delete this configuration?
								</p>
								<div className="flex gap-2">
									<Button
										onClick={handleDelete}
										variant="destructive"
										size="sm"
										className="flex-1"
										disabled={deleteProjectProvider.isPending}
									>
										{deleteProjectProvider.isPending
											? "Deleting..."
											: "Confirm Delete"}
									</Button>
									<Button
										onClick={() =>
											setUiState((prev) => ({
												...prev,
												showDeleteConfirm: false,
											}))
										}
										variant="outline"
										size="sm"
										className="flex-1"
									>
										Cancel
									</Button>
								</div>
							</div>
						)}
					</div>
				)}

				{uiState.showConfigForm && (
					<Form {...form}>
						<TooltipProvider>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="mt-6 space-y-6 px-6"
							>
								<FormField
									control={form.control}
									name="apiKey"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												<div className="flex items-center gap-1.5">
													<span>API Key</span>
													{!isCustom && (
														<Tooltip>
															<TooltipTrigger asChild>
																<Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
															</TooltipTrigger>
															<TooltipContent>
																<p className="max-w-xs">
																	If not filled for built-in providers, Adaptive
																	will use our managed API keys automatically
																</p>
															</TooltipContent>
														</Tooltip>
													)}
												</div>
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														{...field}
														type={uiState.showApiKey ? "text" : "password"}
														placeholder="Enter new API key to update"
														autoComplete="off"
													/>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
														onClick={() =>
															setUiState((prev) => ({
																...prev,
																showApiKey: !prev.showApiKey,
															}))
														}
													>
														{uiState.showApiKey ? (
															<EyeOff className="h-4 w-4" />
														) : (
															<Eye className="h-4 w-4" />
														)}
													</Button>
												</div>
											</FormControl>
											<FormDescription>
												Leave empty to keep existing API key
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
												<div className="flex items-center gap-1.5">
													<span>
														{useEndpointOverrides
															? "Default Base URL (Optional)"
															: "Base URL"}
													</span>
													{!isCustom && (
														<Tooltip>
															<TooltipTrigger asChild>
																<Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
															</TooltipTrigger>
															<TooltipContent>
																<p className="max-w-xs">
																	If not filled for built-in providers, Adaptive
																	will use our default API endpoints
																	automatically
																</p>
															</TooltipContent>
														</Tooltip>
													)}
												</div>
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="https://api.example.com/v1"
												/>
											</FormControl>
											<FormDescription>
												{useEndpointOverrides
													? "Fallback for endpoints without custom URL"
													: "Custom API endpoint URL (optional)"}
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
																		compatibility formats like OpenAI,
																		Anthropic, or Gemini
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
											<Label className="font-medium text-sm">
												Endpoint URLs
											</Label>
											<p className="text-muted-foreground text-xs">
												Configure base URLs for each endpoint type. Leave empty
												to use default above.
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

								<div className="flex gap-2 pt-4">
									<Button
										type="button"
										variant="outline"
										className="flex-1"
										onClick={() => form.reset()}
										disabled={!isDirty || isLoading}
									>
										Reset
									</Button>
									<Button
										type="submit"
										className="flex-1"
										disabled={!isValid || isLoading}
									>
										{saveState === "loading"
											? "Saving..."
											: saveState === "success"
												? "Saved!"
												: "Update"}
									</Button>
								</div>
							</form>
						</TooltipProvider>
					</Form>
				)}
			</SheetContent>
		</Sheet>
	);
}
