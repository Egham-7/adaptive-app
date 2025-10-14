"use client";

import { useOrganization } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { ApiKeysTab } from "@/app/_components/api-platform/settings/api-keys-tab";
import { AppearanceTab } from "@/app/_components/api-platform/settings/appearance-tab";
import { MembersTab } from "@/app/_components/api-platform/settings/members-tab";
import { PrivacyTab } from "@/app/_components/api-platform/settings/privacy-tab";
import { ProfileTab } from "@/app/_components/api-platform/settings/profile-tab";
import { ProjectsTab } from "@/app/_components/api-platform/settings/projects-tab";

const OrganizationSettingsPage: React.FC = () => {
	const { organization, isLoaded } = useOrganization();
	const params = useParams();
	const router = useRouter();
	const orgId = params.orgId as string;
	const activeTab = (params.tab as string[])?.[0] || "profile";

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
					<button
						type="button"
						onClick={() => handleTabChange("profile")}
						className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
							activeTab === "profile"
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
						}`}
					>
						Profile
					</button>

					<button
						type="button"
						onClick={() => handleTabChange("appearance")}
						className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
							activeTab === "appearance"
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
						}`}
					>
						Appearance
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

					<button
						type="button"
						onClick={() => handleTabChange("projects")}
						className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
							activeTab === "projects"
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
						}`}
					>
						Projects
					</button>

					<button
						type="button"
						onClick={() => handleTabChange("api-keys")}
						className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
							activeTab === "api-keys"
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
						}`}
					>
						API keys
					</button>

					<button
						type="button"
						onClick={() => handleTabChange("privacy")}
						className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
							activeTab === "privacy"
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
						}`}
					>
						Privacy controls
					</button>
				</nav>
			</div>

			<div className="flex-1 p-8">
				{activeTab === "profile" && <ProfileTab organization={organization} />}
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
