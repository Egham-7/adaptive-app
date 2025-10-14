"use client";

import { ExternalLink, FolderKanban } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";

interface ProjectsTabProps {
	organizationId: string;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ organizationId }) => {
	const { data: projects, isLoading } = api.projects.getByOrganization.useQuery(
		{
			organizationId,
		},
	);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FolderKanban className="h-5 w-5" />
						Projects
					</CardTitle>
					<CardDescription>Loading projects...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const projectsList = projects || [];

	if (projectsList.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FolderKanban className="h-5 w-5" />
						Projects
					</CardTitle>
					<CardDescription>No projects found</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
						<p className="mb-4 text-muted-foreground">
							You haven't created any projects yet
						</p>
						<Link href={`/api-platform/orgs/${organizationId}/projects`}>
							<Button>Create Project</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<FolderKanban className="h-5 w-5" />
								Projects
							</CardTitle>
							<CardDescription>
								{projectsList.length} project
								{projectsList.length !== 1 ? "s" : ""}
							</CardDescription>
						</div>
						<Link href={`/api-platform/orgs/${organizationId}/projects`}>
							<Button variant="outline">View All Projects</Button>
						</Link>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Project Name</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Progress</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{projectsList.map((project) => (
								<TableRow key={project.id}>
									<TableCell className="font-medium">{project.name}</TableCell>
									<TableCell className="max-w-xs truncate">
										{project.description || "No description"}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												project.status === "active" ? "default" : "secondary"
											}
										>
											{project.status}
										</Badge>
									</TableCell>
									<TableCell>{project.progress}%</TableCell>
									<TableCell>
										{new Date(project.created_at).toLocaleDateString()}
									</TableCell>
									<TableCell className="text-right">
										<Link
											href={`/api-platform/orgs/${organizationId}/projects/${project.id}`}
										>
											<Button variant="ghost" size="sm">
												<ExternalLink className="h-4 w-4" />
											</Button>
										</Link>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};
