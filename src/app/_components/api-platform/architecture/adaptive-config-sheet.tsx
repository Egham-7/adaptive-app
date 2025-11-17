"use client";

import { History, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { SocialLogo } from "@/components/ui/social-logo";
import { Switch } from "@/components/ui/switch";
import { useDeleteProjectAdaptiveConfig } from "@/hooks/adaptive-config";
import { useAdaptiveConfigForm } from "@/hooks/adaptive-config/use-adaptive-config-form";
import type { AdaptiveConfigApiResponse } from "@/types/adaptive-config";

interface AdaptiveConfigSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: number;
	existingConfig?: AdaptiveConfigApiResponse | null;
	onSaveSuccess?: () => void;
	onHistoryClick?: () => void;
}

export function AdaptiveConfigSheet({
	open,
	onOpenChange,
	projectId,
	existingConfig,
	onSaveSuccess,
	onHistoryClick,
}: AdaptiveConfigSheetProps) {
	console.log("Existing Config:", existingConfig);
	const isConfigured = !!existingConfig;
	const [showConfigForm, setShowConfigForm] = useState(isConfigured);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	useEffect(() => {
		if (open) {
			setShowConfigForm(isConfigured);
			setShowDeleteConfirm(false);
		}
	}, [open, isConfigured]);

	const deleteAdaptiveConfig = useDeleteProjectAdaptiveConfig();

	const { form, onSubmit, isLoading, isSuccess } = useAdaptiveConfigForm({
		projectId,
		existingConfig,
		onSuccess: () => {
			onOpenChange(false);
			onSaveSuccess?.();
		},
	});

	const handleDelete = async () => {
		if (!existingConfig) return;

		try {
			await deleteAdaptiveConfig.mutateAsync({
				projectId,
			});
			onOpenChange(false);
			onSaveSuccess?.();
		} catch (error) {
			console.error("Failed to delete adaptive config:", error);
		}
	};

	const handleConfigure = () => {
		setShowConfigForm(true);
	};

	const isFormReadOnly = false;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="overflow-y-auto sm:max-w-[500px]">
				<SheetHeader className="px-6 pt-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center">
								<SocialLogo width={32} height={32} className="rounded" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<SheetTitle>Adaptive Proxy Configuration</SheetTitle>
									<Badge variant="default">Project</Badge>
								</div>
								<SheetDescription>
									Intelligent routing and fallback settings
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

				{isConfigured && (
					<div className="px-6 pt-4">
						{!showDeleteConfirm ? (
							<Button
								onClick={() => setShowDeleteConfirm(true)}
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
										disabled={deleteAdaptiveConfig.isPending}
									>
										{deleteAdaptiveConfig.isPending
											? "Deleting..."
											: "Confirm Delete"}
									</Button>
									<Button
										onClick={() => setShowDeleteConfirm(false)}
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

				{!showConfigForm && !isConfigured && (
					<div className="mt-6 space-y-6 px-6">
						<div>
							<h4 className="mb-2 font-medium text-sm">About Adaptive Proxy</h4>
							<p className="text-muted-foreground text-sm">
								Configure intelligent model selection, fallback strategies, and
								server settings for optimal cost and performance.
							</p>
						</div>

						<div className="rounded-lg bg-muted/50 p-4">
							<h4 className="mb-2 font-medium text-sm">Configuration</h4>
							<p className="mb-4 text-muted-foreground text-sm">
								Set up adaptive routing with cost optimization, semantic
								caching, and automatic fallback handling.
							</p>
							<Button onClick={handleConfigure} className="w-full">
								Configure Adaptive Settings
							</Button>
						</div>
					</div>
				)}

				{showConfigForm && (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="mt-6 space-y-8 px-6 pb-6"
						>
							{/* Model Router Section */}
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-base">Model Router</h3>
									<p className="text-muted-foreground text-sm">
										Configure intelligent model selection and caching
									</p>
								</div>

								<FormField
									control={form.control}
									name="model_router_config.cost_bias"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Cost Bias</FormLabel>
											<FormControl>
												<div className="space-y-2">
													<Slider
														min={0}
														max={1}
														step={0.1}
														value={[field.value ?? 0.5]}
														onValueChange={(value) => field.onChange(value[0])}
														disabled={isFormReadOnly}
													/>
													<div className="flex justify-between text-muted-foreground text-xs">
														<span>Cheapest (0.0)</span>
														<span className="font-medium">
															{field.value?.toFixed(1) ?? "0.5"}
														</span>
														<span>Best Performance (1.0)</span>
													</div>
												</div>
											</FormControl>
											<FormDescription>
												Balance between cost and performance (0 = cheapest, 1 =
												best)
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="model_router_config.cache.enabled"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">
													Enable Caching
												</FormLabel>
												<FormDescription>
													Cache model selection for similar prompts
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
													disabled={isFormReadOnly}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								{form.watch("model_router_config.cache.enabled") && (
									<FormField
										control={form.control}
										name="model_router_config.cache.semantic_threshold"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Semantic Similarity Threshold</FormLabel>
												<FormControl>
													<div className="space-y-2">
														<Slider
															min={0}
															max={1}
															step={0.05}
															value={[field.value ?? 0.95]}
															onValueChange={(value) =>
																field.onChange(value[0])
															}
															disabled={isFormReadOnly}
														/>
														<div className="flex justify-between text-muted-foreground text-xs">
															<span>Less Similar (0.0)</span>
															<span className="font-medium">
																{field.value?.toFixed(2) ?? "0.95"}
															</span>
															<span>Exact Match (1.0)</span>
														</div>
													</div>
												</FormControl>
												<FormDescription>
													Minimum similarity score for cache hits
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
							</div>

							{/* Fallback Section */}
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-base">Fallback</h3>
									<p className="text-muted-foreground text-sm">
										Configure retry and failure handling strategies
									</p>
								</div>

								<FormField
									control={form.control}
									name="fallback_config.mode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Fallback Mode</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
												disabled={isFormReadOnly}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select fallback mode" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="sequential">
														Sequential (try providers in order)
													</SelectItem>
													<SelectItem value="race">
														Race (fastest response wins)
													</SelectItem>
												</SelectContent>
											</Select>
											<FormDescription>
												Strategy for handling provider failures
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="fallback_config.timeout_ms"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Timeout (ms)</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="30000"
													min={1000}
													max={300000}
													{...field}
													onChange={(e) =>
														field.onChange(Number(e.target.value))
													}
													disabled={isFormReadOnly}
												/>
											</FormControl>
											<FormDescription>
												Request timeout in milliseconds (1s-5min)
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="fallback_config.max_retries"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Max Retries</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="2"
													min={0}
													max={10}
													{...field}
													onChange={(e) =>
														field.onChange(Number(e.target.value))
													}
													disabled={isFormReadOnly}
												/>
											</FormControl>
											<FormDescription>
												Maximum number of retry attempts (0-10)
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{isConfigured && (
								<FormField
									control={form.control}
									name="enabled"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">
													Configuration Enabled
												</FormLabel>
												<FormDescription>
													Enable or disable this configuration
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
													disabled={isFormReadOnly}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							)}

							{!isFormReadOnly && (
								<div className="flex gap-2 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => onOpenChange(false)}
										className="flex-1"
									>
										Cancel
									</Button>
									<Button type="submit" disabled={isLoading} className="flex-1">
										{isLoading
											? "Saving..."
											: isSuccess
												? "Saved!"
												: isConfigured
													? "Update Configuration"
													: "Create Configuration"}
									</Button>
								</div>
							)}
						</form>
					</Form>
				)}
			</SheetContent>
		</Sheet>
	);
}
