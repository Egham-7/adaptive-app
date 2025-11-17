import { api } from "@/trpc/react";

export function useCreateOrganization() {
	return api.organizations.create.useMutation();
}
