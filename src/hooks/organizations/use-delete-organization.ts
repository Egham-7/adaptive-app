import { api } from "@/trpc/react";

export function useDeleteOrganization() {
	return api.organizations.delete.useMutation();
}
