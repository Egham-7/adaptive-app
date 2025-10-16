import { api } from "@/trpc/react";

export const useOrganizationMembers = (organizationId: string) => {
	return api.organizations.listMembers.useQuery(
		{ organizationId },
		{
			enabled: !!organizationId,
			staleTime: 5 * 60 * 1000,
		},
	);
};
