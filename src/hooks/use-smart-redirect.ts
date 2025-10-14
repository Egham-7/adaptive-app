"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";

export function useSmartRedirect() {
	const [redirectPath, setRedirectPath] = useState<string | null>(null);
	const { data: mostRecentProject, isLoading } =
		api.projects.getMostRecent.useQuery();
	const { userMemberships, isLoaded: orgsLoaded } = useOrganizationList({
		userMemberships: {
			infinite: true,
		},
	});

	useEffect(() => {
		if (isLoading || !orgsLoaded) return;

		if (mostRecentProject) {
			const org = userMemberships.data?.find(
				(m) => m.organization.id === mostRecentProject.organizationId,
			);
			if (org?.organization.slug) {
				const path = `/api-platform/orgs/${org.organization.slug}/projects/${mostRecentProject.id}`;
				setRedirectPath(path);
			} else {
				setRedirectPath("/api-platform/orgs");
			}
		} else {
			setRedirectPath("/api-platform/orgs");
		}
	}, [mostRecentProject, isLoading, userMemberships.data, orgsLoaded]);

	return redirectPath;
}
