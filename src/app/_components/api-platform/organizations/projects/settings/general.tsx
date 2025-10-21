"use client";

import { useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteProject } from "@/hooks/projects/use-delete-project";
import { useProject } from "@/hooks/projects/use-project";
import { useUpdateProject } from "@/hooks/projects/use-update-project";

const projectFormSchema = z.object({
	name: z
		.string()
		.min(1, "Project name is required")
		.max(100, "Project name must be less than 100 characters"),
	description: z
		.string()
		.max(500, "Description must be less than 500 characters")
		.optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export function ProjectSettingsGeneral({ projectId }: { projectId: number }) {
	const router = useRouter();
	const { organization } = useOrganization();

	const { data: project, isLoading } = useProject(projectId);

	const { mutate: updateProjectMutate, isPending: isUpdating } =
		useUpdateProject();

	const { mutate: deleteProjectMutate, isPending: isDeleting } =
		useDeleteProject();

	const form = useForm<ProjectFormValues>({
		resolver: zodResolver(projectFormSchema),
		defaultValues: {
			name: project?.name ?? "",
			description: project?.description ?? "",
		},
	});

	useEffect(() => {
		if (project) {
			form.reset({
				name: project.name ?? "",
				description: project.description ?? "",
			});
		}
	}, [project, form]);

	const handleSave = (values: ProjectFormValues) => {
		updateProjectMutate({
			id: projectId,
			name: values.name.trim(),
			description: values.description?.trim() ?? "",
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
				<CardContent>
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
										<FormLabel>Project Name</FormLabel>
										<FormControl>
											<Input placeholder="My Awesome Project" {...field} />
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
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe your project..."
												rows={4}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" disabled={isUpdating}>
								{isUpdating ? "Saving..." : "Save Changes"}
							</Button>
						</form>
					</Form>
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
