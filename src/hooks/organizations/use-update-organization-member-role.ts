import { toast } from "sonner";
import { api } from "@/trpc/react";

export const useUpdateOrganizationMemberRole = () => {
	const utils = api.useUtils();

	return api.organizations.updateMemberRole.useMutation({
		onMutate: async (variables) => {
			await utils.organizations.listMembers.cancel({
				organizationId: variables.organizationId,
			});

			const previousMembers = utils.organizations.listMembers.getData({
				organizationId: variables.organizationId,
			});

			utils.organizations.listMembers.setData(
				{ organizationId: variables.organizationId },
				(old) => {
					if (!old) return old;
					return {
						...old,
						members: old.members.map((m) =>
							m.userId === variables.userId
								? { ...m, role: variables.role }
								: m,
						),
					};
				},
			);

			return { previousMembers, organizationId: variables.organizationId };
		},
		onSuccess: (_data, variables) => {
			toast.success("Member role updated successfully!");
			utils.organizations.listMembers.invalidate({
				organizationId: variables.organizationId,
			});
		},
		onError: (error, _variables, context) => {
			toast.error(error.message || "Failed to update member role");
			if (context?.previousMembers && context.organizationId) {
				utils.organizations.listMembers.setData(
					{ organizationId: context.organizationId },
					context.previousMembers,
				);
			}
		},
		onSettled: (_data, _error, variables) => {
			utils.organizations.listMembers.invalidate({
				organizationId: variables.organizationId,
			});
		},
	});
};
