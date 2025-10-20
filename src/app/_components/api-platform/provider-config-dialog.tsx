"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateOrganizationProvider,
	useCreateProjectProvider,
	useUpdateOrganizationProvider,
	useUpdateProjectProvider,
} from "@/hooks/provider-configs";
import { PROVIDER_METADATA, type ProviderName } from "@/types/providers";

interface ProviderConfigDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	providerName: string;
	level: "project" | "organization";
	projectId?: number;
	organizationId?: string;
	mode: "create" | "edit";
	existingConfig?: {
		has_api_key?: boolean;
		base_url?: string;
		authorization_header?: boolean;
	};
}

export function ProviderConfigDialog({
	open,
	onOpenChange,
	providerName,
	level,
	projectId,
	organizationId,
	mode,
	existingConfig,
}: ProviderConfigDialogProps) {
	const metadata = PROVIDER_METADATA[providerName as ProviderName];

	// Form state - note: existingConfig only has has_api_key boolean, not the actual key
	// In edit mode, API key field is optional (empty = keep existing)
	const [apiKey, setApiKey] = useState("");
	const [baseUrl, setBaseUrl] = useState(existingConfig?.base_url || "");
	const [authHeader, setAuthHeader] = useState("");
	const [showApiKey, setShowApiKey] = useState(false);

	// Mutations
	const createProjectProvider = useCreateProjectProvider();
	const updateProjectProvider = useUpdateProjectProvider();
	const createOrgProvider = useCreateOrganizationProvider();
	const updateOrgProvider = useUpdateOrganizationProvider();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const data = {
			provider_name: providerName,
			api_key: apiKey.trim(),
			...(baseUrl.trim() && { base_url: baseUrl.trim() }),
			...(authHeader.trim() && { authorization_header: authHeader.trim() }),
		};

		if (level === "project" && projectId) {
			if (mode === "create") {
				createProjectProvider.mutate(
					{ projectId, provider: providerName, data },
					{
						onSuccess: () => {
							onOpenChange(false);
							resetForm();
						},
					},
				);
			} else {
				updateProjectProvider.mutate(
					{
						projectId,
						provider: providerName,
						data: {
							...(apiKey.trim() && { api_key: apiKey.trim() }),
							...(baseUrl.trim() && { base_url: baseUrl.trim() }),
							...(authHeader.trim() && {
								authorization_header: authHeader.trim(),
							}),
						},
					},
					{
						onSuccess: () => {
							onOpenChange(false);
							resetForm();
						},
					},
				);
			}
		} else if (level === "organization" && organizationId) {
			if (mode === "create") {
				createOrgProvider.mutate(
					{ organizationId, provider: providerName, data },
					{
						onSuccess: () => {
							onOpenChange(false);
							resetForm();
						},
					},
				);
			} else {
				updateOrgProvider.mutate(
					{
						organizationId,
						provider: providerName,
						data: {
							...(apiKey.trim() && { api_key: apiKey.trim() }),
							...(baseUrl.trim() && { base_url: baseUrl.trim() }),
							...(authHeader.trim() && {
								authorization_header: authHeader.trim(),
							}),
						},
					},
					{
						onSuccess: () => {
							onOpenChange(false);
							resetForm();
						},
					},
				);
			}
		}
	};

	const resetForm = () => {
		setApiKey("");
		setBaseUrl("");
		setAuthHeader("");
		setShowApiKey(false);
	};

	const isLoading =
		createProjectProvider.isPending ||
		updateProjectProvider.isPending ||
		createOrgProvider.isPending ||
		updateOrgProvider.isPending;

	if (!metadata) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<div className="flex items-center gap-3">
							{metadata.logo && (
								<Image
									src={metadata.logo}
									alt={`${metadata.displayName} logo`}
									width={32}
									height={32}
									className="rounded-lg"
								/>
							)}
							<div>
								<DialogTitle>
									{mode === "create" ? "Configure" : "Edit"}{" "}
									{metadata.displayName}
								</DialogTitle>
								<DialogDescription>
									{level === "project"
										? "Configure provider for this project"
										: "Configure provider for this organization"}
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{/* API Key */}
						<div className="space-y-2">
							<Label htmlFor="apiKey">
								API Key <span className="text-red-500">*</span>
							</Label>
							<div className="relative">
								<Input
									id="apiKey"
									type={showApiKey ? "text" : "password"}
									value={apiKey}
									onChange={(e) => setApiKey(e.target.value)}
									placeholder={
										mode === "edit"
											? "Leave empty to keep existing key"
											: "Enter API key"
									}
									required={mode === "create"}
									className="pr-10"
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
							<p className="text-muted-foreground text-xs">
								Your API key will be stored securely and never displayed in full
							</p>
						</div>

						{/* Base URL */}
						<div className="space-y-2">
							<Label htmlFor="baseUrl">Base URL (Optional)</Label>
							<Input
								id="baseUrl"
								type="url"
								value={baseUrl}
								onChange={(e) => setBaseUrl(e.target.value)}
								placeholder="https://api.example.com"
							/>
							<p className="text-muted-foreground text-xs">
								Override the default base URL for this provider
							</p>
						</div>

						{/* Authorization Header */}
						<div className="space-y-2">
							<Label htmlFor="authHeader">
								Authorization Header (Optional)
							</Label>
							<Textarea
								id="authHeader"
								value={authHeader}
								onChange={(e) => setAuthHeader(e.target.value)}
								placeholder="Bearer your-token"
								rows={3}
							/>
							<p className="text-muted-foreground text-xs">
								Custom authorization header if different from API key
							</p>
						</div>
					</div>

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
							{isLoading
								? "Saving..."
								: mode === "create"
									? "Create"
									: "Update"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
