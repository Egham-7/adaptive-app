import { OrganizationList } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ProjectsList } from "@/app/_components/api-platform/organizations/projects-list";

export default async function OrganizationPage({
	params,
}: {
	params: Promise<{ orgId: string }>;
}) {
	const { orgSlug, orgId } = await auth();
	const { orgId: paramOrgId } = await params;

	if (paramOrgId !== orgSlug) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<p className="mb-4 text-lg">
						Sorry, organization {paramOrgId} is not valid.
					</p>
					<OrganizationList
						afterCreateOrganizationUrl="/api-platform/orgs/:slug"
						afterSelectOrganizationUrl="/api-platform/orgs/:slug"
					/>
				</div>
			</div>
		);
	}

	if (!orgId) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<OrganizationList
					afterCreateOrganizationUrl="/api-platform/orgs/:slug"
					afterSelectOrganizationUrl="/api-platform/orgs/:slug"
				/>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-8 py-8">
			<ProjectsList organizationId={orgId} />
		</div>
	);
}
