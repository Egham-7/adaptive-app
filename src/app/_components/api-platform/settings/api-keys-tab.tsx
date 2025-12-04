"use client";

import { Copy, Key, MoreVertical, Trash2 } from "lucide-react";
import type React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

	const maskApiKey = (_key: string) => {
		return "••••••••••••••••••••••••••••••••";
	};

	const handleCopyKey = (key: string) => {
		navigator.clipboard.writeText(key);
		toast.success("API key copied to clipboard");
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34d399]/10 border border-[#34d399]/30">
							<Key className="h-5 w-5 text-[#34d399]" />
						</div>
						<div>
							<h3 className="font-medium text-white">Organization API Keys</h3>
							<p className="text-sm text-white/40">Loading API keys...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!apiKeys || apiKeys.length === 0) {
		return (
			<div className="space-y-6">
				<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
					<div className="flex items-center gap-3 mb-6">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
							<Key className="h-5 w-5 text-white/40" />
						</div>
						<div>
							<h3 className="font-medium text-white">Organization API Keys</h3>
							<p className="text-sm text-white/40">
								All API keys across your organization's projects
							</p>
						</div>
					</div>
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<Key className="mb-4 h-12 w-12 text-white/20" />
						<h3 className="mb-2 font-semibold text-lg text-white">No API Keys Found</h3>
						<p className="mb-4 max-w-md text-white/40 text-sm">
							You don't have any API keys yet. Visit your project settings to
							create API keys.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
				<div className="flex items-center gap-3 mb-6">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34d399]/10 border border-[#34d399]/30">
						<Key className="h-5 w-5 text-[#34d399]" />
					</div>
					<div>
						<h3 className="font-medium text-white">Organization API Keys</h3>
						<p className="text-sm text-white/40">
							{apiKeys.length} API key{apiKeys.length !== 1 ? "s" : ""} across all
							projects
						</p>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-white/10">
								<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Name</th>
								<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Project</th>
								<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Key</th>
								<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Status</th>
								<th className="text-left py-3 px-4 text-sm font-medium text-white/50">Created</th>
								<th className="text-right py-3 px-4 text-sm font-medium text-white/50">Actions</th>
							</tr>
						</thead>
						<tbody>
							{apiKeys.map((apiKey) => (
								<tr key={apiKey.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
									<td className="py-3 px-4 text-white font-medium">{apiKey.name}</td>
									<td className="py-3 px-4">
										<span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10">
											{apiKey.projectName}
										</span>
									</td>
									<td className="py-3 px-4">
										<div className="flex items-center gap-2">
											<code className="rounded-lg bg-white/5 border border-white/10 px-2 py-1 font-mono text-xs text-white/60">
												{maskApiKey(apiKey.key || "")}
											</code>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleCopyKey(apiKey.key || "")}
												className="h-6 w-6 p-0 text-white/40 hover:text-white hover:bg-white/10"
												title="Copy API key"
											>
												<Copy className="h-3 w-3" />
											</Button>
										</div>
									</td>
									<td className="py-3 px-4">
										<span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
											apiKey.is_active 
												? "bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30" 
												: "bg-red-500/10 text-red-400 border border-red-500/30"
										}`}>
											{apiKey.is_active ? "Active" : "Inactive"}
										</span>
									</td>
									<td className="py-3 px-4 text-white/40 text-sm">
										{new Date(apiKey.created_at).toLocaleDateString()}
									</td>
									<td className="py-3 px-4 text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/10 backdrop-blur-xl">
												{apiKey.is_active && (
													<DropdownMenuItem
														className="text-white/70 hover:text-white focus:text-white focus:bg-white/10"
														onClick={() => handleRevoke(apiKey.id, apiKey.name)}
													>
														Revoke
													</DropdownMenuItem>
												)}
												<DropdownMenuItem
													className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10"
													onClick={() => handleDelete(apiKey.id, apiKey.name)}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
