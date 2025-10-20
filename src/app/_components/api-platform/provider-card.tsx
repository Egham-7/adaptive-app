"use client";

import { Check, Edit, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PROVIDER_METADATA, type ProviderName } from "@/types/providers";

interface ProviderCardProps {
	providerName: string;
	isConfigured: boolean;
	hasApiKey?: boolean;
	baseUrl?: string;
	authorizationHeader?: boolean;
	isInherited?: boolean;
	onConfigure: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
	level?: "project" | "organization";
}

export function ProviderCard({
	providerName,
	isConfigured,
	hasApiKey,
	baseUrl,
	authorizationHeader,
	isInherited = false,
	onConfigure,
	onEdit,
	onDelete,
	level = "project",
}: ProviderCardProps) {
	const metadata = PROVIDER_METADATA[providerName as ProviderName];

	if (!metadata) {
		return null;
	}

	return (
		<Card className="relative">
			{isInherited && (
				<div className="absolute top-2 right-2 rounded-md bg-blue-100 px-2 py-1 text-blue-700 text-xs dark:bg-blue-900 dark:text-blue-300">
					Inherited from {level === "project" ? "organization" : "YAML"}
				</div>
			)}

			<CardHeader>
				<div className="flex items-center gap-3">
					{metadata.logo && (
						<Image
							src={metadata.logo}
							alt={`${metadata.displayName} logo`}
							width={40}
							height={40}
							className="rounded-lg"
						/>
					)}
					<div className="flex-1">
						<CardTitle>{metadata.displayName}</CardTitle>
						<CardDescription className="mt-1">
							{metadata.description}
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

					{/* Authorization Header */}
					{isConfigured && authorizationHeader && (
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">Custom Auth</span>
							<span className="text-sm">Enabled</span>
						</div>
					)}

					{/* Actions */}
					<div className="flex gap-2 pt-2">
						{isConfigured ? (
							<>
								{!isInherited && onEdit && (
									<Button
										variant="outline"
										size="sm"
										onClick={onEdit}
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
								className="w-full"
							>
								Configure
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
