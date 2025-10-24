"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateOrganizationProvider,
	useCreateProjectProvider,
} from "@/hooks/provider-configs";
import {
	API_COMPATIBILITY_METADATA,
	type ApiCompatibilityType,
	PROVIDER_COMPATIBILITY_DEFAULTS,
	PROVIDER_METADATA,
	type ProviderName,
} from "@/types/providers";

const createProviderSchema = z
	.object({
		provider: z.string().min(1, "Provider is required"),
		apiCompatibility: z.enum(["openai", "anthropic", "gemini"]),
		apiKey: z.string().min(1, "API key is required"),
		baseUrl: z.union([z.string().url(), z.literal("")]).optional(),
		authorizationHeader: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		const isCustomProvider = !PROVIDER_METADATA[data.provider as ProviderName];
		if (isCustomProvider) {
			if (!/^[a-z0-9-]+$/.test(data.provider)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Only lowercase letters, numbers, and hyphens allowed",
					path: ["provider"],
				});
			}
			if (!data.baseUrl || data.baseUrl.trim() === "") {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Base URL is required for custom providers",
					path: ["baseUrl"],
				});
			}
		}
	});

type CreateProviderFormValues = z.infer<typeof createProviderSchema>;

interface CreateProviderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	level: "project" | "organization";
	projectId?: number;
	organizationId?: string;
}

export function CreateProviderDialog({
	open,
	onOpenChange,
	level,
	projectId,
	organizationId,
}: CreateProviderDialogProps) {
	const [showApiKey, setShowApiKey] = useState(false);

	const form = useForm<CreateProviderFormValues>({
		resolver: zodResolver(createProviderSchema),
		defaultValues: {
			provider: "",
			apiCompatibility: "openai", // Default to OpenAI-compatible
			apiKey: "",
			baseUrl: "",
			authorizationHeader: "",
		},
	});

	const createProjectProvider = useCreateProjectProvider();
	const createOrgProvider = useCreateOrganizationProvider();

	const isLoading =
		createProjectProvider.isPending || createOrgProvider.isPending;

	const builtInProviders: ComboboxOption[] = Object.entries(
		PROVIDER_METADATA,
	).map(([key, metadata]) => ({
		value: key,
		label: metadata.displayName,
		icon: metadata.logo ? (
			<Image
				src={metadata.logo}
				alt=""
				width={16}
				height={16}
				className="rounded"
			/>
		) : undefined,
	}));

	const selectedProvider = form.watch("provider");
	const metadata =
		selectedProvider && PROVIDER_METADATA[selectedProvider as ProviderName]
			? PROVIDER_METADATA[selectedProvider as ProviderName]
			: null;

	const isCustomProvider = selectedProvider && !metadata;

	// Auto-select API compatibility for built-in providers
	useEffect(() => {
		if (selectedProvider && !isCustomProvider) {
			const defaultCompatibility =
				PROVIDER_COMPATIBILITY_DEFAULTS[selectedProvider as ProviderName];
			if (defaultCompatibility) {
				form.setValue("apiCompatibility", defaultCompatibility);
			}
		}
	}, [selectedProvider, isCustomProvider, form]);

	useEffect(() => {
		if (!open) {
			form.reset();
			setShowApiKey(false);
		}
	}, [open, form]);

	const onSubmit = (values: CreateProviderFormValues) => {
		// Prepare form data for tRPC
		const formData = {
			provider_name: values.provider,
			api_compatibility: values.apiCompatibility,
			api_key: values.apiKey,
			base_url: values.baseUrl,
			authorization_header: values.authorizationHeader,
		};

		if (level === "project" && projectId) {
			createProjectProvider.mutate(
				{ projectId, provider: values.provider, data: formData },
				{
					onSuccess: () => {
						onOpenChange(false);
					},
				},
			);
		} else if (level === "organization" && organizationId) {
			createOrgProvider.mutate(
				{ organizationId, provider: values.provider, data: formData },
				{
					onSuccess: () => {
						onOpenChange(false);
					},
				},
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<div className="flex items-center gap-3">
						{metadata?.logo && (
							<Image
								src={metadata.logo}
								alt={`${metadata.displayName} logo`}
								width={32}
								height={32}
								className="rounded-lg"
							/>
						)}
						<div>
							<DialogTitle>Add Provider</DialogTitle>
							<DialogDescription>
								{level === "project"
									? "Add a provider for this project"
									: "Add a provider for this organization"}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="provider"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Provider</FormLabel>
									<FormControl>
										<Combobox
											options={builtInProviders}
											value={field.value}
											onValueChange={field.onChange}
											placeholder="Select or type provider name..."
											searchPlaceholder="Search providers..."
											emptyText="No provider found."
											allowCustomValue={true}
											customValuePattern={/^[a-z0-9-]+$/}
											customValueError="Only lowercase letters, numbers, and hyphens allowed"
										/>
									</FormControl>
									<FormDescription>
										{isCustomProvider
											? "Custom provider name (lowercase letters, numbers, hyphens)"
											: "Select a built-in provider or type a custom name"}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{isCustomProvider && (
							<FormField
								control={form.control}
								name="apiCompatibility"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											API Compatibility <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<select
												{...field}
												className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												disabled={!selectedProvider}
											>
												{Object.entries(API_COMPATIBILITY_METADATA).map(
													([key, metadata]) => (
														<option key={key} value={key}>
															{metadata.label}
														</option>
													),
												)}
											</select>
										</FormControl>
										<FormDescription>
											{field.value &&
												API_COMPATIBILITY_METADATA[
													field.value as ApiCompatibilityType
												]?.description}
											<br />
											<span className="text-muted-foreground text-xs">
												Examples:{" "}
												{field.value &&
													API_COMPATIBILITY_METADATA[
														field.value as ApiCompatibilityType
													]?.examples.join(", ")}
											</span>
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<FormField
							control={form.control}
							name="apiKey"
							render={({ field }) => (
								<FormItem>
									<FormLabel>API Key</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showApiKey ? "text" : "password"}
												placeholder="Enter API key"
												disabled={!selectedProvider}
												className="pr-10"
												{...field}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowApiKey(!showApiKey)}
												disabled={!selectedProvider}
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
										Your API key will be stored securely
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
									<FormLabel>
										Base URL
										{isCustomProvider && (
											<span className="text-red-500"> *</span>
										)}
									</FormLabel>
									<FormControl>
										<Input
											type="url"
											placeholder="https://api.example.com"
											disabled={!selectedProvider}
											{...field}
										/>
									</FormControl>
									<FormDescription>
										{isCustomProvider
											? "Base URL for your custom provider's API"
											: "Override the default base URL (optional)"}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="authorizationHeader"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Authorization Header (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Bearer your-token"
											rows={3}
											disabled={!selectedProvider}
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Custom authorization header if different from API key
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading || !selectedProvider}>
								{isLoading ? "Creating..." : "Create"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
