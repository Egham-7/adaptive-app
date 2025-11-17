import { api } from "@/trpc/react";

export function useCreateOrganizationInvitation() {
	return api.organizations.createInvitation.useMutation();
}
