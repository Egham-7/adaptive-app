import { toast } from "sonner";
import { api } from "@/trpc/react";

export const useUpdateProjectMemberRole = () => {
	const utils = api.useUtils();

	return api.projects.updateMemberRole.useMutation({
		onMutate: async (variables) => {
			await utils.projects.listMembers.cancel({
				projectId: variables.projectId,
			});

			const previousMembers = utils.projects.listMembers.getData({
				projectId: variables.projectId,
			});

			utils.projects.listMembers.setData(
				{ projectId: variables.projectId },
				(old) => {
					if (!old) return old;
					return old.map((m) =>
						m.user_id === variables.userId ? { ...m, role: variables.role } : m,
					);
				},
			);

			return { previousMembers, projectId: variables.projectId };
		},
		onSuccess: (_data, variables) => {
			toast.success("Member role updated successfully!");
			utils.projects.listMembers.invalidate({ projectId: variables.projectId });
			utils.projects.getById.invalidate({ id: variables.projectId });
		},
		onError: (error, _variables, context) => {
			toast.error(error.message || "Failed to update member role");
			if (context?.previousMembers && context.projectId) {
				utils.projects.listMembers.setData(
					{ projectId: context.projectId },
					context.previousMembers,
				);
			}
		},
		onSettled: (_data, _error, variables) => {
			utils.projects.listMembers.invalidate({ projectId: variables.projectId });
			utils.projects.getById.invalidate({ id: variables.projectId });
		},
	});
};
