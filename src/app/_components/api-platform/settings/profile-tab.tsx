"use client";

import { useOrganizationList } from "@clerk/nextjs";
import type { OrganizationResource } from "@clerk/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
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
import { Label } from "@/components/ui/label";
import { useDeleteOrganization } from "@/hooks/organizations/use-delete-organization";
import { useOrgTracking } from "@/hooks/posthog/use-org-tracking";

const organizationFormSchema = z.object({
	name: z
		.string()
		.min(1, "Organization name is required")
		.max(100, "Organization name must be less than 100 characters"),
	slug: z
		.string()
		.min(1, "Display name is required")
		.max(50, "Display name must be less than 50 characters")
		.regex(
			/^[a-z0-9-]+$/,
			"Display name can only contain lowercase letters, numbers, and hyphens",
		),
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

interface ProfileTabProps {
	organization: OrganizationResource | null | undefined;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ organization }) => {
	const router = useRouter();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [confirmText, setConfirmText] = useState("");
	const { userMemberships, setActive } = useOrganizationList({
		userMemberships: { infinite: true },
	});
	const { mutate: deleteOrg, isPending } = useDeleteOrganization();
	const { trackSettingsUpdated, trackDeleted } = useOrgTracking();

	const form = useForm<OrganizationFormValues>({
		resolver: zodResolver(organizationFormSchema),
		defaultValues: {
			name: organization?.name || "",
			slug: organization?.slug || "",
		},
	});

	useEffect(() => {
		if (organization) {
			form.reset({
				name: organization.name || "",
				slug: organization.slug || "",
			});
		}
	}, [organization, form]);

	const handleSave = async (values: OrganizationFormValues) => {
		if (!organization) return;

		try {
			await organization.update({
				name: values.name,
				slug: values.slug,
			});

			// Track settings update
			trackSettingsUpdated({
				organizationId: organization.id,
				settingsChanged: ["name", "slug"],
			});

			toast.success("Organization updated successfully");
		} catch (error) {
			toast.error("Failed to update organization");
			console.error("Error updating organization:", error);
		}
	};

	const handleDelete = async () => {
		if (!organization) return;

		// Track organization deletion
		trackDeleted({
			organizationId: organization.id,
		});

		deleteOrg(
			{ organizationId: organization.id },
			{
				onSuccess: async () => {
					const remainingOrgs = userMemberships.data?.filter(
						(m) => m.organization.id !== organization.id,
					);

					if (remainingOrgs?.[0] && setActive) {
						await setActive({ organization: remainingOrgs[0].organization.id });
						router.push(
							`/api-platform/orgs/${remainingOrgs[0].organization.slug}`,
						);
					} else {
						router.push("/api-platform/orgs");
					}

					toast.success("Organization deleted successfully");
					setShowDeleteDialog(false);
				},
				onError: (error) => {
					toast.error("Failed to delete organization");
					console.error(error);
				},
			},
		);
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						Organization Profile
					</CardTitle>
					<CardDescription>
						Manage your organization's basic information
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center gap-4">
						<Avatar className="h-20 w-20">
							<AvatarImage src={organization?.imageUrl} />
							<AvatarFallback className="text-lg">
								{organization?.name?.[0]?.toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="space-y-3">
							<div className="space-y-1">
								<h3 className="font-semibold text-xl">
									{organization?.name || "Organization"}
								</h3>
								<p className="text-muted-foreground text-sm">
									{organization?.membersCount} member
									{organization?.membersCount !== 1 ? "s" : ""}
								</p>
							</div>
							{organization?.id ? (
								<div className="space-y-1">
									<p className="text-muted-foreground text-xs uppercase tracking-wide">
										Organization ID
									</p>
									<div className="flex items-center gap-3 rounded-lg border bg-muted px-3 py-1.5">
										<span className="font-mono text-muted-foreground text-xs">
											{organization.id}
										</span>
										<CopyButton content={organization.id} />
									</div>
								</div>
							) : null}
						</div>
					</div>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSave)}
							className="space-y-4"
						>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full Name</FormLabel>
										<FormControl>
											<Input placeholder="Enter organization name" {...field} />
										</FormControl>
										<FormDescription>
											This is the display name for your organization
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="slug"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Display Name (slug)</FormLabel>
										<FormControl>
											<Input placeholder="organization-slug" {...field} />
										</FormControl>
										<FormDescription>
											Used in URLs and for identification
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end">
								<Button type="submit" disabled={form.formState.isSubmitting}>
									{form.formState.isSubmitting ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			<Card className="border-destructive">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-destructive">
						<Trash2 className="h-5 w-5" />
						Delete Organization
					</CardTitle>
					<CardDescription>
						Permanently delete this organization and all associated data. This
						action cannot be undone.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-lg bg-destructive/10 p-4">
						<p className="text-sm">
							<strong>Warning:</strong> Deleting this organization will:
						</p>
						<ul className="mt-2 ml-6 list-disc space-y-1 text-sm">
							<li>Remove all projects and API keys</li>
							<li>Delete all usage data and logs</li>
							<li>Remove all team members</li>
							<li>Cannot be recovered</li>
						</ul>
					</div>

					<div className="flex justify-end">
						<Button
							variant="destructive"
							onClick={() => setShowDeleteDialog(true)}
						>
							Delete Organization
						</Button>
					</div>
				</CardContent>
			</Card>

			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={(open) => {
					setShowDeleteDialog(open);
					if (!open) setConfirmText("");
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription className="space-y-4">
							<p>
								This action cannot be undone. This will permanently delete the{" "}
								<strong>{organization?.name}</strong> organization and remove
								all associated data.
							</p>
							<div className="space-y-2">
								<Label htmlFor="confirm">
									Type <strong>{organization?.name}</strong> to confirm:
								</Label>
								<Input
									id="confirm"
									value={confirmText}
									onChange={(e) => setConfirmText(e.target.value)}
									onKeyDown={(e) => {
										if (
											e.key === "Enter" &&
											confirmText === organization?.name &&
											!isPending
										) {
											e.preventDefault();
											handleDelete();
										}
									}}
									placeholder={organization?.name}
								/>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setConfirmText("")}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={confirmText !== organization?.name || isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
