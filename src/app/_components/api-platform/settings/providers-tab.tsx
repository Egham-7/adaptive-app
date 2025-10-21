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
	useDeleteOrganizationProvider,
	useOrganizationProviders,
	useUpdateOrganizationProvider,
} from "@/hooks/provider-configs";
import { PROVIDER_METADATA, type ProviderName } from "@/types/providers";

interface OrganizationProvidersTabProps {
	organizationId: string;
	isAdmin: boolean;
}

export const OrganizationProvidersTab: React.FC<
	OrganizationProvidersTabProps
> = ({ organizationId, isAdmin }) => {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
	const [loadingProviders, setLoadingProviders] = useState<Set<string>>(
		new Set(),
	);

	const { data: providersData, isLoading } =
		useOrganizationProviders(organizationId);

	console.log("Providers Data: ", providersData);

	const deleteProvider = useDeleteOrganizationProvider({
		onSuccess: () => {
			setDeleteDialogOpen(false);
			setSelectedProvider(null);
		},
	});

	const updateProvider = useUpdateOrganizationProvider();

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
				organizationId,
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
				organizationId,
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
		(acc, config) => {
			acc[config.provider_name] = config;
			return acc;
		},
		{} as Record<string, (typeof providersArray)[0]>,
	);

	const providerNames = providersArray.map((config) => config.provider_name);

	return (
		<ErrorBoundary>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-start justify-between">
					<div>
						<h3 className="font-semibold text-lg">Provider Configurations</h3>
						<p className="text-muted-foreground text-sm">
							Configure API credentials for LLM providers at the organization
							level. These settings apply to all projects unless overridden at
							the project level.
						</p>
						{!isAdmin && (
							<p className="mt-2 text-sm text-yellow-600 dark:text-yellow-500">
								Only organization admins can manage provider configurations.
							</p>
						)}
					</div>
					{isAdmin && (
						<Button onClick={handleConfigureProvider} size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Add Provider
						</Button>
					)}
				</div>

				{/* Provider Grid */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{providerNames.map((providerName) => {
						const config = providersMap[providerName];
						const isConfigured = !!config;

						return (
							<ProviderCard
								key={providerName}
								providerName={providerName}
								isConfigured={isConfigured}
								hasApiKey={config?.has_api_key}
								baseUrl={config?.base_url}
								authorizationHeader={config?.has_authorization_header}
								enabled={config?.enabled}
								source={config?.source}
								level="organization"
								isLoading={loadingProviders.has(providerName)}
								onConfigure={handleConfigureProvider}
								onEdit={
									isAdmin ? () => handleEditProvider(providerName) : undefined
								}
								onDelete={
									isAdmin ? () => handleDeleteProvider(providerName) : undefined
								}
								onToggle={
									isAdmin
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
					level="organization"
					organizationId={organizationId}
				/>

				{/* Edit Provider Dialog */}
				{selectedProvider && (
					<EditProviderDialog
						open={editDialogOpen}
						onOpenChange={setEditDialogOpen}
						providerName={selectedProvider}
						level="organization"
						organizationId={organizationId}
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
								? This action cannot be undone. All projects will fall back to
								default settings unless they have their own configurations.
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
