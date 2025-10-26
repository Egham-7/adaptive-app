"use client";

import { Check, Edit, History, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Switch } from "@/components/ui/switch";
import { PROVIDER_METADATA, type ProviderName } from "@/types/providers";

interface ProviderCardProps {
	providerName: string;
	isConfigured: boolean;
	hasApiKey?: boolean;
	baseUrl?: string;
	isInherited?: boolean;
	source?: "project" | "organization";
	enabled?: boolean;
	isLoading?: boolean;
	onConfigure: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
	onToggle?: (enabled: boolean) => void;
	onViewHistory?: () => void;
	level?: "project" | "organization";
}

export function ProviderCard({
	providerName,
	isConfigured,
	hasApiKey,
	baseUrl,
	isInherited = false,
	enabled = true,
	isLoading = false,
	onConfigure,
	onEdit,
	onDelete,
	onToggle,
	onViewHistory,
	level = "project",
}: ProviderCardProps) {
	const metadata = PROVIDER_METADATA[providerName as ProviderName];
	const isCustomProvider = !metadata;

	const displayMetadata = metadata || {
		name: providerName,
		displayName: providerName.charAt(0).toUpperCase() + providerName.slice(1),
		description: "",
	};

	return (
		<Card className={`relative ${!enabled ? "opacity-60" : ""}`}>
			{isLoading && (
				<div className="absolute top-2 right-2 flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-gray-700 text-xs dark:bg-gray-800 dark:text-gray-300">
					<LoadingSpinner size="sm" />
					<span>Syncing...</span>
				</div>
			)}
			{!isLoading && isInherited && (
				<div className="absolute top-2 right-2 rounded-md bg-blue-100 px-2 py-1 text-blue-700 text-xs dark:bg-blue-900 dark:text-blue-300">
					Inherited from {level === "project" ? "organization" : "YAML"}
				</div>
			)}

			<CardHeader>
				<div className="flex items-center gap-3">
					{!isCustomProvider && metadata.logo && (
						<Image
							src={metadata.logo}
							alt={`${displayMetadata.displayName} logo`}
							width={40}
							height={40}
							className="rounded-lg"
						/>
					)}
					<div className="flex-1">
						<CardTitle>{displayMetadata.displayName}</CardTitle>
						<CardDescription className="mt-1">
							{displayMetadata.description}
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<div className="space-y-3">
					{/* Configuration Status */}
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">Status</span>
						<div className="flex items-center gap-2">
							{isConfigured ? (
								<>
									<Check className="h-4 w-4 text-green-600" />
									<span className="font-medium text-green-600 text-sm">
										Configured
									</span>
								</>
							) : (
								<>
									<X className="h-4 w-4 text-gray-400" />
									<span className="font-medium text-gray-400 text-sm">
										Not Configured
									</span>
								</>
							)}
						</div>
					</div>

					{/* Enable/Disable Toggle */}
					{isConfigured && !isInherited && onToggle && (
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">Enabled</span>
							<Switch
								checked={enabled}
								onCheckedChange={onToggle}
								disabled={isLoading}
								aria-label="Toggle provider"
							/>
						</div>
					)}

					{/* API Key Status */}
					{isConfigured && (
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">API Key</span>
							<span className="text-sm">
								{hasApiKey ? "Configured" : "Not set"}
							</span>
						</div>
					)}

					{/* Base URL */}
					{isConfigured && baseUrl && (
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">Base URL</span>
							<span className="max-w-[200px] truncate text-sm" title={baseUrl}>
								{baseUrl}
							</span>
						</div>
					)}

					{/* Actions */}
					<div className="space-y-2 pt-2">
						<div className="flex gap-2">
							{isConfigured ? (
								<>
									{!isInherited && onEdit && (
										<Button
											variant="outline"
											size="sm"
											onClick={onEdit}
											disabled={isLoading}
											className="flex-1"
										>
											<Edit className="mr-2 h-4 w-4" />
											Edit
										</Button>
									)}
									{!isInherited && onDelete && (
										<Button
											variant="outline"
											size="sm"
											onClick={onDelete}
											disabled={isLoading}
											className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
										>
											Delete
										</Button>
									)}
									{isInherited && (
										<Button
											variant="outline"
											size="sm"
											onClick={onConfigure}
											disabled={isLoading}
											className="flex-1"
										>
											Override
										</Button>
									)}
								</>
							) : (
								<Button
									variant="default"
									size="sm"
									onClick={onConfigure}
									disabled={isLoading}
									className="w-full"
								>
									Configure
								</Button>
							)}
						</div>

						{/* View History Button */}
						{isConfigured && !isInherited && onViewHistory && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onViewHistory}
								disabled={isLoading}
								className="w-full gap-2"
							>
								<History className="h-4 w-4" />
								View History
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
