"use client";

import { useParams, useRouter } from "next/navigation";
import { ProjectMembersTab } from "@/app/_components/api-platform/organizations/projects/project-members-tab";
import { ProjectSettingsGeneral } from "@/app/_components/api-platform/organizations/projects/settings/general";
import { api } from "@/trpc/react";

export default function ProjectSettingsPage() {
	const params = useParams();
	const router = useRouter();
	const projectId = params.projectId as string;
	const orgSlug = params.orgId as string;
	const activeTab = (params.tab as string[] | undefined)?.[0] ?? "general";

	const { data: project } = api.projects.getById.useQuery(
		{ id: Number(projectId) },
		{ enabled: !!projectId && !Number.isNaN(Number(projectId)) },
	);

	const handleTabChange = (value: string) => {
		if (orgSlug) {
			router.push(
				`/api-platform/orgs/${orgSlug}/projects/${projectId}/settings/${value}`,
			);
		}
	};

	return (
		<div className="flex min-h-screen bg-background">
			<div className="w-64 bg-background p-6">
				<nav className="space-y-1">
					<button
						type="button"
						onClick={() => handleTabChange("general")}
						className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
							activeTab === "general"
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
						}`}
					>
						General
					</button>

					<button
						type="button"
						onClick={() => handleTabChange("members")}
						className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
							activeTab === "members"
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
						}`}
					>
						Members
					</button>
				</nav>
			</div>

			<div className="flex-1 p-8">
				{activeTab === "general" && (
					<ProjectSettingsGeneral projectId={Number(projectId)} />
				)}
				{activeTab === "members" && (
					<ProjectMembersTab
						projectId={Number(projectId)}
						currentUserRole={project?.currentUserRole}
					/>
				)}
			</div>
		</div>
	);
}
