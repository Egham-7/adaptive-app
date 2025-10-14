"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useSmartRedirect() {
	const [redirectPath, setRedirectPath] = useState<string | null>(null);
	const { isLoaded: orgsLoaded } = useOrganizationList({
		userMemberships: {
			infinite: true,
		},
	});

	useEffect(() => {
		if (!orgsLoaded) return;

		setRedirectPath("/api-platform/orgs");
	}, [orgsLoaded]);

	return redirectPath;
}
