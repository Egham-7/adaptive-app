"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
	useUpdateOrganizationProvider,
	useUpdateProjectProvider,
} from "@/hooks/provider-configs";
import { PROVIDER_METADATA, type ProviderName } from "@/types/providers";

const editProviderSchema = z.object({
	apiKey: z.string().optional(),
	baseUrl: z.union([z.string().url(), z.literal("")]).optional(),
	authorizationHeader: z.string().optional(),
});

type EditProviderFormValues = z.infer<typeof editProviderSchema>;

interface EditProviderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	providerName: string;
	level: "project" | "organization";
	projectId?: number;
	organizationId?: string;
	existingConfig?: {
		has_api_key?: boolean;
		base_url?: string;
		authorization_header?: boolean;
	};
}

export function EditProviderDialog({
	open,
	onOpenChange,
	providerName,
	level,
	projectId,
	organizationId,
	existingConfig,
}: EditProviderDialogProps) {
	const metadata = PROVIDER_METADATA[providerName as ProviderName];
	const [showApiKey, setShowApiKey] = useState(false);

	const form = useForm<EditProviderFormValues>({
		resolver: zodResolver(editProviderSchema),
		defaultValues: {
			apiKey: "",
			baseUrl: existingConfig?.base_url || "",
			authorizationHeader: "",
		},
	});

	const updateProjectProvider = useUpdateProjectProvider();
	const updateOrgProvider = useUpdateOrganizationProvider();

	useEffect(() => {
		if (!open) {
			form.reset();
			setShowApiKey(false);
		} else {
			form.reset({
				apiKey: "",
				baseUrl: existingConfig?.base_url || "",
				authorizationHeader: "",
			});
		}
	}, [open, form, existingConfig]);

	const onSubmit = (values: EditProviderFormValues) => {
		const data = {
			...(values.apiKey?.trim() && { api_key: values.apiKey.trim() }),
			...(values.baseUrl?.trim() && { base_url: values.baseUrl.trim() }),
			...(values.authorizationHeader?.trim() && {
				authorization_header: values.authorizationHeader.trim(),
			}),
		};

		if (level === "project" && projectId) {
			updateProjectProvider.mutate(
				{
					projectId,
					provider: providerName,
					data,
				},
				{
					onSuccess: () => {
						onOpenChange(false);
					},
				},
			);
		} else if (level === "organization" && organizationId) {
			updateOrgProvider.mutate(
				{
					organizationId,
					provider: providerName,
					data,
				},
				{
					onSuccess: () => {
						onOpenChange(false);
					},
				},
			);
		}
	};

	const isLoading =
		updateProjectProvider.isPending || updateOrgProvider.isPending;

	if (!metadata) {
		return null;
	}

	if (!metadata) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
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
							<DialogTitle>Edit {metadata.displayName}</DialogTitle>
							<DialogDescription>
								{level === "project"
									? "Update provider configuration for this project"
									: "Update provider configuration for this organization"}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="apiKey"
							render={({ field }) => (
								<FormItem>
									<FormLabel>API Key (Optional)</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showApiKey ? "text" : "password"}
												placeholder="Leave empty to keep existing key"
												className="pr-10"
												{...field}
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
									</FormControl>
									<FormDescription>
										Leave empty to keep the existing API key
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
									<FormLabel>Base URL (Optional)</FormLabel>
									<FormControl>
										<Input
											type="url"
											placeholder="https://api.example.com"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Override the default base URL for this provider
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
							<Button type="submit" disabled={isLoading}>
								{isLoading ? "Updating..." : "Update"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
