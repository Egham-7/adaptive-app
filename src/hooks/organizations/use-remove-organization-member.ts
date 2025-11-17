import { api } from "@/trpc/react";

export function useRemoveOrganizationMember() {
	return api.organizations.removeMember.useMutation();
}
