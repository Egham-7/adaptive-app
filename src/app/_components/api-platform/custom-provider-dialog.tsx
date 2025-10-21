"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
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
	useCreateOrganizationProvider,
	useCreateProjectProvider,
} from "@/hooks/provider-configs";

const customProviderSchema = z.object({
	providerName: z
		.string()
		.min(1, "Provider name is required")
		.regex(
			/^[a-z0-9-]+$/,
			"Only lowercase letters, numbers, and hyphens are allowed",
		),
	apiKey: z.string().min(1, "API key is required"),
	baseUrl: z.string().url("Must be a valid URL"),
	authorizationHeader: z.string().optional(),
});

type CustomProviderFormValues = z.infer<typeof customProviderSchema>;

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
	const [showApiKey, setShowApiKey] = useState(false);

	const form = useForm<CustomProviderFormValues>({
		resolver: zodResolver(customProviderSchema),
		defaultValues: {
			providerName: "",
			apiKey: "",
			baseUrl: "",
			authorizationHeader: "",
		},
	});

	const createProjectProvider = useCreateProjectProvider();
	const createOrgProvider = useCreateOrganizationProvider();

	const isLoading =
		createProjectProvider.isPending || createOrgProvider.isPending;

	useEffect(() => {
		if (!open) {
			form.reset();
			setShowApiKey(false);
		}
	}, [open, form]);

	const onSubmit = (values: CustomProviderFormValues) => {
		const data = {
			provider_name: values.providerName,
			api_key: values.apiKey,
			base_url: values.baseUrl,
			...(values.authorizationHeader && {
				authorization_header: values.authorizationHeader,
			}),
		};

		if (level === "project" && projectId) {
			createProjectProvider.mutate(
				{ projectId, provider: values.providerName, data },
				{
					onSuccess: () => {
						onOpenChange(false);
					},
				},
			);
		} else if (level === "organization" && organizationId) {
			createOrgProvider.mutate(
				{ organizationId, provider: values.providerName, data },
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
					<DialogTitle>Add Custom Provider</DialogTitle>
					<DialogDescription>
						{level === "project"
							? "Add a custom LLM provider for this project"
							: "Add a custom LLM provider for this organization"}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="providerName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Provider Name</FormLabel>
									<FormControl>
										<Input placeholder="my-custom-provider" {...field} />
									</FormControl>
									<FormDescription>
										Use lowercase letters, numbers, and hyphens only
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

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
										Your API key will be stored securely and never displayed in
										full
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
											type="url"
											placeholder="https://api.example.com"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										The base URL for your custom provider's API
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
								{isLoading ? "Creating..." : "Create Provider"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
