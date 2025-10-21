"use client";

import { Eye, EyeOff } from "lucide-react";
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
} from "@/hooks/provider-configs";

interface CustomProviderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	level: "project" | "organization";
	projectId?: number;
	organizationId?: string;
}

export function CustomProviderDialog({
	open,
	onOpenChange,
	level,
	projectId,
	organizationId,
}: CustomProviderDialogProps) {
	const [providerName, setProviderName] = useState("");
	const [apiKey, setApiKey] = useState("");
	const [baseUrl, setBaseUrl] = useState("");
	const [authHeader, setAuthHeader] = useState("");
	const [showApiKey, setShowApiKey] = useState(false);

	const createProjectProvider = useCreateProjectProvider();
	const createOrgProvider = useCreateOrganizationProvider();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const data = {
			provider_name: providerName.trim(),
			api_key: apiKey.trim(),
			...(baseUrl.trim() && { base_url: baseUrl.trim() }),
			...(authHeader.trim() && { authorization_header: authHeader.trim() }),
		};

		if (level === "project" && projectId) {
			createProjectProvider.mutate(
				{ projectId, provider: providerName.trim(), data },
				{
					onSuccess: () => {
						onOpenChange(false);
						resetForm();
					},
				},
			);
		} else if (level === "organization" && organizationId) {
			createOrgProvider.mutate(
				{ organizationId, provider: providerName.trim(), data },
				{
					onSuccess: () => {
						onOpenChange(false);
						resetForm();
					},
				},
			);
		}
	};

	const resetForm = () => {
		setProviderName("");
		setApiKey("");
		setBaseUrl("");
		setAuthHeader("");
		setShowApiKey(false);
	};

	const isLoading =
		createProjectProvider.isPending || createOrgProvider.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Add Custom Provider</DialogTitle>
						<DialogDescription>
							{level === "project"
								? "Add a custom LLM provider for this project"
								: "Add a custom LLM provider for this organization"}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="providerName">
								Provider Name <span className="text-red-500">*</span>
							</Label>
							<Input
								id="providerName"
								type="text"
								value={providerName}
								onChange={(e) => setProviderName(e.target.value)}
								placeholder="my-custom-provider"
								required
								pattern="[a-z0-9-]+"
								title="Only lowercase letters, numbers, and hyphens"
							/>
							<p className="text-muted-foreground text-xs">
								Use lowercase letters, numbers, and hyphens only
							</p>
						</div>

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
									placeholder="Enter API key"
									required
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

						<div className="space-y-2">
							<Label htmlFor="baseUrl">
								Base URL <span className="text-red-500">*</span>
							</Label>
							<Input
								id="baseUrl"
								type="url"
								value={baseUrl}
								onChange={(e) => setBaseUrl(e.target.value)}
								placeholder="https://api.example.com"
								required
							/>
							<p className="text-muted-foreground text-xs">
								The base URL for your custom provider's API
							</p>
						</div>

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
							onClick={() => {
								onOpenChange(false);
								resetForm();
							}}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Creating..." : "Create Provider"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
