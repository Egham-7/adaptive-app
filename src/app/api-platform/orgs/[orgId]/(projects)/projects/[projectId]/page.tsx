import { redirect } from "next/navigation";

interface PageProps {
	params: Promise<{
		orgId: string;
		projectId: string;
	}>;
}

export default async function ProjectPage({ params }: PageProps) {
	const { orgId, projectId } = await params;
	redirect(`/api-platform/orgs/${orgId}/projects/${projectId}/architecture`);
}
