"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, History, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAdaptiveConfigHistory } from "@/hooks/audit/use-adaptive-config-history";
import { api } from "@/trpc/react";
import { updateAdaptiveConfigSchema } from "@/types/adaptive-config";
import { AuditLogDrawer } from "../audit/audit-log-drawer";

interface AdaptiveConfigTabProps {
	organizationId: string;
	isAdmin: boolean;
}

/**
 * AdaptiveConfigTab - Organization-level adaptive configuration management
 *
 * Features:
 * - Accordion layout for Model Router and Fallback configs
 * - Enabled toggle
 * - View history button with audit drawer
 * - Admin-only editing
 */
export function AdaptiveConfigTab({
	organizationId,
	isAdmin,
}: AdaptiveConfigTabProps) {
	const [showHistory, setShowHistory] = useState(false);

	// Fetch organization adaptive config
	const {
		data: config,
		isLoading,
		error,
	} = api.adaptiveConfig.getOrganizationAdaptiveConfig.useQuery(
		{ organizationId },
		{ enabled: !!organizationId },
	);

	// Fetch history
	const {
		data: historyData,
		isLoading: historyLoading,
		error: historyError,
	} = useAdaptiveConfigHistory(config?.id ?? null);

	const utils = api.useUtils();

	// Determine if we should create or update based on config source
	const isYamlConfig = config?.source === "yaml";

	// Create mutation (for yaml configs that don't exist in DB)
	const createMutation =
		api.adaptiveConfig.createOrganizationAdaptiveConfig.useMutation({
			onSuccess: () => {
				// Refetch config
				utils.adaptiveConfig.getOrganizationAdaptiveConfig.invalidate({
					organizationId,
				});
			},
		});

	// Update mutation (for existing DB configs)
	const updateMutation =
		api.adaptiveConfig.updateOrganizationAdaptiveConfig.useMutation({
			onSuccess: () => {
				// Refetch config
				utils.adaptiveConfig.getOrganizationAdaptiveConfig.invalidate({
					organizationId,
				});
			},
		});

	// Form state
	const form = useForm({
		resolver: zodResolver(updateAdaptiveConfigSchema),
		defaultValues: {
			model_router_config: {
				cache: {
					capacity: config?.model_router_config?.cache?.capacity,
					enabled: config?.model_router_config?.cache?.enabled ?? false,
					semantic_threshold:
						config?.model_router_config?.cache?.semantic_threshold,
				},
				cost_bias: config?.model_router_config?.cost_bias,
			},
			fallback_config: {
				mode: config?.fallback_config?.mode ?? "sequential",
				timeout_ms: config?.fallback_config?.timeout_ms,
				max_retries: config?.fallback_config?.max_retries,
			},
		},
	});

	// Handle save - use create for yaml configs, update for db configs
	const onSubmit = form.handleSubmit((data) => {
		if (!isAdmin) return;

		if (isYamlConfig) {
			// Create new config in database
			createMutation.mutate({ organizationId, data });
		} else {
			// Update existing config
			updateMutation.mutate({ organizationId, data });
		}
	});

	// Handle reset
	const handleReset = () => {
		form.reset();
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="h-10 animate-pulse rounded bg-muted" />
				<div className="h-64 animate-pulse rounded bg-muted" />
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Failed to load adaptive configuration: {error.message}
				</AlertDescription>
			</Alert>
		);
	}

	// No config exists
	if (!config) {
		return (
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					No adaptive configuration found for this organization.
					{isAdmin && " Create one to get started."}
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h2 className="font-bold text-2xl">Adaptive Configuration</h2>
					<p className="text-muted-foreground text-sm">
						Configure model routing and fallback behavior at the organization
						level
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Badge
						variant={isYamlConfig ? "outline" : "secondary"}
						className="capitalize"
					>
						{isYamlConfig ? "Default" : config.source || "api"}
					</Badge>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowHistory(true)}
						className="gap-2"
					>
						<History className="h-4 w-4" />
						View History
					</Button>
				</div>
			</div>

			{/* YAML Config Warning */}
			{isYamlConfig && isAdmin && (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						You are viewing default configuration values from YAML. To customize
						and persist these settings to the database, make your changes and
						click "Save Configuration".
					</AlertDescription>
				</Alert>
			)}

			{/* Admin warning */}
			{!isAdmin && (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Only organization admins can modify adaptive configuration
					</AlertDescription>
				</Alert>
			)}

			<form onSubmit={onSubmit} className="space-y-6">
				{/* Configuration Accordion */}
				<Accordion
					type="multiple"
					defaultValue={["model-router", "fallback"]}
					className="space-y-4"
				>
					{/* Model Router Config */}
					<AccordionItem
						value="model-router"
						className="rounded-lg border px-4"
					>
						<AccordionTrigger className="hover:no-underline">
							<div className="flex items-center gap-2">
								<span className="font-semibold">
									Model Router Configuration
								</span>
								{config.model_router_config && (
									<Badge variant="outline">
										{isYamlConfig ? "Default" : "Configured"}
									</Badge>
								)}
							</div>
						</AccordionTrigger>
						<AccordionContent className="space-y-4 pt-4">
							{/* Cache Settings */}
							<div className="space-y-4 rounded-lg bg-muted/50 p-4">
								<h4 className="font-medium">Cache Settings</h4>

								<div className="flex items-center justify-between">
									<Label htmlFor="cache-enabled">Enable Caching</Label>
									<Switch
										id="cache-enabled"
										checked={form.watch("model_router_config.cache.enabled")}
										onCheckedChange={(checked) =>
											form.setValue(
												"model_router_config.cache.enabled",
												checked,
											)
										}
										disabled={!isAdmin}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="cache-capacity">Cache Capacity</Label>
									<Input
										id="cache-capacity"
										type="number"
										placeholder="1000"
										{...form.register("model_router_config.cache.capacity", {
											valueAsNumber: true,
										})}
										disabled={!isAdmin}
									/>
									<p className="text-muted-foreground text-xs">
										Maximum number of cached items
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="semantic-threshold">Semantic Threshold</Label>
									<Input
										id="semantic-threshold"
										type="number"
										step="0.01"
										placeholder="0.95"
										{...form.register(
											"model_router_config.cache.semantic_threshold",
											{
												valueAsNumber: true,
											},
										)}
										disabled={!isAdmin}
									/>
									<p className="text-muted-foreground text-xs">
										Similarity threshold for semantic caching (0-1)
									</p>
								</div>
							</div>

							{/* Cost Bias */}
							<div className="space-y-2">
								<Label htmlFor="cost-bias">Cost Bias</Label>
								<Input
									id="cost-bias"
									type="number"
									step="0.1"
									placeholder="0.5"
									{...form.register("model_router_config.cost_bias", {
										valueAsNumber: true,
									})}
									disabled={!isAdmin}
								/>
								<p className="text-muted-foreground text-xs">
									Weight for cost vs performance in routing decisions (0-1)
								</p>
							</div>
						</AccordionContent>
					</AccordionItem>

					{/* Fallback Config */}
					<AccordionItem value="fallback" className="rounded-lg border px-4">
						<AccordionTrigger className="hover:no-underline">
							<div className="flex items-center gap-2">
								<span className="font-semibold">Fallback Configuration</span>
								{config.fallback_config && (
									<Badge variant="outline">
										{isYamlConfig ? "Default" : "Configured"}
									</Badge>
								)}
							</div>
						</AccordionTrigger>
						<AccordionContent className="space-y-4 pt-4">
							<div className="space-y-2">
								<Label htmlFor="fallback-mode">Fallback Mode</Label>
								<Select
									value={form.watch("fallback_config.mode")}
									onValueChange={(value) =>
										form.setValue(
											"fallback_config.mode",
											value as "sequential" | "race",
										)
									}
									disabled={!isAdmin}
								>
									<SelectTrigger id="fallback-mode">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="sequential">Sequential</SelectItem>
										<SelectItem value="race">Race</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-muted-foreground text-xs">
									Sequential: Try providers one by one. Race: Try all
									simultaneously
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="timeout">Timeout (ms)</Label>
								<Input
									id="timeout"
									type="number"
									placeholder="30000"
									{...form.register("fallback_config.timeout_ms", {
										valueAsNumber: true,
									})}
									disabled={!isAdmin}
								/>
								<p className="text-muted-foreground text-xs">
									Maximum time to wait for a provider response
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="max-retries">Max Retries</Label>
								<Input
									id="max-retries"
									type="number"
									placeholder="3"
									{...form.register("fallback_config.max_retries", {
										valueAsNumber: true,
									})}
									disabled={!isAdmin}
								/>
								<p className="text-muted-foreground text-xs">
									Maximum number of retry attempts per provider
								</p>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>

				{/* Action Buttons */}
				{isAdmin && (
					<div className="flex items-center justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={handleReset}
							disabled={!form.formState.isDirty}
							className="gap-2"
						>
							<RotateCcw className="h-4 w-4" />
							Reset
						</Button>
						<Button
							type="submit"
							disabled={createMutation.isPending || updateMutation.isPending}
							className="gap-2"
						>
							<Save className="h-4 w-4" />
							{createMutation.isPending || updateMutation.isPending
								? "Saving..."
								: "Save Configuration"}
						</Button>
					</div>
				)}

				{/* Success/Error Messages */}
				{(createMutation.isSuccess || updateMutation.isSuccess) && (
					<Alert className="border-green-200 bg-green-50 text-green-900">
						<AlertDescription>
							Configuration {isYamlConfig ? "created" : "updated"} successfully!
						</AlertDescription>
					</Alert>
				)}
				{(createMutation.isError || updateMutation.isError) && (
					<Alert variant="destructive">
						<AlertDescription>
							Failed to {isYamlConfig ? "create" : "update"} configuration:{" "}
							{createMutation.error?.message || updateMutation.error?.message}
						</AlertDescription>
					</Alert>
				)}
			</form>

			{/* Audit History Drawer */}
			<AuditLogDrawer
				open={showHistory}
				onOpenChange={setShowHistory}
				title="Adaptive Configuration History"
				description="View all changes made to this configuration"
				historyData={historyData}
				isLoading={historyLoading}
				error={historyError}
				entityType="adaptive_config"
			/>
		</div>
	);
}
