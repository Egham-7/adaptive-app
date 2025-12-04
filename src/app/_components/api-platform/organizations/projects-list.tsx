"use client";

import { useOrganization } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjectTracking } from "@/hooks/posthog/use-project-tracking";
import { useCreateProject } from "@/hooks/projects/use-create-project";
import { useProjects } from "@/hooks/projects/use-projects";

export function ProjectsList({ organizationId }: { organizationId: string }) {
	const router = useRouter();
	const { organization } = useOrganization();
	const [projectName, setProjectName] = useState("");
	const [projectDescription, setProjectDescription] = useState("");
	const { trackCreated } = useProjectTracking();

	const { data: projects, isLoading } = useProjects(organizationId);

	console.log("Projects:", projects);

	const createProject = useCreateProject({
		onSuccess: (project) => {
			// Track project creation
			trackCreated({
				projectId: String(project.id),
				organizationId,
				projectName: project.name,
				description: project.description || undefined,
			});

			setProjectName("");
			setProjectDescription("");
			if (organization?.slug) {
				router.push(
					`/api-platform/orgs/${organization.slug}/projects/${project.id}`,
				);
			}
		},
	});

	const handleCreateProject = () => {
		if (!projectName.trim()) return;

		createProject.mutate({
			organizationId,
			name: projectName,
			description: projectDescription,
		});
	};

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="relative">
						<div className="h-12 w-12 rounded-full border-2 border-white/10" />
						<div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-emerald-500" />
					</div>
					<p className="text-white/50 text-sm">Loading projects...</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Projects</h1>
					<p className="text-muted-foreground">
						Manage your organization's projects
					</p>
				</div>
				<Dialog>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							New Project
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Project</DialogTitle>
							<DialogDescription>
								Add a new project to your organization. You can configure it
								later.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="project-name">Project Name</Label>
								<Input
									id="project-name"
									placeholder="My Awesome Project"
									value={projectName}
									onChange={(e) => setProjectName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleCreateProject();
										}
									}}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="project-description">
									Description (Optional)
								</Label>
								<Textarea
									id="project-description"
									placeholder="Describe your project..."
									value={projectDescription}
									onChange={(e) => setProjectDescription(e.target.value)}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={handleCreateProject}
								disabled={!projectName.trim() || createProject.isPending}
							>
								{createProject.isPending ? "Creating..." : "Create Project"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{projects && projects.length === 0 ? (
				<Card className="border-dashed">
					<CardHeader className="flex items-center justify-center py-12">
						<div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
							<Plus className="h-12 w-12" />
							<CardTitle>No projects yet</CardTitle>
							<CardDescription>
								Get started by creating your first project
							</CardDescription>
							<Dialog>
								<DialogTrigger asChild>
									<Button className="mt-4">
										<Plus className="mr-2 h-4 w-4" />
										Create Project
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Create New Project</DialogTitle>
										<DialogDescription>
											Add a new project to your organization. You can configure
											it later.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="empty-project-name">Project Name</Label>
											<Input
												id="empty-project-name"
												placeholder="My Awesome Project"
												value={projectName}
												onChange={(e) => setProjectName(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														handleCreateProject();
													}
												}}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="empty-project-description">
												Description (Optional)
											</Label>
											<Textarea
												id="empty-project-description"
												placeholder="Describe your project..."
												value={projectDescription}
												onChange={(e) => setProjectDescription(e.target.value)}
											/>
										</div>
									</div>
									<DialogFooter>
										<Button
											onClick={handleCreateProject}
											disabled={!projectName.trim() || createProject.isPending}
										>
											{createProject.isPending
												? "Creating..."
												: "Create Project"}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</CardHeader>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{projects?.map((project) => (
						<Card
							key={project.id}
							className="cursor-pointer transition-colors hover:border-primary"
							onClick={() => {
								if (organization?.slug) {
									router.push(
										`/api-platform/orgs/${organization.slug}/projects/${project.id}`,
									);
								}
							}}
						>
							<CardHeader>
								<CardTitle>{project.name}</CardTitle>
								<CardDescription>
									{project.description || "No description"}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between text-muted-foreground text-sm">
									<span>Status: {project.status}</span>
									<span>{project.members.length} members</span>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</>
	);
}
