import { api } from "@/trpc/react";

export function usePendingOrganizationInvitations(organizationId: string) {
	return api.organizations.listInvitations.useQuery({ organizationId });
}
