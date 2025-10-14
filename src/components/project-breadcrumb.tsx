"use client";

import { useOrganization } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

interface ProjectBreadcrumbProps {
	className?: string;
}

export function ProjectBreadcrumb({ className }: ProjectBreadcrumbProps) {
	const params = useParams<{
		projectId: string;
	}>();

	const projectId = params?.projectId as string | undefined;
	const { organization, isLoaded: orgLoaded } = useOrganization();

	const { data: project, isLoading: projectLoading } =
		api.projects.getById.useQuery(
			{ id: projectId || "" },
			{
				enabled:
					!!projectId && typeof projectId === "string" && projectId.length > 0,
			},
		);

	if (!orgLoaded || projectLoading) {
		return <Skeleton className="h-6 w-80" />;
	}

	if (!organization || !project?.name) {
		return null;
	}

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<Link
				href={`/api-platform/orgs/${organization.slug}`}
				className="hover:underline"
			>
				{organization.name}
			</Link>
			<span className="text-muted-foreground">/</span>
			<span className="font-medium">{project.name}</span>
		</div>
	);
}
