"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useDeleteProjectProvider } from "@/hooks/provider-configs";
import { useProviderConfigForm } from "@/hooks/provider-configs/use-provider-config-form";
import {
	PROVIDER_METADATA,
	type ProviderConfigApiResponse,
	type ProviderName,
} from "@/types/providers";

interface ProviderConfigSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	providerName: string;
	isCustom: boolean;
	projectId: number;
	existingConfig?: ProviderConfigApiResponse;
}

export function ProviderConfigSheet({
	open,
	onOpenChange,
	providerName,
	isCustom,
	projectId,
	existingConfig,
}: ProviderConfigSheetProps) {
	const isOrgLevel = existingConfig?.source === "organization";
	const isProjectLevel = existingConfig?.source === "project";

	const [showConfigForm, setShowConfigForm] = useState(
		!!existingConfig && !isOrgLevel,
	);
	const [showApiKey, setShowApiKey] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	useEffect(() => {
		if (open) {
			setShowConfigForm(!!existingConfig && !isOrgLevel);
			setShowApiKey(false);
			setShowDeleteConfirm(false);
		}
	}, [open, existingConfig, isOrgLevel]);

	const metadata = !isCustom
		? PROVIDER_METADATA[providerName as ProviderName]
		: null;

	const deleteProjectProvider = useDeleteProjectProvider();

	const { form, onSubmit, isLoading, isSuccess } = useProviderConfigForm({
		providerName,
		isCustom,
		projectId,
		existingConfig: isOrgLevel ? undefined : existingConfig,
		onSuccess: () => {
			onOpenChange(false);
		},
	});

	const { isDirty, isValid } = form.formState;
	const displayName = metadata?.displayName ?? providerName;

	const handleDelete = async () => {
		if (!existingConfig) return;

		try {
			await deleteProjectProvider.mutateAsync({
				projectId,
				provider: providerName,
			});
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete provider config:", error);
		}
	};

	const handleConfigure = () => {
		setShowConfigForm(true);
	};

	const saveState = isLoading ? "loading" : isSuccess ? "success" : "initial";

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="overflow-y-auto sm:max-w-[500px]">
				<SheetHeader className="px-6 pt-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							{metadata?.logo ? (
								<Image
									src={metadata.logo}
									alt={metadata.displayName}
									width={32}
									height={32}
									className="rounded"
								/>
							) : (
								<div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
									<span className="font-medium text-xs">
										{providerName.slice(0, 2).toUpperCase()}
									</span>
								</div>
							)}
							<div>
								<SheetTitle>{displayName}</SheetTitle>
								<SheetDescription>
									{isCustom ? "Custom Provider" : metadata?.description}
								</SheetDescription>
							</div>
						</div>
					</div>
				</SheetHeader>

				{isOrgLevel && (
					<div className="mx-6 mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 rounded-full bg-primary/10 p-1">
								<svg
									className="h-4 w-4 text-primary"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									role="img"
									aria-label="Information"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div className="flex-1">
								<h4 className="font-semibold text-primary text-sm">
									Configured at Organization Level
								</h4>
								<p className="mt-1 text-muted-foreground text-xs">
									This provider is configured for your entire organization. You
									can create a project-specific configuration below to override
									the organization settings for this project only.
								</p>
							</div>
						</div>
					</div>
				)}

				{isProjectLevel && (
					<div className="px-6 pt-4">
						{!showDeleteConfirm ? (
							<Button
								onClick={() => setShowDeleteConfirm(true)}
								variant="outline"
								size="sm"
								className="w-full text-destructive hover:bg-destructive/10"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Configuration
							</Button>
						) : (
							<div className="space-y-2">
								<p className="text-center text-muted-foreground text-sm">
									Are you sure you want to delete this configuration?
								</p>
								<div className="flex gap-2">
									<Button
										onClick={handleDelete}
										variant="destructive"
										size="sm"
										className="flex-1"
										disabled={deleteProjectProvider.isPending}
									>
										{deleteProjectProvider.isPending
											? "Deleting..."
											: "Confirm Delete"}
									</Button>
									<Button
										onClick={() => setShowDeleteConfirm(false)}
										variant="outline"
										size="sm"
										className="flex-1"
									>
										Cancel
									</Button>
								</div>
							</div>
						)}
					</div>
				)}

				{!showConfigForm && !isProjectLevel && (
					<div className="mt-6 space-y-6 px-6">
						<div>
							<h4 className="mb-2 font-medium text-sm">About this provider</h4>
							<p className="text-muted-foreground text-sm">
								{metadata?.description ??
									"Custom LLM provider for your specific needs."}
							</p>
						</div>

						<div className="rounded-lg bg-muted/50 p-4">
							<h4 className="mb-2 font-medium text-sm">Configuration</h4>
							<p className="mb-4 text-muted-foreground text-sm">
								{isOrgLevel
									? "Create a project-specific configuration to override organization settings."
									: "Configure API credentials and settings to enable this provider."}
							</p>
							<Button onClick={handleConfigure} className="w-full">
								{isOrgLevel ? "Create Project Override" : "Configure Provider"}
							</Button>
						</div>
					</div>
				)}

				{showConfigForm && (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="mt-6 space-y-6 px-6"
						>
							<FormField
								control={form.control}
								name="apiKey"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											API Key
											{!isProjectLevel && (
												<span className="ml-1 text-destructive">*</span>
											)}
										</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													{...field}
													type={showApiKey ? "text" : "password"}
													placeholder={
														isProjectLevel
															? "Enter new API key to update"
															: "Enter your API key"
													}
													autoComplete="off"
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
													onClick={() => setShowApiKey(!showApiKey)}
												>
													{showApiKey ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</Button>
											</div>
										</FormControl>
										<FormDescription>
											{isProjectLevel
												? "Leave empty to keep existing API key"
												: isOrgLevel
													? "Provide a project-specific API key to override organization settings"
													: "Your API key will be stored securely"}
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="baseUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Base URL</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="https://api.example.com/v1"
											/>
										</FormControl>
										<FormDescription>
											Custom API endpoint URL (optional)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex gap-2 pt-4">
								<Button
									type="button"
									variant="outline"
									className="flex-1"
									onClick={() => form.reset()}
									disabled={!isDirty || isLoading}
								>
									Reset
								</Button>
								<Button
									type="submit"
									className="flex-1"
									disabled={!isValid || !isDirty || isLoading}
								>
									{saveState === "loading"
										? "Saving..."
										: saveState === "success"
											? "Saved!"
											: isProjectLevel
												? "Update"
												: "Create Override"}
								</Button>
							</div>
						</form>
					</Form>
				)}
			</SheetContent>
		</Sheet>
	);
}
