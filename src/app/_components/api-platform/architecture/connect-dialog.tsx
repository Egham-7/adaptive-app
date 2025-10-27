"use client";

import { Key, Link } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuickstartExamples } from "@/components/ui/quickstart-examples";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateProjectApiKey } from "@/hooks/api_keys/use-create-project-api-key";

const PROVIDER_TABS = [
	{
		id: "openai",
		name: "OpenAI",
		logo: "/logos/openai.webp",
		description: "OpenAI-compatible chat completions endpoint",
	},
	{
		id: "anthropic",
		name: "Anthropic",
		logo: "/logos/anthropic.jpeg",
		description: "Anthropic Messages API endpoint",
	},
	{
		id: "gemini",
		name: "Gemini",
		logo: "/logos/google.svg",
		description: "Google Gemini chat completions endpoint",
	},
] as const;

interface ConnectDialogProps {
	projectId: number;
}

export function ConnectDialog({ projectId }: ConnectDialogProps) {
	const [apiKeyName, setApiKeyName] = useState("");
	const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const createApiKey = useCreateProjectApiKey();

	const handleCreateApiKey = async () => {
		if (!apiKeyName.trim()) {
			return;
		}

		createApiKey.mutate(
			{
				projectId,
				name: apiKeyName,
				expires_at: null,
			},
			{
				onSuccess: (data) => {
					if (data.key) {
						setCreatedApiKey(data.key);
						setShowCreateForm(false);
						setApiKeyName("");
					}
				},
			},
		);
	};

	const displayApiKey = createdApiKey || "YOUR_API_KEY";

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="default" size="sm">
					<Link className="mr-2 h-4 w-4" />
					Connect
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Connect to Adaptive API</DialogTitle>
					<DialogDescription>
						Choose your preferred provider format and copy the integration
						examples below. All endpoints are compatible with their respective
						SDK formats.
					</DialogDescription>
				</DialogHeader>

				{/* API Key Creation Section */}
				<div className="space-y-3 rounded-lg border bg-muted/30 p-4">
					{!showCreateForm && !createdApiKey && (
						<Button
							onClick={() => setShowCreateForm(true)}
							variant="outline"
							size="sm"
							className="w-full"
						>
							<Key className="mr-2 h-4 w-4" />
							Create API Key (Optional)
						</Button>
					)}

					{showCreateForm && (
						<div className="space-y-3">
							<div className="space-y-2">
								<Label htmlFor="api-key-name">API Key Name</Label>
								<Input
									id="api-key-name"
									placeholder="e.g., My Integration Key"
									value={apiKeyName}
									onChange={(e) => setApiKeyName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleCreateApiKey();
										}
									}}
								/>
							</div>
							<div className="flex gap-2">
								<Button
									onClick={handleCreateApiKey}
									disabled={!apiKeyName.trim() || createApiKey.isPending}
									size="sm"
								>
									{createApiKey.isPending ? "Creating..." : "Create"}
								</Button>
								<Button
									onClick={() => {
										setShowCreateForm(false);
										setApiKeyName("");
									}}
									variant="outline"
									size="sm"
								>
									Cancel
								</Button>
							</div>
						</div>
					)}

					{createdApiKey && (
						<div className="space-y-2">
							<p className="font-medium text-green-600 text-sm dark:text-green-400">
								✓ API Key created! The examples below are now autofilled with
								your key.
							</p>
							<Button
								onClick={() => {
									setCreatedApiKey(null);
									setShowCreateForm(false);
								}}
								variant="outline"
								size="sm"
							>
								Use Placeholder Instead
							</Button>
						</div>
					)}
				</div>

				<Tabs defaultValue="openai" className="mt-4 w-full">
					<TabsList className="grid w-full grid-cols-3">
						{PROVIDER_TABS.map((provider) => (
							<TabsTrigger key={provider.id} value={provider.id}>
								<div className="flex items-center gap-2">
									<Image
										src={provider.logo}
										alt={`${provider.name} logo`}
										width={20}
										height={20}
										className="rounded"
									/>
									<span>{provider.name}</span>
								</div>
							</TabsTrigger>
						))}
					</TabsList>

					{PROVIDER_TABS.map((provider) => (
						<TabsContent key={provider.id} value={provider.id} className="mt-4">
							<div className="mb-4 rounded-lg border bg-muted/50 p-3">
								<p className="text-muted-foreground text-sm">
									{provider.description}
								</p>
							</div>
							<QuickstartExamples
								apiKey={displayApiKey}
								showTitle={false}
								provider={provider.id}
							/>
						</TabsContent>
					))}
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
