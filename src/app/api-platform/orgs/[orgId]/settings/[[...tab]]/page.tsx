"use client";

import { useOrganization } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { ApiKeysTab } from "@/app/_components/api-platform/settings/api-keys-tab";
import { AppearanceTab } from "@/app/_components/api-platform/settings/appearance-tab";
import { MembersTab } from "@/app/_components/api-platform/settings/members-tab";
import { PrivacyTab } from "@/app/_components/api-platform/settings/privacy-tab";
import { ProfileTab } from "@/app/_components/api-platform/settings/profile-tab";
import { ProjectsTab } from "@/app/_components/api-platform/settings/projects-tab";
import { Button } from "@/components/ui/button";

const OrganizationSettingsPage: React.FC = () => {
	const { organization, isLoaded } = useOrganization();
	const params = useParams();
	const router = useRouter();
	const orgId = params.orgId as string;
	const activeTab = (params.tab as string[])?.[0] || "general";

	const handleTabChange = (value: string) => {
		router.push(`/api-platform/orgs/${orgId}/settings/${value}`);
	};

	if (!isLoaded) {
		return null;
	}

	if (!organization) {
		return <div>Organization not found</div>;
	}

	return (
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
						onClick={() => handleTabChange("appearance")}
						variant="ghost"
						className={`w-full justify-start ${
							activeTab === "appearance"
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
						}`}
					>
						Appearance
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

					<Button
						type="button"
						onClick={() => handleTabChange("projects")}
						variant="ghost"
						className={`w-full justify-start ${
							activeTab === "projects"
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
						}`}
					>
						Projects
					</Button>

					<Button
						type="button"
						onClick={() => handleTabChange("api-keys")}
						variant="ghost"
						className={`w-full justify-start ${
							activeTab === "api-keys"
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
						}`}
					>
						API keys
					</Button>

					<Button
						type="button"
						onClick={() => handleTabChange("privacy")}
						variant="ghost"
						className={`w-full justify-start ${
							activeTab === "privacy"
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
						}`}
					>
						Privacy controls
					</Button>
				</nav>
			</div>

			<div className="flex-1 p-8">
				{activeTab === "general" && <ProfileTab organization={organization} />}
				{activeTab === "appearance" && <AppearanceTab />}
				{activeTab === "members" && (
					<MembersTab organizationId={organization.id} />
				)}
				{activeTab === "projects" && (
					<ProjectsTab organizationId={organization.id} />
				)}
				{activeTab === "api-keys" && (
					<ApiKeysTab organizationId={organization.id} />
				)}
				{activeTab === "privacy" && <PrivacyTab />}
			</div>
		</div>
	);
};

export default OrganizationSettingsPage;
