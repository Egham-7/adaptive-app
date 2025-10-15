"use client";

import { useOrganizationList } from "@clerk/nextjs";
import type { OrganizationResource } from "@clerk/types";
import { Building2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";

interface ProfileTabProps {
	organization: OrganizationResource | null | undefined;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ organization }) => {
	const router = useRouter();
	const [fullName, setFullName] = useState(organization?.name || "");
	const [displayName, setDisplayName] = useState(organization?.slug || "");
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [confirmText, setConfirmText] = useState("");
	const { userMemberships, setActive } = useOrganizationList({
		userMemberships: { infinite: true },
	});
	const deleteOrgMutation = api.organizations.delete.useMutation();

	const handleSave = async () => {
		if (!organization) return;

		try {
			await organization.update({
				name: fullName,
				slug: displayName,
			});
		} catch (error) {
			console.error("Error updating organization:", error);
		}
	};

	const handleDelete = async () => {
		if (!organization) return;

		try {
			await deleteOrgMutation.mutateAsync({
				organizationId: organization.id,
			});

			const remainingOrgs = userMemberships.data?.filter(
				(m) => m.organization.id !== organization.id,
			);

			if (remainingOrgs?.[0] && setActive) {
				await setActive({ organization: remainingOrgs[0].organization.id });
				router.push(`/api-platform/orgs/${remainingOrgs[0].organization.slug}`);
			} else {
				router.push("/api-platform/orgs");
			}

			toast.success("Organization deleted successfully");
			setShowDeleteDialog(false);
		} catch (error) {
			toast.error("Failed to delete organization");
			console.error(error);
		}
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
						<div className="space-y-2">
							<div className="space-y-1">
								<h3 className="font-semibold text-xl">
									{organization?.name || "Organization"}
								</h3>
								<p className="text-muted-foreground text-sm">
									{organization?.membersCount} member
									{organization?.membersCount !== 1 ? "s" : ""}
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="fullName">Full Name</Label>
							<Input
								id="fullName"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								placeholder="Enter organization name"
							/>
							<p className="text-muted-foreground text-xs">
								This is the display name for your organization
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="displayName">Display Name (slug)</Label>
							<Input
								id="displayName"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								placeholder="organization-slug"
							/>
							<p className="text-muted-foreground text-xs">
								Used in URLs and for identification
							</p>
						</div>
					</div>

					<div className="flex justify-end">
						<Button onClick={handleSave}>Save Changes</Button>
					</div>
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
							disabled={
								confirmText !== organization?.name ||
								deleteOrgMutation.isPending
							}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteOrgMutation.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
