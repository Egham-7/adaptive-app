"use client";

import { useOrganizationList } from "@clerk/nextjs";
import type { OrganizationResource } from "@clerk/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Trash2 } from "lucide-react";
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
import { CopyButton } from "@/components/ui/copy-button";
import { IosButton } from "@/components/ui/ios-button";
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
			{/* Organization Profile Card */}
			<div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
				<div className="flex items-center gap-3 mb-6">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400">
						<Sparkles className="h-5 w-5 text-black" />
					</div>
					<div>
						<h3 className="font-medium text-white">Organization Profile</h3>
						<p className="text-sm text-white/40">
							Manage your organization's basic information
						</p>
					</div>
				</div>

				<div className="space-y-6">
					<div className="flex items-center gap-4">
						<Avatar className="h-20 w-20 border-2 border-white/10">
							<AvatarImage src={organization?.imageUrl} />
							<AvatarFallback className="text-lg bg-white/5 text-white">
								{organization?.name?.[0]?.toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="space-y-3">
							<div className="space-y-1">
								<h3 className="font-semibold text-xl text-white">
									{organization?.name || "Organization"}
								</h3>
								<p className="text-white/40 text-sm">
									{organization?.membersCount} member
									{organization?.membersCount !== 1 ? "s" : ""}
								</p>
							</div>
							{organization?.id ? (
								<div className="space-y-1">
									<p className="text-white/40 text-xs uppercase tracking-wide">
										Organization ID
									</p>
									<div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
										<span className="font-mono text-white/60 text-xs">
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
										<FormLabel className="text-white/70">Full Name</FormLabel>
										<FormControl>
											<Input 
												placeholder="Enter organization name" 
												className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#34d399]/50 focus:ring-[#34d399]/20"
												{...field} 
											/>
										</FormControl>
										<FormDescription className="text-white/40">
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
										<FormLabel className="text-white/70">Display Name (slug)</FormLabel>
										<FormControl>
											<Input 
												placeholder="organization-slug" 
												className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#34d399]/50 focus:ring-[#34d399]/20"
												{...field} 
											/>
										</FormControl>
										<FormDescription className="text-white/40">
											Used in URLs and for identification
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end">
								<IosButton 
									type="submit" 
									variant="bordered"
									disabled={form.formState.isSubmitting}
								>
									{form.formState.isSubmitting ? "Saving..." : "Save Changes"}
								</IosButton>
							</div>
						</form>
					</Form>
				</div>
			</div>

			{/* Delete Organization Card */}
			<div className="rounded-2xl border border-red-500/30 bg-red-500/5 backdrop-blur-xl p-6">
				<div className="flex items-center gap-3 mb-6">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
						<Trash2 className="h-5 w-5 text-red-400" />
					</div>
					<div>
						<h3 className="font-medium text-red-400">Delete Organization</h3>
						<p className="text-sm text-white/40">
							Permanently delete this organization and all associated data
						</p>
					</div>
				</div>

				<div className="space-y-4">
					<div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
						<p className="text-sm text-white/70">
							<strong className="text-red-400">Warning:</strong> Deleting this organization will:
						</p>
						<ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-white/50">
							<li>Remove all projects and API keys</li>
							<li>Delete all usage data and logs</li>
							<li>Remove all team members</li>
							<li>Cannot be recovered</li>
						</ul>
					</div>

					<div className="flex justify-end">
						<IosButton
							variant="bordered"
							className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
							onClick={() => setShowDeleteDialog(true)}
						>
							Delete Organization
						</IosButton>
					</div>
				</div>
			</div>

			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={(open) => {
					setShowDeleteDialog(open);
					if (!open) setConfirmText("");
				}}
			>
				<AlertDialogContent className="bg-[#0a0a0a] border border-white/10 backdrop-blur-xl">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription className="space-y-4 text-white/60">
							<p>
								This action cannot be undone. This will permanently delete the{" "}
								<strong className="text-white">{organization?.name}</strong> organization and remove
								all associated data.
							</p>
							<div className="space-y-2">
								<Label htmlFor="confirm" className="text-white/70">
									Type <strong className="text-white">{organization?.name}</strong> to confirm:
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
									className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
								/>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel 
							onClick={() => setConfirmText("")}
							className="bg-white/5 border-white/10 text-white hover:bg-white/10"
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={confirmText !== organization?.name || isPending}
							className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
						>
							{isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
