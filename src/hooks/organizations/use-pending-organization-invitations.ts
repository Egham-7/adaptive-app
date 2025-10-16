import { useOrganizationInvitations } from "./use-organization-invitations";

export const usePendingOrganizationInvitations = (organizationId: string) => {
	const query = useOrganizationInvitations(organizationId);

	return {
		...query,
		data: query.data
			? {
					invitations: query.data.invitations.filter(
						(inv) => inv.status === "pending",
					),
				}
			: undefined,
	};
};
