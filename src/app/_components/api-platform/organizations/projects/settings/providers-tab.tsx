"use client";

import { Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { CustomProviderDialog } from "@/app/_components/api-platform/custom-provider-dialog";
import { ProviderCard } from "@/app/_components/api-platform/provider-card";
import { ProviderConfigDialog } from "@/app/_components/api-platform/provider-config-dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	useDeleteProjectProvider,
	useProjectProviders,
} from "@/hooks/provider-configs";
import { PROVIDER_METADATA, type ProviderName } from "@/types/providers";

interface ProjectProvidersTabProps {
	projectId: number;
	organizationId: string;
	currentUserRole?: "owner" | "admin" | "member" | null;
}

export const ProjectProvidersTab: React.FC<ProjectProvidersTabProps> = ({
	projectId,
	organizationId,
	currentUserRole,
}) => {
	const [configDialogOpen, setConfigDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [customProviderDialogOpen, setCustomProviderDialogOpen] =
		useState(false);
	const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
	const [configMode, setConfigMode] = useState<"create" | "edit">("create");

	const isAdminOrOwner =
		currentUserRole === "admin" || currentUserRole === "owner";

	const { data: providersData, isLoading } = useProjectProviders(projectId);

	const deleteProvider = useDeleteProjectProvider({
		onSuccess: () => {
			setDeleteDialogOpen(false);
			setSelectedProvider(null);
		},
	});

	const handleConfigureProvider = (providerName: string) => {
		setSelectedProvider(providerName);
		setConfigMode("create");
		setConfigDialogOpen(true);
	};

	const handleEditProvider = (providerName: string) => {
		setSelectedProvider(providerName);
		const config = providers[providerName];
		setConfigMode(config?.is_preset ? "create" : "edit");
		setConfigDialogOpen(true);
	};

	const handleDeleteProvider = (providerName: string) => {
		setSelectedProvider(providerName);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (selectedProvider) {
			deleteProvider.mutate({
				projectId,
				provider: selectedProvider,
			});
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="text-muted-foreground text-sm">
					Loading provider configurations...
				</div>
			</div>
		);
	}

	const providers = providersData?.providers || {};
	const builtInProviders = Object.keys(PROVIDER_METADATA);
	const customProviders = Object.keys(providers).filter(
		(name) => !PROVIDER_METADATA[name as ProviderName],
	);
	const providerNames = [...builtInProviders, ...customProviders];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div>
					<h3 className="font-semibold text-lg">Provider Configurations</h3>
					<p className="text-muted-foreground text-sm">
						Configure API credentials for LLM providers. Project-level
						configurations override organization-level settings.
					</p>
				</div>
				{isAdminOrOwner && (
					<Button onClick={() => setCustomProviderDialogOpen(true)} size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Add Custom Provider
					</Button>
				)}
			</div>

			{/* Provider Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{providerNames.map((providerName) => {
					const config = providers[providerName];
					const isConfigured = !!config;

					return (
						<ProviderCard
							key={providerName}
							providerName={providerName}
							isConfigured={isConfigured}
							hasApiKey={config?.has_api_key}
							baseUrl={config?.base_url}
							authorizationHeader={config?.authorization_header}
							isPreset={config?.is_preset}
							level="project"
							onConfigure={() => handleConfigureProvider(providerName)}
							onEdit={
								isAdminOrOwner
									? () => handleEditProvider(providerName)
									: undefined
							}
							onDelete={
								isAdminOrOwner
									? () => handleDeleteProvider(providerName)
									: undefined
							}
						/>
					);
				})}
			</div>

			{/* Config Dialog */}
			{selectedProvider && (
				<ProviderConfigDialog
					open={configDialogOpen}
					onOpenChange={setConfigDialogOpen}
					providerName={selectedProvider}
					level="project"
					projectId={projectId}
					mode={configMode}
					existingConfig={
						configMode === "edit" ? providers[selectedProvider] : undefined
					}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Provider Configuration</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete the configuration for{" "}
							{selectedProvider &&
								PROVIDER_METADATA[selectedProvider as ProviderName]
									?.displayName}
							? This action cannot be undone. The project will fall back to
							organization-level or default settings.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-red-600 hover:bg-red-700"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Custom Provider Dialog */}
			<CustomProviderDialog
				open={customProviderDialogOpen}
				onOpenChange={setCustomProviderDialogOpen}
				level="project"
				projectId={projectId}
			/>
		</div>
	);
};
