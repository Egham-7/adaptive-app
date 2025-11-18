"use client";

import { Copy, Key, MoreVertical, Trash2 } from "lucide-react";
import type React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";

interface ApiKeysTabProps {
	organizationId: string;
}

export const ApiKeysTab: React.FC<ApiKeysTabProps> = ({ organizationId }) => {
	const utils = api.useUtils();

	const { data: apiKeys, isLoading } = api.api_keys.getByOrganization.useQuery({
		organizationId,
	});

	const deleteApiKey = api.api_keys.delete.useMutation({
		onSuccess: () => {
			toast.success("API key deleted successfully");
			utils.api_keys.getByOrganization.invalidate({ organizationId });
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete API key");
		},
	});

	const revokeApiKey = api.api_keys.revoke.useMutation({
		onSuccess: () => {
			toast.success("API key revoked successfully");
			utils.api_keys.getByOrganization.invalidate({ organizationId });
		},
		onError: (error) => {
			toast.error(error.message || "Failed to revoke API key");
		},
	});

	const handleDelete = (id: number, name: string) => {
		if (confirm(`Are you sure you want to delete "${name}"?`)) {
			deleteApiKey.mutate({ id });
		}
	};

	const handleRevoke = (id: number, name: string) => {
		if (confirm(`Are you sure you want to revoke "${name}"?`)) {
			revokeApiKey.mutate({ id });
		}
	};

	const maskApiKey = (key: string) => {
		return "••••••••••••••••••••••••••••••••";
	};

	const handleCopyKey = (key: string) => {
		navigator.clipboard.writeText(key);
		toast.success("API key copied to clipboard");
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Key className="h-5 w-5" />
							Organization API Keys
						</CardTitle>
						<CardDescription>Loading API keys...</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (!apiKeys || apiKeys.length === 0) {
		return (
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Key className="h-5 w-5" />
							Organization API Keys
						</CardTitle>
						<CardDescription>
							All API keys across your organization's projects
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<Key className="mb-4 h-12 w-12 text-muted-foreground" />
							<h3 className="mb-2 font-semibold text-lg">No API Keys Found</h3>
							<p className="mb-4 max-w-md text-muted-foreground text-sm">
								You don't have any API keys yet. Visit your project settings to
								create API keys.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Key className="h-5 w-5" />
						Organization API Keys
					</CardTitle>
					<CardDescription>
						{apiKeys.length} API key{apiKeys.length !== 1 ? "s" : ""} across all
						projects
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Project</TableHead>
								<TableHead>Key</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{apiKeys.map((apiKey) => (
								<TableRow key={apiKey.id}>
									<TableCell className="font-medium">{apiKey.name}</TableCell>
									<TableCell>
										<Badge variant="outline">{apiKey.projectName}</Badge>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<code className="rounded bg-muted px-2 py-1 font-mono text-xs">
												{maskApiKey(apiKey.key || "")}
											</code>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleCopyKey(apiKey.key || "")}
												className="h-6 w-6 p-0"
												title="Copy API key"
											>
												<Copy className="h-3 w-3" />
											</Button>
										</div>
									</TableCell>
									<TableCell>
										<Badge
											variant={apiKey.last_used_at ? "default" : "destructive"}
										>
											{apiKey.is_active ? "Active" : "Inactive"}
										</Badge>
									</TableCell>
									<TableCell>
										{new Date(apiKey.created_at).toLocaleDateString()}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												{apiKey.is_active && (
													<DropdownMenuItem
														onClick={() => handleRevoke(apiKey.id, apiKey.name)}
													>
														Revoke
													</DropdownMenuItem>
												)}
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => handleDelete(apiKey.id, apiKey.name)}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};
