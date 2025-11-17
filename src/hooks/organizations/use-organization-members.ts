import { api } from "@/trpc/react";

export function useOrganizationMembers(organizationId: string) {
	return api.organizations.listMembers.useQuery({ organizationId });
}
