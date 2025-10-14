"use client";

import { useOrganization } from "@clerk/nextjs";
import { Building2, CreditCard, FolderKanban } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
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

interface NavLink {
	label: string;
	href: string;
	icon: ReactNode;
}

export function OrganizationSidebar() {
	const { orgId } = useParams<{
		orgId: string;
	}>();
	const { organization } = useOrganization();
	const { state } = useSidebar();
	const orgSlug = orgId ?? organization?.slug;

	const organizationLinks: NavLink[] = [
		{
			label: "Projects",
			href: `/api-platform/orgs/${orgSlug}`,
			icon: <FolderKanban className="h-5 w-5" />,
		},
		{
			label: "Billing",
			href: `/api-platform/orgs/${orgSlug}?tab=credits`,
			icon: <CreditCard className="h-5 w-5" />,
		},
		{
			label: "Settings",
			href: `/api-platform/orgs/${orgSlug}/settings`,
			icon: <Building2 className="h-5 w-5" />,
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
						<span className="text-muted-foreground">/</span>
						<div className="shrink-0">
							<OrganizationSwitcher />
						</div>
					</div>
				)}
			</SidebarHeader>
			<SidebarSeparator />

			<SidebarContent>
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
