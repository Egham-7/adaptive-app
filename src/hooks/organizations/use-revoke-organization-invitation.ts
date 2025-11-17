import { api } from "@/trpc/react";

export function useRevokeOrganizationInvitation() {
	return api.organizations.revokeInvitation.useMutation();
}
