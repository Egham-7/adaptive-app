import { toast } from "sonner";
import { api } from "@/trpc/react";

export const useRevokeOrganizationInvitation = () => {
	const utils = api.useUtils();

	return api.organizations.revokeInvitation.useMutation({
		onSuccess: (_data, variables) => {
			toast.success("Invitation revoked successfully!");
			utils.organizations.listInvitations.invalidate({
				organizationId: variables.organizationId,
			});
		},
		onError: (error) => {
			toast.error(error.message || "Failed to revoke invitation");
		},
	});
};
