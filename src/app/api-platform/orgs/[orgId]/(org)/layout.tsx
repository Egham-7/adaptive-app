"use client";

import { OrganizationTopbar } from "@/app/_components/api-platform/organizations/organization-topbar";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col">
			<OrganizationTopbar />
			<main className="flex-1">{children}</main>
		</div>
	);
}
