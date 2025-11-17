import { api } from "@/trpc/react";

export function useUpdateOrganizationMemberRole() {
	return api.organizations.updateMemberRole.useMutation();
}
