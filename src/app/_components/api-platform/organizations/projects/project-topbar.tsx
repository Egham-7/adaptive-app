"use client";

import { useOrganization } from "@clerk/nextjs";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { SocialLogo } from "@/components/ui/social-logo";
import { Tabs } from "@/components/ui/vercel-tabs";
import { useProject } from "@/hooks/projects/use-project";

export function ProjectTopbar() {
	const { orgId, projectId } = useParams<{
		orgId: string;
		projectId: string;
	}>();
	const { organization } = useOrganization();
	const router = useRouter();
	const pathname = usePathname();
	const orgSlug = orgId ?? organization?.slug;

	const { data: project, isLoading: projectLoading } = useProject(
		projectId ? Number(projectId) : 0,
	);

	const tabs = [
		{
			id: "usage",
			label: "Usage",
		},
		{
			id: "api-keys",
			label: "API Keys",
		},
		{
			id: "settings",
			label: "Settings",
		},
	];

	// Determine active tab based on current pathname
	const getActiveTab = () => {
		if (pathname.includes("/api-keys")) return "api-keys";
		if (pathname.includes("/settings")) return "settings";
		return "usage";
	};

	const handleTabChange = (tabId: string) => {
		const routes: Record<string, string> = {
			usage: `/api-platform/orgs/${orgSlug}/projects/${projectId}`,
			"api-keys": `/api-platform/orgs/${orgSlug}/projects/${projectId}/api-keys`,
			settings: `/api-platform/orgs/${orgSlug}/projects/${projectId}/settings`,
		};

		const route = routes[tabId];
		if (route) {
			router.push(route);
		}
	};

	return (
		<div className="border-b bg-background">
			<div className="px-6 py-4">
				{/* Header with Logo, Org, and Project */}
				<div className="flex items-center gap-2">
					<Link href={`/api-platform/orgs/${orgSlug}`}>
						<SocialLogo width={60} height={20} className="shrink-0" />
					</Link>
					<span className="shrink-0 text-muted-foreground">/</span>
					<div className="shrink-0">
						<OrganizationSwitcher />
					</div>
					{!projectLoading && project?.name && (
						<>
							<span className="shrink-0 text-muted-foreground">/</span>
							<span className="truncate font-medium">{project.name}</span>
						</>
					)}
				</div>

				{/* Navigation Tabs */}
				<Tabs
					tabs={tabs}
					activeTab={getActiveTab()}
					onTabChange={handleTabChange}
				/>
			</div>
		</div>
	);
}
