"use client";

import { useParams, useRouter } from "next/navigation";
import { ProjectMembersTab } from "@/app/_components/api-platform/organizations/projects/project-members-tab";
import { ProjectSettingsGeneral } from "@/app/_components/api-platform/organizations/projects/settings/general";
import { SettingsTour } from "@/components/tours";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/projects/use-project";

export default function ProjectSettingsPage() {
	const params = useParams();
	const router = useRouter();
	const projectId = params.projectId as string;
	const orgSlug = params.orgId as string;
	const activeTab = (params.tab as string[] | undefined)?.[0] ?? "general";

	const { data: project } = useProject(Number(projectId));

	const handleTabChange = (value: string) => {
		if (orgSlug) {
			router.push(
				`/api-platform/orgs/${orgSlug}/projects/${projectId}/settings/${value}`,
			);
		}
	};

	return (
		<>
			<SettingsTour />
			<div className="flex min-h-screen bg-background">
				<div className="w-64 bg-background p-6">
					<nav className="space-y-1">
						<Button
							type="button"
							onClick={() => handleTabChange("general")}
							variant="ghost"
							className={`w-full justify-start ${
								activeTab === "general"
									? "bg-accent text-accent-foreground"
									: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
							}`}
						>
							General
						</Button>

						<Button
							type="button"
							onClick={() => handleTabChange("members")}
							variant="ghost"
							className={`w-full justify-start ${
								activeTab === "members"
									? "bg-accent text-accent-foreground"
									: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
							}`}
						>
							Members
						</Button>
					</nav>
				</div>

				<div className="flex-1 p-8">
					{activeTab === "general" && (
						<ProjectSettingsGeneral projectId={Number(projectId)} />
					)}
					{activeTab === "members" && (
						<ProjectMembersTab
							projectId={Number(projectId)}
							organizationId={project?.organization_id ?? orgSlug}
							currentUserRole={project?.currentUserRole}
						/>
					)}
				</div>
			</div>
		</>
	);
}
