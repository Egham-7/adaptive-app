import { OrganizationList } from "@clerk/nextjs";

export default function OrganizationListPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<OrganizationList
				afterCreateOrganizationUrl="/api-platform/orgs/:slug"
				afterSelectOrganizationUrl="/api-platform/orgs/:slug"
			/>
		</div>
	);
}
