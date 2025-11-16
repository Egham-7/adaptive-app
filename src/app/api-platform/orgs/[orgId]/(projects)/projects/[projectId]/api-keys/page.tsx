"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Edit, Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiKeysTour } from "@/components/tours";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QuickstartExamples } from "@/components/ui/quickstart-examples";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProjectApiKey } from "@/hooks/api_keys/use-create-project-api-key";
import { useDeleteProjectApiKey } from "@/hooks/api_keys/use-delete-project-api-key";
import { useProjectApiKeys } from "@/hooks/api_keys/use-project-api-keys";
import { useApiKeyTracking } from "@/hooks/posthog/use-api-key-tracking";
import type { ApiKeyResponse } from "@/types/api-keys";

const formSchema = z.object({
	name: z.string().min(2, { message: "Name must be at least 2 characters." }),
	description: z.string().optional(),
	budget_limit: z.number().nullable().optional(),
	budget_currency: z.string().optional(),
	budget_reset_type: z.enum(["", "daily", "weekly", "monthly"]).optional(),
	rate_limit_rpm: z.number().nullable().optional(),
	expires_at: z.string().datetime().nullable(),
});

export default function ApiKeysPage() {
	const params = useParams();
	const _slug = params.slug as string;
	const projectId = params.projectId as string;

	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showApiKeyModal, setShowApiKeyModal] = useState(false);
	const [newApiKey, setNewApiKey] = useState<string | null>(null);
	const [copiedApiKey, setCopiedApiKey] = useState(false);

	const { data: apiKeys = [], isLoading, error } = useProjectApiKeys(projectId);
	const createApiKey = useCreateProjectApiKey();
	const deleteApiKey = useDeleteProjectApiKey();
	const { trackCreated, trackCopied, trackDeleted } = useApiKeyTracking();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			budget_limit: 10,
			budget_currency: "USD",
			budget_reset_type: "monthly",
			rate_limit_rpm: null,
			expires_at: null,
		},
	});

	const handleCreateApiKey = (values: z.infer<typeof formSchema>) => {
		const expiresAt = values.expires_at
			? new Date(values.expires_at).toISOString()
			: null;

		createApiKey.mutate(
			{
				name: values.name,
				projectId: Number(projectId),
				description: values.description,
				budget_limit: values.budget_limit,
				budget_currency: values.budget_currency,
				budget_reset_type: values.budget_reset_type,
				rate_limit_rpm: values.rate_limit_rpm,
				expires_at: expiresAt,
			},
			{
				onSuccess: (data) => {
					setShowCreateDialog(false);
					form.reset();

					// Track API key creation
					trackCreated({
						projectId: String(projectId),
						organizationId: _slug || "",
						keyName: values.name,
						expirationDate: values.expires_at || undefined,
					});

					if (data.key) {
						setNewApiKey(data.key);
						setShowApiKeyModal(true);
					}
				},
			},
		);
	};

	const handleCopyApiKey = async () => {
		if (newApiKey) {
			try {
				await navigator.clipboard.writeText(newApiKey);
				setCopiedApiKey(true);

				// Track API key copied
				trackCopied({
					keyId: "",
					projectId: String(projectId),
				});

				setTimeout(() => setCopiedApiKey(false), 2000);
			} catch (err) {
				console.error("Failed to copy:", err);
			}
		}
	};

	const handleCloseApiKeyModal = () => {
		setShowApiKeyModal(false);
		setNewApiKey(null);
		setCopiedApiKey(false);
	};

	const handleDeleteApiKey = (id: number) => {
		// Track API key deletion
		trackDeleted({
			keyId: String(id),
			projectId: String(projectId),
		});

		deleteApiKey.mutate({ id });
	};

	if (isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-muted-foreground">Loading API keys...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-center">
					<h3 className="mb-2 font-medium text-foreground text-lg">
						Failed to load API keys
					</h3>
					<p className="mb-4 text-muted-foreground">{error.message}</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<ApiKeysTour />
			<div className="space-y-6 px-6 py-6">
				{/* Header */}
				<div className="flex items-center justify-between" id="api-keys-header">
					<h1 className="font-bold text-2xl text-foreground">API keys</h1>
					<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
						<DialogTrigger asChild>
							<Button
								className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
								id="create-api-key-button"
							>
								<Plus className="h-4 w-4" />
								Create new secret key
							</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Create new secret key</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<Form {...form}>
									<form
										onSubmit={form.handleSubmit(handleCreateApiKey)}
										className="space-y-4"
									>
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Name <span className="text-destructive">*</span>
													</FormLabel>
													<FormControl>
														<Input
															id="name"
															placeholder="My test key"
															required
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Description (optional)</FormLabel>
													<FormControl>
														<Textarea
															id="description"
															placeholder="What's this key for?"
															rows={3}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<Separator />

										<div className="space-y-4">
											<h3 className="font-medium text-sm">
												Budget Configuration (Optional)
											</h3>
											<div className="grid grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name="budget_limit"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Budget Limit</FormLabel>
															<FormControl>
																<Input
																	id="budget_limit"
																	type="number"
																	step="0.01"
																	placeholder="100.00"
																	value={field.value ?? ""}
																	onChange={(e) =>
																		field.onChange(
																			e.target.value
																				? Number.parseFloat(e.target.value)
																				: null,
																		)
																	}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="budget_currency"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Currency</FormLabel>
															<Select
																onValueChange={field.onChange}
																defaultValue={field.value}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select currency" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="USD">USD</SelectItem>
																	<SelectItem value="EUR">EUR</SelectItem>
																	<SelectItem value="GBP">GBP</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
											<FormField
												control={form.control}
												name="budget_reset_type"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Budget Reset Period</FormLabel>
														<Select
															onValueChange={(value) =>
																field.onChange(value === "none" ? "" : value)
															}
															defaultValue={field.value || "none"}
														>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Select reset period" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																<SelectItem value="none">Never</SelectItem>
																<SelectItem value="daily">Daily</SelectItem>
																<SelectItem value="weekly">Weekly</SelectItem>
																<SelectItem value="monthly">Monthly</SelectItem>
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<Separator />

										<FormField
											control={form.control}
											name="rate_limit_rpm"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Rate Limit (requests per minute)
													</FormLabel>
													<FormControl>
														<Input
															id="rate_limit_rpm"
															type="number"
															placeholder="60"
															value={field.value ?? ""}
															onChange={(e) =>
																field.onChange(
																	e.target.value
																		? Number.parseInt(e.target.value, 10)
																		: null,
																)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="expires_at"
											render={({ field }) => {
												const displayValue = field.value
													? new Date(field.value).toISOString().slice(0, 16)
													: "";

												return (
													<FormItem>
														<FormLabel>Expiration Date (optional)</FormLabel>
														<FormControl>
															<Input
																id="expires_at"
																type="datetime-local"
																value={displayValue}
																onChange={(e) => {
																	const value = e.target.value;
																	field.onChange(value || null);
																}}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												);
											}}
										/>

										<div className="flex justify-end gap-2">
											<Button
												variant="outline"
												type="button"
												onClick={() => setShowCreateDialog(false)}
											>
												Cancel
											</Button>
											<Button
												type="submit"
												disabled={!form.watch("name") || createApiKey.isPending}
												className="bg-primary hover:bg-primary/90"
											>
												{createApiKey.isPending
													? "Creating..."
													: "Create secret key"}
											</Button>
										</div>
									</form>
								</Form>
							</div>
						</DialogContent>
					</Dialog>
				</div>

				{/* Description */}
				<div
					className="space-y-3 text-muted-foreground text-sm"
					id="api-keys-description"
				>
					<p>
						As an owner of this project, you can view and manage all API keys in
						this project.
					</p>
					<p>
						Do not share your API key with others or expose it in the browser or
						other client-side code. To protect your account's security, Adaptive
						may automatically disable any API key that has leaked publicly.
					</p>
					<p>
						View usage per API key on the{" "}
						<Button
							variant="link"
							className="h-auto p-0 text-primary hover:text-primary/80"
						>
							Usage page
						</Button>
						.
					</p>
				</div>

				{/* Table */}
				<div
					className="overflow-hidden rounded-lg border border-border bg-card"
					id="api-keys-table"
				>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Secret Key</TableHead>
									<TableHead>Budget</TableHead>
									<TableHead>Rate Limit</TableHead>
									<TableHead>Created</TableHead>
									<TableHead>Expires</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{apiKeys.map((apiKey: ApiKeyResponse) => {
									return (
										<TableRow key={apiKey.id} className="hover:bg-muted/50">
											<TableCell>{apiKey.name}</TableCell>
											<TableCell className="font-mono text-muted-foreground text-sm">
												{apiKey.key_prefix}...
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{apiKey.budget_limit ? (
													<div className="space-y-0.5">
														<div className="font-medium">
															{apiKey.budget_used.toFixed(2)} /{" "}
															{apiKey.budget_limit.toFixed(2)}{" "}
															{apiKey.budget_currency}
														</div>
														{apiKey.budget_remaining !== null && (
															<div className="text-xs">
																{apiKey.budget_remaining.toFixed(2)} remaining
															</div>
														)}
														{apiKey.budget_reset_type && (
															<div className="text-xs capitalize">
																Resets {apiKey.budget_reset_type}
															</div>
														)}
													</div>
												) : (
													<span className="text-muted-foreground">
														No limit
													</span>
												)}
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{apiKey.rate_limit_rpm
													? `${apiKey.rate_limit_rpm} RPM`
													: "Unlimited"}
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{new Date(apiKey.created_at).toLocaleDateString(
													"en-US",
													{
														year: "numeric",
														month: "short",
														day: "numeric",
													},
												)}
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{apiKey.expires_at
													? new Date(apiKey.expires_at).toLocaleDateString(
															"en-US",
															{
																year: "numeric",
																month: "short",
																day: "numeric",
															},
														)
													: "Never"}
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												<span
													className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${
														apiKey.is_active
															? "border border-success/20 bg-success/10 text-success"
															: "border border-destructive/20 bg-destructive/10 text-destructive"
													}`}
												>
													{apiKey.is_active ? "Active" : "Inactive"}
												</span>
											</TableCell>
											<TableCell className="text-right font-medium text-sm">
												<div className="flex items-center justify-end gap-2">
													<Button
														variant="ghost"
														size="sm"
														disabled
														className="h-auto cursor-not-allowed p-1 text-muted-foreground/50"
														aria-disabled="true"
														aria-describedby="edit-button-disabled-description"
													>
														<Edit className="h-4 w-4" />
														<span
															id="edit-button-disabled-description"
															className="sr-only"
														>
															Editing is disabled because the API key is
															inactive.
														</span>
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDeleteApiKey(apiKey.id)}
														disabled={deleteApiKey.isPending}
														className="h-auto p-1 text-muted-foreground hover:text-destructive"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				</div>

				{/* API Key Display Modal */}
				<Dialog open={showApiKeyModal} onOpenChange={setShowApiKeyModal}>
					<DialogContent className="!max-w-7xl sm:!max-w-7xl max-h-[90vh] w-[98vw] overflow-y-auto sm:w-[90vw] lg:w-[85vw] xl:w-[80vw]">
						<DialogHeader>
							<DialogTitle>Your API key is ready!</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 px-1 sm:px-2 lg:px-0">
							{/* API Key Section */}
							<div className="space-y-3">
								<div className="space-y-2">
									<p className="font-semibold text-muted-foreground text-sm">
										Please save this API key somewhere safe and accessible. For
										security reasons, you won't be able to view it again through
										your account. If you lose this API key, you'll need to
										generate a new one.
									</p>
								</div>
								<div className="space-y-2">
									<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
										<span className="font-medium text-sm">API Key</span>
										<Button
											variant="outline"
											size="sm"
											onClick={handleCopyApiKey}
											className="h-8 px-3 text-xs"
										>
											{copiedApiKey ? (
												<>
													<Check className="mr-1 h-3 w-3" />
													Copied
												</>
											) : (
												<>
													<Copy className="mr-1 h-3 w-3" />
													Copy
												</>
											)}
										</Button>
									</div>
									<div className="rounded-md border bg-muted p-3">
										<code className="break-all font-mono text-sm">
											{newApiKey}
										</code>
									</div>
								</div>
							</div>

							<Separator />

							{/* Quickstart Section */}
							{newApiKey && (
								<QuickstartExamples
									apiKey={newApiKey}
									title="🚀 Quick Start"
									description="Test your new API key with these examples"
								/>
							)}

							<div className="flex justify-end pt-2">
								<Button
									onClick={handleCloseApiKeyModal}
									className="bg-primary hover:bg-primary/90"
									size="lg"
								>
									Done
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</>
	);
}
