"use client";

import { useOrganization } from "@clerk/nextjs";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { MdDashboard, MdKey, MdPlayArrow } from "react-icons/md";
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
import { Skeleton } from "@/components/ui/skeleton";
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
			{ id: projectId || "" },
			{
				enabled:
					!!projectId && typeof projectId === "string" && projectId.length > 0,
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
	];

	const organizationLinks: NavLink[] = [
		{
			label: "Billing",
			href: `/api-platform/orgs/${orgSlug}?tab=credits`,
			icon: <CreditCard className="h-5 w-5" />,
		},
	];

	return (
		<Sidebar collapsible="icon" className="h-screen">
			<SidebarHeader className="flex items-center px-4 py-2">
				{state === "collapsed" ? (
					<SocialLogo width={32} height={32} className="h-8 w-8" />
				) : (
					<div className="flex w-full items-center gap-2 overflow-hidden">
						<SocialLogo width={60} height={20} className="shrink-0" />
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

				<SidebarSeparator />

				<SidebarMenu>
					{organizationLinks.map((link) => (
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
