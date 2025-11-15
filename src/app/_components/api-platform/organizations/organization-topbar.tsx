"use client";

import { useOrganization } from "@clerk/nextjs";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { SocialLogo } from "@/components/ui/social-logo";
import { Tabs } from "@/components/ui/vercel-tabs";
import { UserProfileMenu } from "@/components/user-profile-menu";

export function OrganizationTopbar() {
	const { orgId } = useParams<{
		orgId: string;
	}>();
	const { organization } = useOrganization();
	const router = useRouter();
	const pathname = usePathname();
	const orgSlug = orgId ?? organization?.slug;

	const tabs = [
		{
			id: "projects",
			label: "Projects",
		},
		{
			id: "settings",
			label: "Settings",
		},
	];

	// Determine active tab based on current pathname
	const getActiveTab = () => {
		if (pathname.includes("/settings")) return "settings";
		return "projects";
	};

	const handleTabChange = (tabId: string) => {
		const routes: Record<string, string> = {
			projects: `/api-platform/orgs/${orgSlug}`,
			settings: `/api-platform/orgs/${orgSlug}/settings`,
		};

		const route = routes[tabId];
		if (route) {
			router.push(route);
		}
	};

	return (
		<div className="border-b bg-background">
			<div className="px-6 py-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<Link href={`/api-platform/orgs/${orgSlug}`}>
							<SocialLogo width={60} height={20} className="shrink-0" />
						</Link>
						<span className="shrink-0 text-muted-foreground">/</span>
						<div className="shrink-0">
							<OrganizationSwitcher />
						</div>
					</div>
					<UserProfileMenu />
				</div>

				<Tabs
					tabs={tabs}
					activeTab={getActiveTab()}
					onTabChange={handleTabChange}
				/>
			</div>
		</div>
	);
}
