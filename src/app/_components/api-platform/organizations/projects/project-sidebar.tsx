"use client";

import { useOrganization } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { MdDashboard, MdKey, MdPlayArrow, MdSettings } from "react-icons/md";
import { ApiSidebarNavFooter } from "@/app/_components/api-platform/sidebar-nav-footer";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
	useSidebar,
} from "@/components/ui/sidebar";
import { SocialLogo } from "@/components/ui/social-logo";
import { api } from "@/trpc/react";

interface NavLink {
	label: string;
	href: string;
	icon: ReactNode;
}

export function ProjectSidebar() {
	const { orgId, projectId } = useParams<{
		orgId: string;
		projectId: string;
	}>();
	const { organization } = useOrganization();
	const { state } = useSidebar();
	const orgSlug = orgId ?? organization?.slug;

	const { data: project, isLoading: projectLoading } =
		api.projects.getById.useQuery(
			{ id: projectId ? Number(projectId) : 0 },
			{
				enabled:
					!!projectId &&
					typeof projectId === "string" &&
					!Number.isNaN(Number(projectId)),
			},
		);

	const projectLinks: NavLink[] = [
		{
			label: "Dashboard",
			href: `/api-platform/orgs/${orgSlug}/projects/${projectId}`,
			icon: <MdDashboard className="h-5 w-5" />,
		},
		{
			label: "Quickstart",
			href: `/api-platform/orgs/${orgSlug}/projects/${projectId}/quickstart`,
			icon: <MdPlayArrow className="h-5 w-5" />,
		},
		{
			label: "API Keys",
			href: `/api-platform/orgs/${orgSlug}/projects/${projectId}/api-keys`,
			icon: <MdKey className="h-5 w-5" />,
		},
		{
			label: "Settings",
			href: `/api-platform/orgs/${orgSlug}/projects/${projectId}/settings`,
			icon: <MdSettings className="h-5 w-5" />,
		},
	];

	return (
		<Sidebar collapsible="icon" className="h-screen">
			<SidebarHeader className="flex items-center px-4 py-2">
				{state === "collapsed" ? (
					<Link href={`/api-platform/orgs/${orgSlug}`}>
						<SocialLogo width={32} height={32} className="h-8 w-8" />
					</Link>
				) : (
					<div className="flex w-full items-center gap-2 overflow-hidden">
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
				)}
			</SidebarHeader>
			<SidebarSeparator />

			<SidebarContent>
				<SidebarMenu>
					{projectLinks.map((link) => (
						<SidebarMenuItem key={link.label}>
							<SidebarMenuButton asChild>
								<Link
									href={link.href}
									id={`${link.label.toLowerCase().replace(" ", "-")}-nav`}
								>
									{link.icon}
									<span>{link.label}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>

			<ApiSidebarNavFooter />
			<SidebarRail />
		</Sidebar>
	);
}
