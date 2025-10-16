"use client";

import { useOrganization } from "@clerk/nextjs";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useDeleteProject } from "@/hooks/projects/use-delete-project";
import { useProject } from "@/hooks/projects/use-project";
import { useUpdateProject } from "@/hooks/projects/use-update-project";

export function ProjectSettingsGeneral({ projectId }: { projectId: number }) {
	const router = useRouter();
	const { organization } = useOrganization();

	const { data: project, isLoading } = useProject(projectId);

	const [name, setName] = useState(project?.name ?? "");
	const [description, setDescription] = useState(project?.description ?? "");

	const { mutate: updateProjectMutate, isPending: isUpdating } =
		useUpdateProject();

	const { mutate: deleteProjectMutate, isPending: isDeleting } =
		useDeleteProject();

	const handleSave = () => {
		if (!name.trim()) return;

		updateProjectMutate({
			id: projectId,
			name: name.trim(),
			description: description.trim(),
		});
	};

	const handleDelete = () => {
		deleteProjectMutate(
			{ id: projectId },
			{
				onSuccess: () => {
					if (organization?.slug) {
						router.push(`/api-platform/orgs/${organization.slug}`);
					}
				},
			},
		);
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Card className="animate-pulse">
					<CardHeader>
						<div className="h-6 w-1/3 rounded bg-muted" />
						<div className="h-4 w-2/3 rounded bg-muted" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="h-10 w-full rounded bg-muted" />
							<div className="h-24 w-full rounded bg-muted" />
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
					<CardTitle>Project Information</CardTitle>
					<CardDescription>
						Update your project's name and description
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Project Name</Label>
						<Input
							id="name"
							placeholder="My Awesome Project"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							placeholder="Describe your project..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={4}
						/>
					</div>
					<Button onClick={handleSave} disabled={!name.trim() || isUpdating}>
						{isUpdating ? "Saving..." : "Save Changes"}
					</Button>
				</CardContent>
			</Card>

			<Card className="border-destructive">
				<CardHeader>
					<CardTitle className="text-destructive">Danger Zone</CardTitle>
					<CardDescription>
						Irreversible actions that can affect your project
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive">
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Project
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently delete the
									project "{project?.name}" and remove all associated data.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleDelete}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{isDeleting ? "Deleting..." : "Delete Project"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</CardContent>
			</Card>
		</div>
	);
}
