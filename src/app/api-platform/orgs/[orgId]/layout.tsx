"use client";

import { useParams } from "next/navigation";
import { OrganizationSidebar } from "@/app/_components/api-platform/organizations/organization-sidebar";
import { ProjectSidebar } from "@/app/_components/api-platform/organizations/projects/project-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function OrganizationLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const params = useParams<{ projectId?: string }>();
	const isProjectRoute = !!params?.projectId;

	return (
		<SidebarProvider>
			{isProjectRoute ? <ProjectSidebar /> : <OrganizationSidebar />}
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}
