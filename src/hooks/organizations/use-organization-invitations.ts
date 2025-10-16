import { api } from "@/trpc/react";

export const useOrganizationInvitations = (organizationId: string) => {
	return api.organizations.listInvitations.useQuery(
		{ organizationId },
		{
			enabled: !!organizationId,
			staleTime: 5 * 60 * 1000,
		},
	);
};
