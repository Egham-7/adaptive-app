import { toast } from "sonner";
import { api } from "@/trpc/react";

export const useCreateOrganizationInvitation = () => {
	const utils = api.useUtils();

	return api.organizations.createInvitation.useMutation({
		onSuccess: (_data, variables) => {
			toast.success("Invitation sent successfully!");
			utils.organizations.listInvitations.invalidate({
				organizationId: variables.organizationId,
			});
		},
		onError: (error) => {
			toast.error(error.message || "Failed to send invitation");
		},
	});
};
