"use client";

import { Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { CreateProviderDialog } from "@/app/_components/api-platform/create-provider-dialog";
import { EditProviderDialog } from "@/app/_components/api-platform/edit-provider-dialog";
import { ProviderCard } from "@/app/_components/api-platform/provider-card";
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
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
	useDeleteProjectProvider,
	useProjectProviders,
	useUpdateProjectProvider,
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
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
	const [loadingProviders, setLoadingProviders] = useState<Set<string>>(
		new Set(),
	);

	const isAdminOrOwner =
		currentUserRole === "admin" || currentUserRole === "owner";

	const { data: providersData, isLoading } = useProjectProviders(projectId);

	const deleteProvider = useDeleteProjectProvider({
		onSuccess: () => {
			setDeleteDialogOpen(false);
			setSelectedProvider(null);
		},
	});

	const updateProvider = useUpdateProjectProvider();

	const handleConfigureProvider = () => {
		setCreateDialogOpen(true);
	};

	const handleEditProvider = (providerName: string) => {
		setSelectedProvider(providerName);
		setEditDialogOpen(true);
	};

	const handleDeleteProvider = (providerName: string) => {
		setSelectedProvider(providerName);
		setDeleteDialogOpen(true);
	};

	const handleToggleProvider = (providerName: string, enabled: boolean) => {
		setLoadingProviders((prev) => new Set(prev).add(providerName));
		updateProvider.mutate(
			{
				projectId,
				provider: providerName,
				data: { enabled },
			},
			{
				onSettled: () => {
					setLoadingProviders((prev) => {
						const next = new Set(prev);
						next.delete(providerName);
						return next;
					});
				},
			},
		);
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

	const providersArray = providersData?.providers || [];
	const providersMap = providersArray.reduce(
		(
			acc: Record<string, (typeof providersArray)[0]>,
			config: (typeof providersArray)[0],
		) => {
			acc[config.provider_name] = config;
			return acc;
		},
		{} as Record<string, (typeof providersArray)[0]>,
	);

	const providerNames = providersArray.map(
		(config: (typeof providersArray)[0]) => config.provider_name,
	);

	return (
		<ErrorBoundary>
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
						<Button onClick={handleConfigureProvider} size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Add Provider
						</Button>
					)}
				</div>

				{/* Provider Grid */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{providerNames.map((providerName: string) => {
						const config = providersMap[providerName];
						const isConfigured = !!config;
						const isInherited = config?.source === "organization";

						return (
							<ProviderCard
								key={providerName}
								providerName={providerName}
								isConfigured={isConfigured}
								hasApiKey={config?.has_api_key}
								baseUrl={config?.base_url}
								enabled={config?.enabled}
								isInherited={isInherited}
								source={config?.source}
								level="project"
								isLoading={loadingProviders.has(providerName)}
								onConfigure={handleConfigureProvider}
								onEdit={
									isAdminOrOwner && !isInherited
										? () => handleEditProvider(providerName)
										: undefined
								}
								onDelete={
									isAdminOrOwner && !isInherited
										? () => handleDeleteProvider(providerName)
										: undefined
								}
								onToggle={
									isAdminOrOwner && !isInherited
										? (enabled) => handleToggleProvider(providerName, enabled)
										: undefined
								}
							/>
						);
					})}
				</div>

				{/* Create Provider Dialog */}
				<CreateProviderDialog
					open={createDialogOpen}
					onOpenChange={setCreateDialogOpen}
					level="project"
					projectId={projectId}
				/>

				{/* Edit Provider Dialog */}
				{selectedProvider && (
					<EditProviderDialog
						open={editDialogOpen}
						onOpenChange={setEditDialogOpen}
						providerName={selectedProvider}
						level="project"
						projectId={projectId}
						existingConfig={providersMap[selectedProvider]}
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
			</div>
		</ErrorBoundary>
	);
};
