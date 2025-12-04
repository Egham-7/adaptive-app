"use client";

import { ExternalLink, FolderKanban, Plus } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Badge } from "@/components/ui/badge";
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
import { IosButton } from "@/components/ui/ios-button";
import { useProjects } from "@/hooks/projects/use-projects";

interface ProjectsTabProps {
	organizationId: string;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ organizationId }) => {
	const { data: projects, isLoading } = useProjects(organizationId);

	if (isLoading) {
		return (
			<Card className="border-white/10 bg-black/40 backdrop-blur-xl">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-white">
						<FolderKanban className="h-5 w-5 text-emerald-400" />
						Projects
					</CardTitle>
					<CardDescription className="text-white/60">Loading projects...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const projectsList = projects || [];

	if (projectsList.length === 0) {
		return (
			<Card className="border-white/10 bg-black/40 backdrop-blur-xl">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-white">
						<FolderKanban className="h-5 w-5 text-emerald-400" />
						Projects
					</CardTitle>
					<CardDescription className="text-white/60">No projects found</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
							<FolderKanban className="h-8 w-8 text-emerald-400" />
						</div>
						<p className="mb-4 text-white/50">
							You haven't created any projects yet
						</p>
						<Link href={`/api-platform/orgs/${organizationId}/projects`}>
							<IosButton variant="emerald">
								<Plus className="mr-2 h-4 w-4" />
								Create Project
							</IosButton>
						</Link>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card className="border-white/10 bg-black/40 backdrop-blur-xl">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2 text-white">
								<FolderKanban className="h-5 w-5 text-emerald-400" />
								Projects
							</CardTitle>
							<CardDescription className="text-white/60">
								{projectsList.length} project
								{projectsList.length !== 1 ? "s" : ""}
							</CardDescription>
						</div>
						<Link href={`/api-platform/orgs/${organizationId}/projects`}>
							<IosButton variant="bordered">View All Projects</IosButton>
						</Link>
					</div>
				</CardHeader>
				<CardContent>
					<div className="rounded-xl border border-white/10 overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow className="border-white/10 hover:bg-white/5">
									<TableHead className="text-white/70">Project Name</TableHead>
									<TableHead className="text-white/70">Description</TableHead>
									<TableHead className="text-white/70">Status</TableHead>
									<TableHead className="text-white/70">Progress</TableHead>
									<TableHead className="text-white/70">Created</TableHead>
									<TableHead className="text-right text-white/70">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{projectsList.map((project) => (
									<TableRow key={project.id} className="border-white/10 hover:bg-white/5">
										<TableCell className="font-medium text-white">{project.name}</TableCell>
										<TableCell className="max-w-xs truncate text-white/70">
											{project.description || "No description"}
										</TableCell>
										<TableCell>
											<Badge
												className={
													project.status === "active"
														? "border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
														: "border-white/10 bg-white/10 text-white/60"
												}
											>
												{project.status}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<div className="h-2 w-16 overflow-hidden rounded-full bg-white/10">
													<div
														className="h-full bg-gradient-to-r from-emerald-500 to-lime-400"
														style={{ width: `${project.progress}%` }}
													/>
												</div>
												<span className="text-sm text-white/60">{project.progress}%</span>
											</div>
										</TableCell>
										<TableCell className="text-white/60">
											{new Date(project.created_at).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right">
											<Link
												href={`/api-platform/orgs/${organizationId}/projects/${project.id}`}
											>
												<IosButton variant="bordered" className="h-8 px-3">
													<ExternalLink className="h-4 w-4" />
												</IosButton>
											</Link>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
